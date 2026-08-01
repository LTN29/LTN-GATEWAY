import { randomBytes } from "node:crypto";
import { connect as connectTls } from "node:tls";
import { createConnection as createTcpConnection } from "node:net";

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
  readyState: document.readyState
}))()`;

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

async function readTarget(target, targetUrl, timeoutMs, navigate = false) {
  const connection = await new WebSocketConnection(target.webSocketDebuggerUrl, timeoutMs).connect();
  try {
    const page = navigate && targetUrl && !targetMatchesUrl(target, targetUrl)
      ? await navigateAndWait(connection, targetUrl, timeoutMs)
      : await evaluatePage(connection);
    return { ...page, capturedAt: new Date().toISOString(), source: "chrome-cdp" };
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
      plans.push({ target, wanted, navigate: false });
      continue;
    }

    // Reuse the first existing debug tab for the first requested URL. Additional
    // URLs get their own tabs so multiple pages can be read in one prompt.
    if (index === 0 && available.length) {
      plans.push({ target: available.shift(), wanted, navigate: true });
      continue;
    }
    const target = await createCdpTarget({ host, port, targetUrl: wanted, timeoutMs });
    plans.push({ target, wanted, navigate: !targetMatchesUrl(target, wanted) });
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
