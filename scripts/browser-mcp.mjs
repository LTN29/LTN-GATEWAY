import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import readline from "node:readline";

const codexHome = process.env.CODEX_HOME || join(homedir(), ".codex");
const browserPagePath = process.env.LTN_BROWSER_PAGE_PATH || join(codexHome, "browser-page.mjs");
const cdpHost = process.env.LTN_CHROME_DEBUG_HOST || "127.0.0.1";
const cdpPort = Number(process.env.LTN_CHROME_DEBUG_PORT || 9222);
const defaultTimeoutMs = Math.max(10_000, Number(process.env.LTN_BROWSER_CAPTURE_TIMEOUT_MS || 60_000));
const spreadsheetAuditPath = process.env.LTN_SPREADSHEET_AUDIT_PATH || join(codexHome, "tools", "spreadsheet-audit.py");
const pythonPath = process.env.LTN_PYTHON_PATH || (process.platform === "win32"
  ? join(codexHome, "pdf-runtime", "Scripts", "python.exe")
  : join(codexHome, "pdf-runtime", "bin", "python"));

const tools = [
  {
    name: "browser_read_pages",
    description: "Open and read one or more authorized web pages in the persistent SIMI Chrome profile. Chrome starts automatically, tabs are opened concurrently, and signed-in sessions are reused. Use this for URLs the user says are already logged in.",
    inputSchema: {
      type: "object",
      properties: {
        urls: {
          type: "array",
          minItems: 1,
          maxItems: 8,
          items: { type: "string", format: "uri" },
          description: "HTTP/HTTPS URLs to open and read."
        },
        max_chars_per_page: {
          type: "integer",
          minimum: 1_000,
          maximum: 500_000,
          default: 120_000,
          description: "Maximum visible-text characters returned for each page."
        }
      },
      required: ["urls"],
      additionalProperties: false
    }
  },
  {
    name: "browser_status",
    description: "Check whether the managed SIMI Chrome profile is currently reachable. Do not ask the user to run a terminal command; browser_read_pages starts it automatically.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }
  },
  {
    name: "browser_read_workbook",
    description: "Download an authorized SharePoint Excel workbook through the signed-in SIMI Chrome profile, read rows structurally, filter by a month column, detect duplicate links, and report missing required fields. The temporary workbook copy is deleted after reading.",
    inputSchema: {
      type: "object",
      properties: {
        workbook_url: { type: "string", format: "uri", description: "Authorized SharePoint .xlsx sharing URL." },
        sheet: { type: "string", description: "Exact worksheet name. Omit to use the first sheet." },
        header_row: { type: "integer", minimum: 1, maximum: 100, default: 1 },
        filter_column: { type: "string", description: "Excel column letter or exact header used for the month filter." },
        filter_month: { type: "integer", minimum: 1, maximum: 12 },
        filter_year: { type: "integer", minimum: 2000, maximum: 2200 },
        link_column: { type: "string", description: "Excel column letter or exact header containing URLs." },
        required_columns: { type: "array", maxItems: 100, items: { type: "string" }, description: "Column letters or exact headers that must be filled." },
        required_range_start: { type: "string", description: "First required column letter/header, for example S." },
        required_range_end: { type: "string", description: "Last required column letter/header. Omit to continue through the final used column." },
        max_rows: { type: "integer", minimum: 1, maximum: 5000, default: 1000 }
      },
      required: ["workbook_url"],
      additionalProperties: false
    }
  }
];

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function validUrls(values) {
  if (!Array.isArray(values) || values.length < 1 || values.length > 8) {
    throw new Error("urls must contain between 1 and 8 HTTP/HTTPS URLs.");
  }
  return [...new Set(values.map((value) => String(value || "").trim()))].map((value) => {
    let parsed;
    try { parsed = new URL(value); } catch { throw new Error(`Invalid URL: ${value}`); }
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error(`Unsupported URL protocol: ${value}`);
    return parsed.href;
  });
}

