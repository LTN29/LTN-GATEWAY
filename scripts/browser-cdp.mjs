import { randomBytes } from "node:crypto";
import { connect as connectTls } from "node:tls";
import { createConnection as createTcpConnection } from "node:net";
import { mkdir, rename, stat } from "node:fs/promises";
import { existsSync, readdirSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { join, posix, win32 } from "node:path";

function pathApi(platform) {
  return platform === "win32" ? win32 : posix;
}

function safeRealpath(path) {
  try { return realpathSync(path); } catch { return path; }
}

// Single source of truth for which browser SIMI launches on Windows, macOS and Linux.
export function findBrowserExecutable({
  platform = process.platform,
  env = process.env,
  exists = existsSync,
  realpath = safeRealpath,
  home = env.HOME || env.USERPROFILE || homedir()
} = {}) {
  const p = pathApi(platform);
  const describe = (path) => {
    const resolvedPath = realpath(path);
    const viaSnapBin = path.startsWith("/snap/bin/");
    const isSnap = platform === "linux" && (
      viaSnapBin ||
      String(resolvedPath).endsWith("/usr/bin/snap") ||
      String(resolvedPath).startsWith("/snap/") ||
      (/(?:^|\/)chromium(?:-browser)?$/.test(path) && exists("/snap/chromium/current"))
    );
    const snapName = isSnap ? (viaSnapBin ? p.basename(path) : "chromium") : null;
    return { path, resolvedPath, kind: isSnap ? "snap" : "native", snapName };
  };
  if (env.LTN_CHROME_BIN) return describe(env.LTN_CHROME_BIN);

  let candidates = [];
  if (platform === "win32") {
    candidates = [
      [env.PROGRAMFILES, "Google", "Chrome", "Application", "chrome.exe"],
      [env["PROGRAMFILES(X86)"], "Google", "Chrome", "Application", "chrome.exe"],
      [env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe"],
      [env.PROGRAMFILES, "Microsoft", "Edge", "Application", "msedge.exe"],
      [env["PROGRAMFILES(X86)"], "Microsoft", "Edge", "Application", "msedge.exe"],
      [env.LOCALAPPDATA, "Microsoft", "Edge", "Application", "msedge.exe"],
      [env.LOCALAPPDATA, "Chromium", "Application", "chrome.exe"]
    ].filter(([root]) => root).map((parts) => p.join(...parts));
  } else if (platform === "darwin") {
    const apps = [
      ["Google Chrome.app", "Google Chrome"],
      ["Microsoft Edge.app", "Microsoft Edge"],
      ["Brave Browser.app", "Brave Browser"],
      ["Chromium.app", "Chromium"],
      ["Google Chrome Canary.app", "Google Chrome Canary"]
    ];
    candidates = ["/Applications", p.join(home, "Applications")].flatMap((root) =>
      apps.map(([bundle, binary]) => p.join(root, bundle, "Contents", "MacOS", binary)));
  } else {
    // Prefer native packages: snap Chromium cannot use hidden profile folders.
    const names = [
      "google-chrome-stable", "google-chrome", "microsoft-edge-stable", "microsoft-edge",
      "brave-browser", "chromium", "chromium-browser"
    ];
    const dirs = [...new Set([...String(env.PATH || "").split(":").filter(Boolean), "/snap/bin"])];
    candidates = names.flatMap((name) => dirs.map((dir) => p.join(dir, name)));
  }
  const found = candidates.find((candidate) => exists(candidate));
  return found ? describe(found) : null;
}

export function resolveBrowserProfile({
  browser = null,
  platform = process.platform,
  env = process.env,
  home = env.HOME || env.USERPROFILE || homedir()
} = {}) {
  if (env.LTN_CHROME_DEBUG_USER_DATA_DIR) return env.LTN_CHROME_DEBUG_USER_DATA_DIR;
  const p = pathApi(platform);
  if (browser?.kind === "snap") {
    // Snap confinement only allows writing inside ~/snap/<name>/common.
    return p.join(home, "snap", browser.snapName || "chromium", "common", "simi-chrome-profile");
  }
  return p.join(env.CODEX_HOME || p.join(home, ".codex"), "chrome-profile");
}

function listDir(path) {
  try { return readdirSync(path); } catch { return []; }
}

// Codex starts MCP servers with a minimal environment that omits DISPLAY and
// WAYLAND_DISPLAY. Recover the user's desktop session from its sockets so
// SIMI Chrome opens visibly instead of falling back to headless mode.
export function resolveDesktopEnv({
  platform = process.platform,
  env = process.env,
  uid = typeof process.getuid === "function" ? process.getuid() : null,
  exists = existsSync,
  readdir = listDir
} = {}) {
  if (platform !== "linux") return { ...env };
  const result = { ...env };
  if (!result.XDG_RUNTIME_DIR && uid !== null && exists(`/run/user/${uid}`)) {
    result.XDG_RUNTIME_DIR = `/run/user/${uid}`;
  }
  const runtime = result.XDG_RUNTIME_DIR;
  if (!result.WAYLAND_DISPLAY && runtime) {
    const socket = readdir(runtime).filter((name) => /^wayland-\d+$/.test(name)).sort()[0];
    if (socket) result.WAYLAND_DISPLAY = socket;
  }
  if (!result.DISPLAY) {
    const x11 = readdir("/tmp/.X11-unix").filter((name) => /^X\d+$/.test(name)).sort()[0];
    if (x11) result.DISPLAY = `:${x11.slice(1)}`;
  }
  if (!result.DBUS_SESSION_BUS_ADDRESS && runtime && exists(`${runtime}/bus`)) {
    result.DBUS_SESSION_BUS_ADDRESS = `unix:path=${runtime}/bus`;
  }
  if (!result.XAUTHORITY && result.DISPLAY) {
    const home = result.HOME || homedir();
    const candidates = [`${home}/.Xauthority`];
    if (runtime) {
      candidates.push(`${runtime}/gdm/Xauthority`);
      for (const name of readdir(runtime)) {
        if (/^\.mutter-Xwaylandauth\./.test(name)) candidates.push(`${runtime}/${name}`);
      }
    }
    const found = candidates.find((path) => exists(path));
    if (found) result.XAUTHORITY = found;
  }
  return result;
}

export function isHeadlessBrowserSession({ platform = process.platform, env = process.env, ...probe } = {}) {
  if (env.LTN_CHROME_HEADLESS === "1") return true;
  if (env.LTN_CHROME_HEADLESS === "0") return false;
  if (platform !== "linux") return false;
  const desktop = resolveDesktopEnv({ platform, env, ...probe });
  return !desktop.DISPLAY && !desktop.WAYLAND_DISPLAY;
}

export function browserLaunchArgs({
  port = 9222,
  profile,
  url = "",
  platform = process.platform,
  env = process.env,
  isRoot = typeof process.getuid === "function" && process.getuid() === 0
} = {}) {
  const args = [
    `--remote-debugging-port=${port}`,
    "--remote-debugging-address=127.0.0.1",
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-dev-shm-usage"
  ];
  if (platform === "linux") {
    if (isRoot) args.push("--no-sandbox");
    if (resolveDesktopEnv({ platform, env }).WAYLAND_DISPLAY) args.push("--ozone-platform-hint=auto");
  }
  if (isHeadlessBrowserSession({ platform, env })) args.push("--headless=new");
  if (url) args.push(url);
  return args;
}

function withTimeout(promise, timeoutMs, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function websocketFrame(payload, opcode = 1) {
  const body = Buffer.from(payload);
  const mask = randomBytes(4);
  let header;
  if (body.length < 126) {
    header = Buffer.from([0x80 | opcode, 0x80 | body.length]);
  } else if (body.length <= 0xffff) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(body.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(body.length), 2);
  }

  const masked = Buffer.alloc(body.length);
  for (let index = 0; index < body.length; index += 1) {
    masked[index] = body[index] ^ mask[index % 4];
  }
  return Buffer.concat([header, mask, masked]);
}

class WebSocketConnection {
  constructor(url, timeoutMs) {
    this.url = new URL(url);
    this.timeoutMs = timeoutMs;
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    this.handshakeComplete = false;
    this.fragmented = [];
    this.queue = [];
    this.waiters = [];
    this.closed = false;
  }

  async connect() {
    if (!this.url.hostname || !["ws:", "wss:"].includes(this.url.protocol)) {
      throw new Error("CDP websocket URL không hợp lệ.");
    }
    const port = Number(this.url.port || (this.url.protocol === "wss:" ? 443 : 80));
    const options = {
      host: this.url.hostname,
      port,
      ...(this.url.protocol === "wss:" ? { servername: this.url.hostname } : {})
    };
    const socket = this.url.protocol === "wss:"
      ? connectTls(options)
      : createTcpConnection(options);
    this.socket = socket;
    socket.on("data", (chunk) => this.consume(chunk));
    socket.on("error", (error) => this.fail(error));
    socket.on("close", () => this.fail(new Error("CDP websocket đã đóng.")));

    await withTimeout(new Promise((resolve, reject) => {
      const event = this.url.protocol === "wss:" ? "secureConnect" : "connect";
      const onConnect = () => {
        socket.off("error", reject);
        resolve();
      };
      socket.once(event, onConnect);
      socket.once("error", reject);
    }), this.timeoutMs, "Không kết nối được tới CDP websocket.");

    const key = randomBytes(16).toString("base64");
    const path = `${this.url.pathname || "/"}${this.url.search || ""}`;
    const handshake = new Promise((resolve, reject) => {
      this.waiters.push({
        handshake: true,
        resolve,
        reject
      });
    });
    socket.write([
      `GET ${path} HTTP/1.1`,
      `Host: ${this.url.host}`,
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Key: ${key}`,
      "Sec-WebSocket-Version: 13",
      "\r\n"
    ].join("\r\n"));

    await withTimeout(handshake, this.timeoutMs, "CDP websocket không hoàn tất handshake.");
    return this;
  }

  consume(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    if (!this.handshakeComplete) {
      const marker = this.buffer.indexOf(Buffer.from("\r\n\r\n"));
      if (marker < 0) return;
      const response = this.buffer.subarray(0, marker).toString("ascii");
      this.buffer = this.buffer.subarray(marker + 4);
      if (!/^HTTP\/1\.1 101\b/m.test(response)) {
        this.fail(new Error(`CDP websocket handshake bị từ chối: ${response.split("\r\n")[0]}`));
        return;
      }
      this.handshakeComplete = true;
      const handshake = this.waiters.find((item) => item.handshake);
      if (handshake) {
        this.waiters.splice(this.waiters.indexOf(handshake), 1);
        handshake.resolve();
      }
    }

    while (this.buffer.length >= 2) {
      const first = this.buffer[0];
      const second = this.buffer[1];
      const opcode = first & 0x0f;
      const fin = Boolean(first & 0x80);
      const masked = Boolean(second & 0x80);
      let length = second & 0x7f;
      let headerLength = 2;
      if (length === 126) {
        if (this.buffer.length < 4) return;
        length = this.buffer.readUInt16BE(2);
        headerLength = 4;
      } else if (length === 127) {
        if (this.buffer.length < 10) return;
        const longLength = this.buffer.readBigUInt64BE(2);
        if (longLength > BigInt(Number.MAX_SAFE_INTEGER)) {
          this.fail(new Error("CDP websocket frame quá lớn."));
          return;
        }
        length = Number(longLength);
        headerLength = 10;
      }
      const maskLength = masked ? 4 : 0;
      const frameLength = headerLength + maskLength + length;
      if (this.buffer.length < frameLength) return;

      let payloadStart = headerLength;
      let mask = null;
      if (masked) {
        mask = this.buffer.subarray(payloadStart, payloadStart + 4);
        payloadStart += 4;
      }
      const payload = Buffer.from(this.buffer.subarray(payloadStart, payloadStart + length));
      this.buffer = this.buffer.subarray(frameLength);
      if (mask) {
        for (let index = 0; index < payload.length; index += 1) {
          payload[index] ^= mask[index % 4];
        }
      }

      if (opcode === 0x9) {
        this.socket?.write(websocketFrame(payload, 0xA));
        continue;
      }
      if (opcode === 0x8) {
        this.fail(new Error("CDP websocket đã đóng."));
        return;
      }
      if (opcode === 0x0) {
        this.fragmented.push(payload);
        if (!fin) continue;
        this.dispatch(Buffer.concat(this.fragmented).toString("utf8"));
        this.fragmented = [];
        continue;
      }
      if (opcode === 0x1 || opcode === 0x2) {
        if (fin) this.dispatch(payload.toString("utf8"));
        else this.fragmented = [payload];
      }
    }
  }

  dispatch(text) {
    let message;
    try {
      message = JSON.parse(text);
    } catch {
      return;
    }
    const waiter = this.waiters.find((item) => !item.handshake && item.predicate(message));
    if (waiter) {
      this.waiters.splice(this.waiters.indexOf(waiter), 1);
      waiter.resolve(message);
    } else {
      this.queue.push(message);
    }
  }

  fail(error) {
    if (this.closed) return;
    this.closed = true;
    for (const waiter of this.waiters.splice(0)) waiter.reject(error);
    this.socket?.destroy();
  }

  waitFor(predicate) {
    const index = this.queue.findIndex(predicate);
    if (index >= 0) return Promise.resolve(this.queue.splice(index, 1)[0]);
    return withTimeout(new Promise((resolve, reject) => {
      this.waiters.push({ predicate, resolve, reject });
    }), this.timeoutMs, "CDP không trả kết quả trong thời gian cho phép.");
  }

  async command(method, params = {}) {
    const id = WebSocketConnection.nextId += 1;
    const response = this.waitFor((message) => message.id === id);
    this.socket.write(websocketFrame(JSON.stringify({ id, method, params })));
    const result = await response;
    if (result.error) throw new Error(`CDP ${method}: ${result.error.message || "lỗi không xác định"}`);
    return result.result;
  }

  close() {
    this.closed = true;
    try { this.socket?.write(websocketFrame("", 0x8)); } catch {}
    this.socket?.destroy();
  }
}

WebSocketConnection.nextId = 0;

export async function cdpTargets({ host = "127.0.0.1", port = 9222, timeoutMs = 5_000 } = {}) {
  let response;
  try {
    response = await fetch(`http://${host}:${port}/json/list`, {
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "manual"
    });
  } catch (error) {
    const code = error?.cause?.code || error?.code || "";
    throw new Error(`Không kết nối được Chrome CDP tại ${host}:${port}${code ? ` (${code})` : ""}.`);
  }
  if (!response.ok) throw new Error(`Chrome CDP trả HTTP ${response.status}.`);
  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

export async function cdpBrowserVersion({ host = "127.0.0.1", port = 9222, timeoutMs = 1_500 } = {}) {
  const response = await fetch(`http://${host}:${port}/json/version`, {
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "manual"
  });
  if (!response.ok) throw new Error(`Chrome CDP returned HTTP ${response.status}.`);
  return response.json();
}

export function isHeadlessBrowserVersion(version) {
  return /HeadlessChrome/i.test(`${version?.Browser || ""} ${version?.["User-Agent"] || ""}`);
}

// Close a headless SIMI Chrome so it can be relaunched visibly on the same profile.
export async function closeCdpBrowser({ host = "127.0.0.1", port = 9222, timeoutMs = 5_000 } = {}) {
  const version = await cdpBrowserVersion({ host, port, timeoutMs });
  const connection = await new WebSocketConnection(version.webSocketDebuggerUrl, timeoutMs).connect();
  try { await connection.command("Browser.close"); } catch {} finally { connection.close(); }
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try { await cdpBrowserVersion({ host, port, timeoutMs: 500 }); } catch { return true; }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return false;
}

export async function activateCdpTarget({ host = "127.0.0.1", port = 9222, targetId, timeoutMs = 5_000 } = {}) {
  if (!targetId) return false;
  try {
    const response = await fetch(`http://${host}:${port}/json/activate/${encodeURIComponent(targetId)}`, {
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "manual"
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function createCdpTarget({ host = "127.0.0.1", port = 9222, targetUrl, timeoutMs = 5_000 } = {}) {
  const wanted = String(targetUrl || "").trim();
  if (!/^https?:\/\//i.test(wanted)) throw new Error("URL CDP mới không hợp lệ.");
  let response;
  try {
    response = await fetch(`http://${host}:${port}/json/new?${encodeURIComponent(wanted)}`, {
      method: "PUT",
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "manual"
    });
  } catch (error) {
    const code = error?.cause?.code || error?.code || "";
    throw new Error(`Không mở được tab CDP mới tại ${host}:${port}${code ? ` (${code})` : ""}.`);
  }
  if (!response.ok) throw new Error(`Chrome CDP không mở được tab mới (HTTP ${response.status}).`);
  const target = await response.json();
  if (!target || target.type !== "page" || typeof target.webSocketDebuggerUrl !== "string") {
    throw new Error("Chrome CDP trả về tab mới không hợp lệ.");
  }
  return target;
}

function targetMatchesUrl(target, targetUrl = "") {
  const wanted = String(targetUrl || "").trim();
  if (!wanted) return false;
  const actual = String(target?.url || "");
  return actual === wanted || actual.startsWith(wanted);
}

export function resolveNavigationUrl(value) {
  const original = String(value || "").trim();
  let parsed;
  try { parsed = new URL(original); } catch { return original; }
  const host = parsed.hostname.toLowerCase();
  const isFacebookRedirect = ["l.facebook.com", "lm.facebook.com"].includes(host) ||
    (/facebook\.com$/.test(host) && /\/(?:l\.php|flx\/warn)\/?$/i.test(parsed.pathname));
  if (!isFacebookRedirect) return original;
  for (const key of ["u", "href"]) {
    const nested = parsed.searchParams.get(key);
    if (/^https?:\/\//i.test(String(nested || ""))) return nested;
  }
  return original;
}

export function isLikelyRedirectUrl(value) {
  let parsed;
  try { parsed = new URL(String(value || "")); } catch { return false; }
  const host = parsed.hostname.toLowerCase();
  if ([
    "bit.ly", "tinyurl.com", "t.co", "fb.watch", "vt.tiktok.com",
    "vm.tiktok.com", "youtu.be", "shorturl.at"
  ].includes(host)) return true;
  return /(?:^|\.)tiktok\.com$/.test(host) && /^\/t\//i.test(parsed.pathname);
}

function chooseTarget(targets, targetUrl = "") {
  const pages = targets.filter((target) =>
    target?.type === "page" &&
    /^https?:\/\//i.test(String(target.url || "")) &&
    typeof target.webSocketDebuggerUrl === "string"
  );
  if (!pages.length) throw new Error("Chrome CDP không có tab HTTP/HTTPS để đọc.");
  const wanted = String(targetUrl || "").trim();
  if (wanted) {
    const matching = pages.find((target) => targetMatchesUrl(target, wanted));
    if (matching) return matching;
  }
  return pages[0];
}

const pageEvaluationExpression = `(() => ({
  url: location.href,
  title: document.title,
  text: document.body?.innerText || document.documentElement?.innerText || "",
  selectedText: window.getSelection?.()?.toString?.() || "",
  readyState: document.readyState,
  loginRequired: Boolean(document.querySelector('input[type="password"]')) || /(?:^|\\/)(?:login|signin|sign-in|auth)(?:\\/|$|[?#])/i.test(location.href)
}))()`;

const pageMetadataExpression = `(() => {
  const bodyText = document.body?.innerText || document.documentElement?.innerText || "";
  const publishedAtCandidates = [...document.querySelectorAll(
    'meta[property="article:published_time"], meta[name="article:published_time"], time[datetime], [data-utime]'
  )].slice(0, 100).map((element) => {
    const epoch = element.getAttribute('data-utime');
    if (epoch && /^\\d+$/.test(epoch)) return new Date(Number(epoch) * 1000).toISOString();
    return element.getAttribute('content') || element.getAttribute('datetime') || element.textContent || '';
  }).map((value) => String(value).trim()).filter(Boolean);
  const scriptText = [...document.scripts].slice(0, 200).map((script) => script.textContent || '').join('\\n').slice(0, 3000000);
  for (const match of scriptText.matchAll(/"createTime"\\s*:\\s*"?(\\d{9,13})"?/g)) {
    const raw = Number(match[1]);
    if (!Number.isFinite(raw)) continue;
    const milliseconds = raw > 9999999999 ? raw : raw * 1000;
    try { publishedAtCandidates.push(new Date(milliseconds).toISOString()); } catch {}
    if (publishedAtCandidates.length >= 100) break;
  }
  const loginRequired = Boolean(document.querySelector('input[type="password"]')) || /(?:^|\\/)(?:login|signin|sign-in|auth)(?:\\/|$|[?#])/i.test(location.href);
  const blocked = /(?:checkpoint|captcha|verify\\/traffic|verify\\/captcha|temporarily blocked|content isn't available|content is not available|page isn't available)/i.test(location.href + '\\n' + bodyText);
  return {
    publishedAtCandidates,
    loginRequired,
    accessStatus: loginRequired ? 'login-required' : blocked ? 'blocked' : 'ok'
  };
})()`;

const frameEvaluationExpression = `(() => {
  const bodyText = document.body?.innerText || document.documentElement?.innerText || "";
  const semanticText = [...document.querySelectorAll(
    '[role="gridcell"], [role="rowheader"], [role="columnheader"], [role="cell"], [aria-label]'
  )].slice(0, 20000).map((element) => {
    const label = element.getAttribute('aria-label') || '';
    const value = element.getAttribute('aria-valuetext') || element.getAttribute('aria-valuenow') || '';
    const text = element.innerText || element.textContent || '';
    return [label, value, text].map((item) => String(item).trim()).filter(Boolean).join(' | ');
  }).filter(Boolean).join('\\n');
  return {
    url: location.href,
    title: document.title,
    text: bodyText.slice(0, 500000),
    semanticText: semanticText.slice(0, 500000),
    selectedText: window.getSelection?.()?.toString?.() || "",
    readyState: document.readyState,
    loginRequired: Boolean(document.querySelector('input[type="password"]')) || /(?:^|\\/)(?:login|signin|sign-in|auth)(?:\\/|$|[?#])/i.test(location.href)
  };
})()`;

export function validateBrowserEvaluationExpressions() {
  for (const expression of [pageEvaluationExpression, pageMetadataExpression, frameEvaluationExpression]) {
    new Function(`return (${expression});`);
  }
  return true;
}

function frameIds(frameTree, result = []) {
  const id = frameTree?.frame?.id;
  if (id) result.push(id);
  for (const child of frameTree?.childFrames || []) frameIds(child, result);
  return result;
}

function cdpValue(value) {
  if (value === undefined || value === null) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function accessibilityText(nodes = []) {
  const lines = [];
  for (const node of nodes) {
    if (node?.ignored) continue;
    const role = cdpValue(node?.role?.value);
    const name = cdpValue(node?.name?.value);
    const value = cdpValue(node?.value?.value);
    const description = cdpValue(node?.description?.value);
    const parts = [role && `[${role}]`, name, value && value !== name ? value : "", description]
      .filter(Boolean);
    if (parts.length > (role ? 1 : 0)) lines.push(parts.join(" "));
  }
  return [...new Set(lines)].join("\n");
}

function mergeTextParts(parts) {
  const seen = new Set();
  const output = [];
  for (const part of parts) {
    const text = String(part || "").trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    output.push(text);
  }
  return output.join("\n\n");
}

async function evaluatePage(connection) {
  const evaluation = await connection.command("Runtime.evaluate", {
    awaitPromise: true,
    returnByValue: true,
    expression: pageEvaluationExpression
  });
  const page = evaluation?.result?.value;
  if (!page || typeof page !== "object") throw new Error("CDP không trả nội dung trang.");
  return page;
}

async function evaluateRichPage(connection) {
  const topPage = await evaluatePage(connection);
  let pageMetadata = { publishedAtCandidates: [], accessStatus: topPage.loginRequired ? "login-required" : "ok" };
  try {
    const metadataEvaluation = await connection.command("Runtime.evaluate", {
      awaitPromise: true,
      returnByValue: true,
      expression: pageMetadataExpression
    });
    const metadata = metadataEvaluation?.result?.value;
    if (metadata && typeof metadata === "object") {
      pageMetadata = {
        publishedAtCandidates: Array.isArray(metadata.publishedAtCandidates) ? metadata.publishedAtCandidates : [],
        loginRequired: Boolean(metadata.loginRequired),
        accessStatus: ["ok", "login-required", "blocked"].includes(metadata.accessStatus)
          ? metadata.accessStatus
          : (metadata.loginRequired ? "login-required" : "ok")
      };
    }
  } catch {
    // Metadata is optional when a page restricts script evaluation.
  }
  const frames = [];
  try {
    const tree = await connection.command("Page.getFrameTree");
    for (const frameId of frameIds(tree?.frameTree)) {
      try {
        const world = await connection.command("Page.createIsolatedWorld", {
          frameId,
          worldName: "simi-browser-reader",
          grantUniveralAccess: false
        });
        const evaluation = await connection.command("Runtime.evaluate", {
          awaitPromise: true,
          returnByValue: true,
          contextId: world?.executionContextId,
          expression: frameEvaluationExpression
        });
        const frame = evaluation?.result?.value;
        if (frame && typeof frame === "object") frames.push(frame);
      } catch {
        // Frames can disappear while Office/SharePoint replaces its viewer.
      }
    }
  } catch {
    // Older CDP endpoints may not expose the frame tree; top-page text remains usable.
  }

  let axText = "";
  let accessibilityNodeCount = 0;
  try {
    const accessibility = await connection.command("Accessibility.getFullAXTree");
    accessibilityNodeCount = Array.isArray(accessibility?.nodes) ? accessibility.nodes.length : 0;
    axText = accessibilityText(accessibility?.nodes);
  } catch {
    // Accessibility extraction is an enhancement, not a requirement for normal pages.
  }

  const text = mergeTextParts([
    topPage.text,
    ...frames.flatMap((frame) => [frame.text, frame.semanticText]),
    axText
  ]);
  const loginRequired = Boolean(topPage.loginRequired || frames.some((frame) => frame.loginRequired));
  return {
    ...topPage,
    ...pageMetadata,
    text,
    selectedText: mergeTextParts([topPage.selectedText, ...frames.map((frame) => frame.selectedText)]),
    loginRequired,
    accessStatus: loginRequired ? "login-required" : pageMetadata.accessStatus,
    extraction: {
      mode: "dom-frames-accessibility",
      frameCount: frames.length,
      accessibilityNodeCount
    }
  };
}

function isOnlineWorkbook(page, requestedUrl = "") {
  const value = `${requestedUrl} ${page?.url || ""} ${page?.title || ""}`;
  return /(?:\.xlsx?\b|\/:x:\/|excel\.officeapps\.live\.com|excel\.cloud\.microsoft)/i.test(value);
}

async function evaluateSettledPage(connection, requestedUrl, timeoutMs) {
  let page;
  const loadDeadline = Date.now() + Math.max(1_000, timeoutMs);
  const contentDeadline = Date.now() + Math.min(Math.max(1_000, timeoutMs), 4_000);
  while (Date.now() < loadDeadline) {
    try {
      page = await evaluateRichPage(connection);
      if (/^chrome-error:/i.test(String(page.url || ""))) {
        throw new Error("Chrome could not load the requested page.");
      }
      // A newly created target can advertise its URL before its DOM leaves about:blank.
      if ((!requestedUrl || /^https?:\/\//i.test(String(page.url || ""))) &&
          ["interactive", "complete"].includes(page.readyState) &&
          (String(page.text || "").trim() || page.loginRequired || page.accessStatus === "blocked" ||
           Date.now() >= contentDeadline)) break;
    } catch (error) {
      if (/Chrome could not load/.test(error.message)) throw error;
      // Navigation can replace the execution context while the page is loading.
      page = null;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (!page || (requestedUrl && !/^https?:\/\//i.test(String(page.url || ""))) ||
      !["interactive", "complete"].includes(page.readyState)) {
    throw new Error("Chrome page did not finish loading; refusing to return a blank page as success.");
  }
  if (!String(page.text || "").trim() && !page.loginRequired && page.accessStatus !== "blocked") {
    page.accessStatus = "empty";
    page.extractionWarning = "The page loaded but exposed no readable text. This is not proof that the source contains no data.";
  }
  if (!isOnlineWorkbook(page, requestedUrl)) return page;

  const deadline = Date.now() + Math.max(1_500, Math.min(timeoutMs, 8_000));
  let stableReads = 0;
  let previousLength = page.text.length;
  while (Date.now() < deadline && stableReads < 2) {
    await new Promise((resolve) => setTimeout(resolve, 750));
    const next = await evaluateRichPage(connection);
    const nextLength = next.text.length;
    stableReads = nextLength === previousLength && nextLength > 0 ? stableReads + 1 : 0;
    previousLength = nextLength;
    page = next;
  }
  return page;
}

async function navigateAndWait(connection, targetUrl, timeoutMs) {
  await connection.command("Page.enable");
  await connection.command("Page.navigate", { url: targetUrl });

  const deadline = Date.now() + Math.max(1_000, Math.min(timeoutMs, 10_000));
  let lastPage = null;
  while (Date.now() < deadline) {
    try {
      lastPage = await evaluatePage(connection);
      if (targetMatchesUrl({ url: lastPage.url }, targetUrl) &&
          ["interactive", "complete"].includes(lastPage.readyState)) {
        return lastPage;
      }
    } catch {
      // The page can briefly disconnect while Chrome commits navigation.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (lastPage && targetMatchesUrl({ url: lastPage.url }, targetUrl)) return lastPage;
  throw new Error(`Chrome không điều hướng đến được trang ${targetUrl}.`);
}

async function navigateAndWaitRedirects(connection, targetUrl, timeoutMs) {
  await connection.command("Page.enable");
  let previousUrl = "";
  try { previousUrl = String((await evaluatePage(connection))?.url || ""); } catch {}
  const directUrl = resolveNavigationUrl(targetUrl);
  const navigation = await connection.command("Page.navigate", { url: directUrl });
  if (navigation?.errorText) throw new Error(`Chrome navigation failed: ${navigation.errorText}`);

  const deadline = Date.now() + Math.max(1_000, Math.min(timeoutMs, 10_000));
  let lastPage = null;
  let stableUrl = "";
  let stableReads = 0;
  while (Date.now() < deadline) {
    try {
      lastPage = await evaluatePage(connection);
      const currentUrl = String(lastPage.url || "");
      const navigationCommitted = /^https?:\/\//i.test(currentUrl) &&
        (targetMatchesUrl({ url: currentUrl }, directUrl) || currentUrl !== previousUrl);
      stableReads = currentUrl === stableUrl ? stableReads + 1 : 0;
      stableUrl = currentUrl;
      if (navigationCommitted && stableReads >= 1 &&
          ["interactive", "complete"].includes(lastPage.readyState)) {
        return lastPage;
      }
    } catch {
      // Redirecting pages can briefly replace the execution context.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (lastPage && /^https?:\/\//i.test(String(lastPage.url || "")) && String(lastPage.url) !== previousUrl) {
    return lastPage;
  }
  throw new Error(`Chrome could not finish navigation to ${targetUrl}.`);
}

async function readTarget(target, targetUrl, timeoutMs, navigate = false) {
  const connection = await new WebSocketConnection(target.webSocketDebuggerUrl, timeoutMs).connect();
  try {
    if (navigate && targetUrl) {
      await navigateAndWaitRedirects(connection, targetUrl, timeoutMs);
    } else {
      await connection.command("Page.enable");
    }
    await connection.command("Runtime.enable");
    const page = await evaluateSettledPage(connection, targetUrl, timeoutMs);
    const requestedUrl = String(targetUrl || target?.url || page.url || "");
    return {
      ...page,
      requestedUrl,
      finalUrl: page.url,
      redirected: Boolean(requestedUrl && page.url && requestedUrl !== page.url),
      capturedAt: new Date().toISOString(),
      source: "chrome-cdp"
    };
  } finally {
    connection.close();
  }
}

export async function readCdpPages({
  host = "127.0.0.1",
  port = 9222,
  targetUrls = [],
  timeoutMs = 10_000
} = {}) {
  const urls = [...new Set(targetUrls.map((value) => String(value || "").trim()).filter(Boolean))];
  const targets = await cdpTargets({ host, port, timeoutMs });
  if (!urls.length) {
    return [await readTarget(chooseTarget(targets), "", timeoutMs)];
  }

  const available = [...targets];
  const plans = [];
  for (const [index, wanted] of urls.entries()) {
    const matchingIndex = available.findIndex((target) => targetMatchesUrl(target, wanted));
    if (matchingIndex >= 0) {
      const [target] = available.splice(matchingIndex, 1);
      plans.push({ target, wanted, navigate: isLikelyRedirectUrl(wanted) });
      continue;
    }

    // Reuse the first existing debug tab for the first requested URL. Additional
    // URLs get their own tabs so multiple pages can be read in one prompt.
    if (index === 0 && available.length) {
      plans.push({ target: available.shift(), wanted, navigate: true });
      continue;
    }
    const target = await createCdpTarget({ host, port, targetUrl: wanted, timeoutMs });
    plans.push({
      target,
      wanted,
      navigate: true
    });
  }

  return Promise.all(plans.map(({ target, wanted, navigate }) =>
    readTarget(target, wanted, timeoutMs, navigate)
  ));
}

export async function readCdpPage({ host = "127.0.0.1", port = 9222, targetUrl = "", timeoutMs = 10_000 } = {}) {
  const [page] = await readCdpPages({
    host,
    port,
    targetUrls: targetUrl ? [targetUrl] : [],
    timeoutMs
  });
  return page;
}

function sharePointDownloadUrl(value) {
  const url = new URL(value);
  if (!/\.sharepoint\.com$/i.test(url.hostname) && !/\.sharepoint-df\.com$/i.test(url.hostname)) {
    throw new Error("Tải workbook tự động hiện chỉ hỗ trợ URL SharePoint.");
  }
  url.searchParams.set("download", "1");
  return url.href;
}

function safeDownloadName(value) {
  const cleaned = String(value || "workbook.xlsx")
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
    .replace(/[. ]+$/g, "")
    .slice(0, 180);
  return /\.xlsx?$/i.test(cleaned) ? cleaned : `${cleaned || "workbook"}.xlsx`;
}

export async function downloadCdpWorkbook({
  host = "127.0.0.1",
  port = 9222,
  targetUrl,
  downloadDir,
  timeoutMs = 60_000
} = {}) {
  const wanted = String(targetUrl || "").trim();
  if (!/^https?:\/\//i.test(wanted)) throw new Error("URL workbook không hợp lệ.");
  if (!downloadDir) throw new Error("Thiếu thư mục tải workbook.");
  const downloadUrl = sharePointDownloadUrl(wanted);
  await mkdir(downloadDir, { recursive: true });
  const target = await createCdpTarget({ host, port, targetUrl: wanted, timeoutMs: Math.min(timeoutMs, 10_000) });
  const connection = await new WebSocketConnection(target.webSocketDebuggerUrl, timeoutMs).connect();
  let downloadDomain = "Browser";
  let downloadedWithGuid = true;
  try {
    await connection.command("Page.enable");
    try {
      await connection.command("Browser.setDownloadBehavior", {
        behavior: "allowAndName",
        downloadPath: downloadDir,
        eventsEnabled: true
      });
    } catch {
      downloadDomain = "Page";
      downloadedWithGuid = false;
      await connection.command("Page.setDownloadBehavior", {
        behavior: "allow",
        downloadPath: downloadDir
      });
    }
    const beginPromise = connection.waitFor((message) =>
      message.method === `${downloadDomain}.downloadWillBegin`
    );
    await connection.command("Page.navigate", { url: downloadUrl });
    const begin = await beginPromise;
    const guid = begin?.params?.guid;
    if (!guid) throw new Error("Chrome không trả mã tải workbook.");

    let progress;
    do {
      progress = await connection.waitFor((message) =>
        message.method === `${downloadDomain}.downloadProgress` && message.params?.guid === guid
      );
    } while (!["completed", "canceled"].includes(progress?.params?.state));
    if (progress.params.state !== "completed") throw new Error("Chrome đã hủy tải workbook.");

    const filename = safeDownloadName(begin.params.suggestedFilename);
    const temporaryPath = join(downloadDir, downloadedWithGuid ? guid : filename);
    const finalPath = join(downloadDir, `${Date.now()}-${filename}`);
    await stat(temporaryPath);
    await rename(temporaryPath, finalPath);
    return {
      object: "browser.workbook.download",
      data: {
        url: wanted,
        filename,
        path: finalPath,
        downloadedAt: new Date().toISOString()
      }
    };
  } finally {
    try { await connection.command(`${downloadDomain}.setDownloadBehavior`, { behavior: "default" }); } catch {}
    try { await connection.command("Page.close"); } catch {}
    connection.close();
  }
}

// ======================= Điều khiển trang theo DOM (bấm, gõ, chọn, cuộn) =======================
// Nhanh hơn nhiều so với điều khiển bằng ảnh chụp màn hình: AI đọc danh sách phần tử dạng chữ (mỗi phần tử có mã eN),
// rồi bấm / gõ đúng phần tử đó – không phải gửi ảnh lên mô hình sau mỗi thao tác. Chữ gõ bằng Input.insertText
// (có dấu tiếng Việt, dán được vào ô soạn thảo giàu định dạng). Bấm bằng sự kiện chuột thật của Chrome.
const SNAPSHOT_EXPRESSION = (maxElements, maxText) => `(() => {
  const SEL = 'a[href],button,input:not([type=hidden]),textarea,select,summary,[contenteditable=""],[contenteditable="true"],[role=button],[role=link],[role=textbox],[role=searchbox],[role=combobox],[role=checkbox],[role=radio],[role=switch],[role=tab],[role=menuitem],[role=option],[role=treeitem]';
  let n = window.__simiRefN || 0;
  const clean = (v, max) => String(v || '').replace(/\\s+/g, ' ').trim().slice(0, max);
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return null;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) return null;
    return r;
  };
  const labelOf = (el) => clean(el.getAttribute('aria-label') || (el.labels && el.labels[0] && el.labels[0].innerText) ||
    el.getAttribute('placeholder') || el.getAttribute('title') || el.getAttribute('alt') ||
    (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable ? '' : el.innerText) || el.getAttribute('name') || el.id, 90);
  const roleOf = (el) => {
    const tag = el.tagName.toLowerCase(), type = (el.getAttribute('type') || '').toLowerCase();
    if (el.getAttribute('role')) return el.getAttribute('role');
    if (el.isContentEditable) return 'editor';
    if (tag === 'a') return 'link';
    if (tag === 'input') return ['checkbox', 'radio', 'submit', 'button', 'file', 'range', 'date', 'color'].includes(type) ? type : 'textbox';
    if (tag === 'textarea') return 'textbox';
    return tag;
  };
  const roots = [document];
  for (const host of document.querySelectorAll('*')) if (host.shadowRoot) roots.push(host.shadowRoot);
  const lines = [];
  const seen = new Set();
  for (const root of roots) {
    for (const el of root.querySelectorAll(SEL)) {
      if (lines.length >= ${maxElements}) break;
      if (seen.has(el)) continue; seen.add(el);
      // ô soạn thảo lồng nhau: chỉ lấy ô ngoài cùng
      if (el.isContentEditable && el.parentElement && el.parentElement.isContentEditable) continue;
      const r = visible(el); if (!r) continue;
      let ref = el.getAttribute('data-simi-ref');
      if (!ref) { ref = 'e' + (++n); el.setAttribute('data-simi-ref', ref); }
      const role = roleOf(el);
      let line = ref + ' ' + role + ' "' + labelOf(el) + '"';
      if (role === 'textbox' || role === 'searchbox' || role === 'editor' || role === 'combobox' || el.tagName === 'SELECT') {
        const v = el.isContentEditable ? el.innerText : el.tagName === 'SELECT' ? (el.selectedOptions[0] && el.selectedOptions[0].text) : el.value;
        if (v) line += ' value="' + clean(v, 120) + '"';
        if (el.tagName === 'SELECT') line += ' options=[' + [...el.options].slice(0, 15).map((o) => clean(o.text, 30)).join(' | ') + ']';
      }
      if (el.type === 'checkbox' || el.type === 'radio' || el.getAttribute('aria-checked')) line += (el.checked || el.getAttribute('aria-checked') === 'true') ? ' [x]' : ' [ ]';
      if (el.tagName === 'A' && el.href && !/^javascript:/i.test(el.href)) line += ' -> ' + clean(el.href, 100);
      if (el.disabled || el.getAttribute('aria-disabled') === 'true') line += ' (khoá)';
      if (r.bottom < 0 || r.top > innerHeight) line += ' (ngoài màn hình)';
      lines.push(line);
    }
  }
  window.__simiRefN = n;
  const text = String((document.body && document.body.innerText) || '').replace(/[ \\t\\u00a0]+/g, ' ').replace(/\\s*\\n\\s*/g, '\\n').trim().slice(0, ${maxText});
  const focused = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute('data-simi-ref');
  return { url: location.href, title: document.title, readyState: document.readyState, elements: lines, focused: focused || null,
    text, scrollY: Math.round(scrollY), pageHeight: document.documentElement.scrollHeight, viewportHeight: innerHeight };
})()`;

const RISKY_ACTION = /(thanh\s*to[áa]n|đặt\s*h[àa]ng|mua\s*ngay|x[óo]a|xo[áa]|g[ửu]i|đăng(?!\s*nh)|chia\s*s[ẻe]|publish|post\b|send|delete|remove|pay|checkout|place\s*order|buy\s*now|submit\s*order|transfer|chuyển\s*khoản)/i;

const KEY_DEFS = {
  enter: { key: "Enter", code: "Enter", keyCode: 13, text: "\r" },
  tab: { key: "Tab", code: "Tab", keyCode: 9 },
  escape: { key: "Escape", code: "Escape", keyCode: 27 },
  esc: { key: "Escape", code: "Escape", keyCode: 27 },
  backspace: { key: "Backspace", code: "Backspace", keyCode: 8 },
  delete: { key: "Delete", code: "Delete", keyCode: 46 },
  space: { key: " ", code: "Space", keyCode: 32, text: " " },
  arrowup: { key: "ArrowUp", code: "ArrowUp", keyCode: 38 }, up: { key: "ArrowUp", code: "ArrowUp", keyCode: 38 },
  arrowdown: { key: "ArrowDown", code: "ArrowDown", keyCode: 40 }, down: { key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
  arrowleft: { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 }, left: { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 },
  arrowright: { key: "ArrowRight", code: "ArrowRight", keyCode: 39 }, right: { key: "ArrowRight", code: "ArrowRight", keyCode: 39 },
  home: { key: "Home", code: "Home", keyCode: 36 }, end: { key: "End", code: "End", keyCode: 35 },
  pageup: { key: "PageUp", code: "PageUp", keyCode: 33 }, pagedown: { key: "PageDown", code: "PageDown", keyCode: 34 }
};
const MODIFIER_BITS = { alt: 1, option: 1, ctrl: 2, control: 2, meta: 4, cmd: 4, command: 4, shift: 8 };

function parseKeys(combo, platform = process.platform) {
  const parts = String(combo || "").split("+").map((part) => part.trim()).filter(Boolean);
  if (!parts.length) throw new Error("Thiếu phím cần nhấn.");
  let modifiers = 0;
  let main = "";
  for (const part of parts) {
    const lower = part.toLowerCase();
    // "mod" = Ctrl trên Windows/Linux, Cmd trên macOS
    if (lower === "mod") modifiers |= platform === "darwin" ? 4 : 2;
    else if (MODIFIER_BITS[lower] !== undefined) modifiers |= MODIFIER_BITS[lower];
    else main = part;
  }
  let def = KEY_DEFS[main.toLowerCase()];
  if (!def && /^f([1-9]|1[0-2])$/i.test(main)) def = { key: main.toUpperCase(), code: main.toUpperCase(), keyCode: 111 + Number(main.slice(1)) };
  if (!def && main.length === 1) {
    const upper = main.toUpperCase();
    def = {
      key: modifiers & 8 ? upper : main.toLowerCase(),
      code: /[a-z]/i.test(main) ? `Key${upper}` : /\d/.test(main) ? `Digit${main}` : "",
      keyCode: upper.charCodeAt(0),
      text: modifiers & ~8 ? undefined : (modifiers & 8 ? upper : main)
    };
  }
  if (!def) throw new Error(`Không hiểu phím "${main}".`);
  return { ...def, modifiers };
}

// phím tắt soạn thảo: sự kiện phím giả không tự chạy lệnh (nhất là trên macOS) → gửi kèm lệnh soạn thảo của Chrome
const EDIT_COMMANDS = { a: "selectAll", c: "copy", v: "paste", x: "cut", z: "undo", y: "redo" };
function editCommands(def) {
  if (def.key === "Backspace") return ["deleteBackward"];
  if (def.key === "Delete") return ["deleteForward"];
  if (def.modifiers & 6 && EDIT_COMMANDS[def.key.toLowerCase()]) return [EDIT_COMMANDS[def.key.toLowerCase()]];
  return undefined;
}

async function pressKeys(connection, combo) {
  const def = parseKeys(combo);
  const base = { key: def.key, code: def.code, windowsVirtualKeyCode: def.keyCode, nativeVirtualKeyCode: def.keyCode, modifiers: def.modifiers };
  const commands = editCommands(def);
  await connection.command("Input.dispatchKeyEvent", { type: def.text ? "keyDown" : "rawKeyDown", ...base, ...(def.text ? { text: def.text, unmodifiedText: def.text } : {}), ...(commands ? { commands } : {}) });
  await connection.command("Input.dispatchKeyEvent", { type: "keyUp", ...base });
}

async function evaluateValue(connection, expression) {
  const result = await connection.command("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result?.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || "Lỗi chạy trên trang");
  return result?.result?.value;
}

function refSelector(ref) {
  const value = String(ref || "").trim();
  if (!/^e\d{1,6}$/.test(value)) throw new Error(`Mã phần tử "${value}" không hợp lệ – dùng mã eN từ browser_snapshot.`);
  return value;
}

// tìm phần tử theo mã (kể cả trong shadow DOM), cuộn vào giữa màn hình, trả toạ độ tâm + thông tin
async function locate(connection, ref) {
  const id = refSelector(ref);
  const info = await evaluateValue(connection, `(() => {
    const find = (root) => { const el = root.querySelector('[data-simi-ref="${id}"]'); if (el) return el;
      for (const h of root.querySelectorAll('*')) if (h.shadowRoot) { const f = find(h.shadowRoot); if (f) return f; } return null; };
    const el = find(document);
    if (!el) return null;
    el.scrollIntoView({ block: 'center', inline: 'center' });
    const r = el.getBoundingClientRect();
    const label = String(el.getAttribute('aria-label') || el.innerText || el.value || el.getAttribute('title') || '').replace(/\\s+/g, ' ').trim().slice(0, 120);
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, tag: el.tagName, type: el.type || '',
      editable: el.isContentEditable || el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && !['checkbox','radio','submit','button','file'].includes(el.type)),
      label, disabled: !!el.disabled };
  })()`);
  if (!info) throw new Error(`Không còn phần tử ${id} trên trang (trang đã đổi) – gọi browser_snapshot để lấy mã mới.`);
  return info;
}

async function mouseClick(connection, x, y, clickCount = 1) {
  await connection.command("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  for (let count = 1; count <= clickCount; count += 1) {
    await connection.command("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: count });
    await connection.command("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: count });
  }
}

async function settle(connection, beforeUrl, maxMs = 6_000) {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    try {
      const state = await evaluateValue(connection, "({ url: location.href, readyState: document.readyState })");
      if (state && state.readyState === "complete") {
        if (state.url !== beforeUrl) await new Promise((resolve) => setTimeout(resolve, 400));
        return;
      }
    } catch {
      // trang đang chuyển – thử lại
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

async function openTargetConnection({ host, port, targetId, timeoutMs = 15_000 }) {
  const targets = await cdpTargets({ host, port, timeoutMs: 5_000 });
  const pages = targets.filter((target) => target?.type === "page" && typeof target.webSocketDebuggerUrl === "string" && !/^devtools:/i.test(target.url || ""));
  const target = pages.find((item) => item.id === targetId) || pages.find((item) => /^https?:/i.test(item.url || "")) || pages[0];
  if (!target) throw new Error("Trình duyệt SIMI chưa có tab nào – gọi browser_snapshot với url để mở trang.");
  const connection = await new WebSocketConnection(target.webSocketDebuggerUrl, timeoutMs).connect();
  return { connection, target, pages };
}

export async function listPageTabs({ host = "127.0.0.1", port = 9222 } = {}) {
  const targets = await cdpTargets({ host, port, timeoutMs: 5_000 });
  return targets.filter((target) => target?.type === "page" && !/^devtools:/i.test(target.url || ""))
    .map((target) => ({ id: target.id, title: String(target.title || "").slice(0, 80), url: String(target.url || "").slice(0, 200) }));
}

// mở url ở tab đang dùng (hoặc tab mới) rồi chờ tải xong
export async function navigateTab({ host = "127.0.0.1", port = 9222, targetId, url, newTab = false, timeoutMs = 20_000 }) {
  const wanted = resolveNavigationUrl(url);
  if (!/^https?:\/\//i.test(wanted)) throw new Error("Chỉ mở được địa chỉ http/https.");
  let target;
  if (newTab) target = await createCdpTarget({ host, port, targetUrl: wanted, timeoutMs: 5_000 });
  const opened = await openTargetConnection({ host, port, targetId: target ? target.id : targetId, timeoutMs });
  try {
    await opened.connection.command("Page.bringToFront").catch(() => {});
    if (!newTab) {
      const navigation = await opened.connection.command("Page.navigate", { url: wanted });
      if (navigation?.errorText) throw new Error(`Không mở được trang: ${navigation.errorText}`);
    }
    await settle(opened.connection, "", Math.min(timeoutMs, 15_000));
    return opened.target.id;
  } finally {
    opened.connection.close();
  }
}

// danh sách phần tử bấm/gõ được (mã eN) + chữ trên trang
export async function snapshotTab({ host = "127.0.0.1", port = 9222, targetId, maxElements = 250, maxText = 6_000 } = {}) {
  const opened = await openTargetConnection({ host, port, targetId });
  try {
    const page = await evaluateValue(opened.connection, SNAPSHOT_EXPRESSION(Math.max(20, Math.min(600, maxElements)), Math.max(0, Math.min(60_000, maxText))));
    return { tabId: opened.target.id, ...page };
  } finally {
    opened.connection.close();
  }
}

// chạy lần lượt nhiều thao tác trong 1 lần gọi (bấm, gõ, chọn, phím, cuộn, chờ) → bớt số lượt hỏi mô hình
export async function actOnTab({ host = "127.0.0.1", port = 9222, targetId, actions = [] } = {}) {
  if (!Array.isArray(actions) || !actions.length) throw new Error("Thiếu danh sách thao tác (actions).");
  if (actions.length > 30) throw new Error("Tối đa 30 thao tác mỗi lần.");
  const opened = await openTargetConnection({ host, port, targetId });
  const { connection } = opened;
  const done = [];
  try {
    await connection.command("Page.bringToFront").catch(() => {});
    for (const [index, step] of actions.entries()) {
      const kind = String(step?.action || "").toLowerCase();
      const beforeUrl = await evaluateValue(connection, "location.href").catch(() => "");
      try {
        if (kind === "click" || kind === "double_click") {
          const info = await locate(connection, step.ref);
          if (info.disabled) throw new Error(`Phần tử ${step.ref} đang bị khoá (disabled).`);
          if (RISKY_ACTION.test(info.label) && step.confirmed !== true) {
            throw new Error(`Nút "${info.label}" có thể gửi / đăng / thanh toán / xoá. Hỏi người dùng xác nhận trước, rồi gọi lại với "confirmed": true.`);
          }
          await mouseClick(connection, info.x, info.y, kind === "double_click" ? 2 : 1);
          done.push(`${kind === "click" ? "bấm" : "bấm đúp"} ${step.ref} "${info.label.slice(0, 50)}"`);
        } else if (kind === "type" || kind === "fill") {
          const text = String(step.text ?? "");
          if (text.length > 20_000) throw new Error("Chữ quá dài (tối đa 20.000 ký tự mỗi lần).");
          const info = await locate(connection, step.ref);
          if (!info.editable) throw new Error(`Phần tử ${step.ref} không phải ô nhập chữ.`);
          await mouseClick(connection, info.x, info.y, 1);
          if (step.clear !== false) {
            // chọn hết nội dung cũ của đúng ô này (không dùng Ctrl+A – có trang chọn cả trang), chữ mới gõ đè lên
            await evaluateValue(connection, `(() => { const el = document.querySelector('[data-simi-ref="${refSelector(step.ref)}"]'); if (!el) return;
              el.focus(); if (el.select) { el.select(); return; }
              const sel = getSelection(); sel.removeAllRanges(); const range = document.createRange(); range.selectNodeContents(el); sel.addRange(range); })()`);
            if (!text) await pressKeys(connection, "Backspace");
          }
          if (text) await connection.command("Input.insertText", { text });
          if (step.submit === true) await pressKeys(connection, "Enter");
          done.push(`gõ ${text.length} ký tự vào ${step.ref}${step.submit ? " + Enter" : ""}`);
        } else if (kind === "select") {
          const id = refSelector(step.ref);
          const value = String(step.value ?? "");
          const picked = await evaluateValue(connection, `(() => {
            const el = document.querySelector('[data-simi-ref="${id}"]');
            if (!el || el.tagName !== 'SELECT') return null;
            const want = ${JSON.stringify(value)}.toLowerCase();
            const opt = [...el.options].find((o) => o.value.toLowerCase() === want || o.text.trim().toLowerCase() === want) ||
              [...el.options].find((o) => o.text.toLowerCase().includes(want));
            if (!opt) return '';
            el.value = opt.value; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
            return opt.text.trim();
          })()`);
          if (picked === null) throw new Error(`Phần tử ${id} không phải ô chọn (select).`);
          if (!picked) throw new Error(`Không có lựa chọn "${value}" trong ${id}.`);
          done.push(`chọn "${picked}" ở ${id}`);
        } else if (kind === "press") {
          await pressKeys(connection, step.keys);
          done.push(`nhấn ${step.keys}`);
        } else if (kind === "scroll") {
          const amount = Math.max(-30, Math.min(30, Number(step.amount) || 5));
          if (step.ref) {
            const info = await locate(connection, step.ref);
            await connection.command("Input.dispatchMouseEvent", { type: "mouseWheel", x: info.x, y: info.y, deltaX: 0, deltaY: amount * 120 });
          } else {
            await evaluateValue(connection, `window.scrollBy(0, ${amount * 120})`);
          }
          done.push(`cuộn ${amount > 0 ? "xuống" : "lên"} ${Math.abs(amount)}`);
        } else if (kind === "wait") {
          const ms = Math.max(100, Math.min(15_000, Number(step.ms || (step.seconds ? step.seconds * 1000 : 1000))));
          await new Promise((resolve) => setTimeout(resolve, ms));
          done.push(`chờ ${ms} ms`);
        } else {
          throw new Error(`Thao tác "${kind}" không hỗ trợ (click, double_click, type, select, press, scroll, wait).`);
        }
      } catch (error) {
        return { ok: false, done, failedAt: index, error: error?.message || String(error) };
      }
      await settle(connection, beforeUrl, 5_000);
    }
    return { ok: true, done };
  } finally {
    connection.close();
  }
}

// ảnh chụp tab (JPEG nhỏ) khi thật sự cần nhìn bố cục / hình ảnh
export async function screenshotTab({ host = "127.0.0.1", port = 9222, targetId, maxWidth = 1280, quality = 60 } = {}) {
  const opened = await openTargetConnection({ host, port, targetId });
  try {
    const metrics = await opened.connection.command("Page.getLayoutMetrics");
    const view = metrics?.cssVisualViewport || metrics?.visualViewport || { clientWidth: 1280, clientHeight: 800 };
    const width = Math.round(view.clientWidth || 1280);
    const height = Math.round(view.clientHeight || 800);
    const scale = Math.min(1, maxWidth / Math.max(1, width));
    const shot = await opened.connection.command("Page.captureScreenshot", {
      format: "jpeg",
      quality: Math.max(30, Math.min(90, quality)),
      clip: { x: Math.round(view.pageX || 0), y: Math.round(view.pageY || 0), width, height, scale }
    });
    return { tabId: opened.target.id, data: shot.data, width: Math.round(width * scale), height: Math.round(height * scale) };
  } finally {
    opened.connection.close();
  }
}

export { parseKeys as parseKeyCombo, RISKY_ACTION };