function runBrowserPage(urls, extraArgs = []) {
  if (!existsSync(browserPagePath)) {
    throw new Error(`Browser runtime is missing at ${browserPagePath}. Run installer option 2 (Repair), then restart Codex.`);
  }
  const nodeBin = process.env.LTN_BROWSER_NODE_PATH || process.execPath;
  return new Promise((resolve, reject) => {
    const child = spawn(nodeBin, [browserPagePath, ...extraArgs, "--cdp", ...urls], {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env
    });
    let stdout = "";
    let stderr = "";
    const limit = 12 * 1024 * 1024;
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("Timed out while opening or reading Chrome pages."));
    }, defaultTimeoutMs + 20_000);
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
      if (stdout.length > limit) child.kill();
    });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString("utf8"); });
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("close", (code) => {
      clearTimeout(timer);
      if (stdout.length > limit) {
        reject(new Error("Browser response exceeded the local safety limit."));
        return;
      }
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Browser reader exited with code ${code}.`));
        return;
      }
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch {
        reject(new Error("Browser reader returned invalid JSON."));
      }
    });
  });
}

function runSpreadsheetAudit(path, options) {
  if (!existsSync(spreadsheetAuditPath)) {
    throw new Error(`Spreadsheet audit runtime is missing at ${spreadsheetAuditPath}. Run installer option 2 (Repair), then restart Codex.`);
  }
  if (!existsSync(pythonPath)) {
    throw new Error("Python spreadsheet runtime is missing. Run installer option 2 (Repair), then restart Codex.");
  }
  return new Promise((resolve, reject) => {
    const child = spawn(pythonPath, [spreadsheetAuditPath], {
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env
    });
    let stdout = "";
    let stderr = "";
    const limit = 24 * 1024 * 1024;
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("Timed out while reading the workbook."));
    }, defaultTimeoutMs);
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
      if (stdout.length > limit) child.kill();
    });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString("utf8"); });
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("close", (code) => {
      clearTimeout(timer);
      if (stdout.length > limit) {
        reject(new Error("Workbook response exceeded the local safety limit."));
        return;
      }
      let payload;
      try { payload = JSON.parse(stdout.trim()); } catch { payload = null; }
      if (code !== 0 || payload?.error) {
        reject(new Error(payload?.error?.message || stderr.trim() || `Workbook reader exited with code ${code}.`));
        return;
      }
      if (!payload) {
        reject(new Error("Workbook reader returned invalid JSON."));
        return;
      }
      resolve(payload);
    });
    child.stdin.end(JSON.stringify({ path, options }));
  });
}

function truncatePage(page, maxChars) {
  const text = String(page?.text || "");
  return {
    ...page,
    text: text.slice(0, maxChars),
    textTruncated: text.length > maxChars,
    originalTextLength: text.length
  };
}

function normalizePayload(payload, maxChars) {
  if (payload?.object === "browser.page") {
    return { ...payload, data: truncatePage(payload.data, maxChars) };
  }
  if (payload?.object === "browser.pages" && Array.isArray(payload?.data?.pages)) {
    return {
      ...payload,
      data: { ...payload.data, pages: payload.data.pages.map((page) => truncatePage(page, maxChars)) }
    };
  }
  return payload;
}

async function browserStatus() {
  try {
    const response = await fetch(`http://${cdpHost}:${cdpPort}/json/version`, {
      signal: AbortSignal.timeout(1_500),
      redirect: "manual"
    });
    return { running: response.ok, host: cdpHost, port: cdpPort, mode: "persistent-managed-profile" };
  } catch {
    return { running: false, host: cdpHost, port: cdpPort, mode: "persistent-managed-profile" };
  }
}

async function callTool(name, args = {}) {
  if (name === "browser_status") return browserStatus();
  if (name === "browser_read_workbook") {
    const [url] = validUrls([args.workbook_url]);
    let temporaryPath = "";
    try {
      const download = await runBrowserPage([url], ["--download-workbook"]);
      temporaryPath = String(download?.data?.path || "");
      if (!temporaryPath) throw new Error("Chrome did not return the downloaded workbook path.");
      const audit = await runSpreadsheetAudit(temporaryPath, {
        sheet: args.sheet,
        header_row: args.header_row,
        filter_column: args.filter_column,
        filter_month: args.filter_month,
        filter_year: args.filter_year,
        link_column: args.link_column,
        required_columns: args.required_columns,
        required_range_start: args.required_range_start,
        required_range_end: args.required_range_end,
        max_rows: args.max_rows
      });
      return {
        ...audit,
        data: {
          ...audit.data,
          sourceUrl: url,
          downloadedFilename: download?.data?.filename
        }
      };
    } finally {
      if (temporaryPath) await unlink(temporaryPath).catch(() => {});
    }
  }
  if (name !== "browser_read_pages") throw new Error(`Unknown tool: ${name}`);
  const urls = validUrls(args.urls);
  const maxChars = Math.max(1_000, Math.min(500_000, Number(args.max_chars_per_page || 120_000)));
  return normalizePayload(await runBrowserPage(urls), maxChars);
}

async function handle(message) {
  if (!message || typeof message !== "object") return;
  if (message.method === "notifications/initialized" || message.method?.startsWith("notifications/")) return;
  if (message.id === undefined) return;
  try {
    if (message.method === "initialize") {
      send({
        jsonrpc: "2.0",
        id: message.id,
        result: {
          protocolVersion: message.params?.protocolVersion || "2025-06-18",
          capabilities: { tools: {} },
          serverInfo: { name: "simi-browser", version: "1.0.0" }
        }
      });
      return;
    }
    if (message.method === "ping") {
      send({ jsonrpc: "2.0", id: message.id, result: {} });
      return;
    }
    if (message.method === "tools/list") {
      send({ jsonrpc: "2.0", id: message.id, result: { tools } });
      return;
    }
    if (message.method === "tools/call") {
      const result = await callTool(message.params?.name, message.params?.arguments || {});
      send({
        jsonrpc: "2.0",
        id: message.id,
        result: {
          content: [{ type: "text", text: JSON.stringify(result) }],
          structuredContent: result
        }
      });
      return;
    }
    send({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: "Method not found" } });
  } catch (error) {
    send({
      jsonrpc: "2.0",
      id: message.id,
      result: {
        isError: true,
        content: [{ type: "text", text: error?.message || String(error) }]
      }
    });
  }
}

const input = readline.createInterface({ input: process.stdin, crlfDelay: Infinity, terminal: false });
input.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    void handle(JSON.parse(trimmed));
  } catch {
    send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
  }
});
