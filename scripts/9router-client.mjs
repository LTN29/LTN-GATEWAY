import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const codexHome = process.env.CODEX_HOME || join(homedir(), ".codex");
const gatewayBase = normalizeGatewayBase(
  process.env.LTN_GATEWAY_BASE_URL || process.env.NINEROUTER_URL || "https://ai.simi.vn/v1"
);
const helperPath = process.env.LTN_CODEX_TOKEN_HELPER ||
  join(codexHome, "bin", "ltn-codex-token");
const clientIdPath = process.env.LTN_CLIENT_ID_PATH || join(codexHome, "ltn-client-id");

function normalizeGatewayBase(value) {
  const base = String(value || "").replace(/\/+$/, "");
  return /\/v1$/.test(base) ? base : `${base}/v1`;
}

function readFileValue(path) {
  try {
    return readFileSync(path, "utf8").trim();
  } catch {
    return "";
  }
}

async function resolveApiKey() {
  const direct = String(process.env.LTN_TEAM_API_KEY || process.env.NINEROUTER_KEY || "").trim();
  if (direct) return direct;
  try {
    const result = await execFileAsync(helperPath, [], {
      timeout: 5_000,
      windowsHide: true,
      maxBuffer: 16_384
    });
    return String(result.stdout || "").trim();
  } catch {
    return "";
  }
}

function endpointPath(value) {
  const raw = String(value || "").trim();
  if (!raw.startsWith("/")) throw new Error("Path 9Router phải bắt đầu bằng '/'.");
  if (raw === "/v1") return "";
  if (raw.startsWith("/v1/")) return raw.slice(3);
  return raw;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function printHelp() {
  process.stdout.write([
    "Usage:",
    "  ltn-9router GET /models/web",
    "  ltn-9router POST /search '{\"model\":\"tavily\",\"query\":\"...\"}'",
    "  ltn-9router POST /web/fetch @- < request.json",
    "",
    "The wrapper resolves the Gateway API key without printing it."
  ].join("\n") + "\n");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    printHelp();
    return;
  }

  const method = String(args.shift() || "GET").toUpperCase();
  const path = endpointPath(args.shift());
  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    throw new Error(`HTTP method không được hỗ trợ: ${method}.`);
  }

  const apiKey = await resolveApiKey();
  if (!apiKey) throw new Error("Không tìm thấy API key Gateway cho lệnh ltn-9router.");

  const headers = {
    authorization: `Bearer ${apiKey}`,
    accept: "application/json",
    "user-agent": "ltn-9router-client/1.0"
  };
  const clientId = String(process.env.LTN_CLIENT_ID || "").trim() || readFileValue(clientIdPath);
  if (clientId) headers["x-ltn-client-id"] = clientId;

  const init = { method, headers, redirect: "manual" };
  if (method !== "GET" && method !== "HEAD") {
    const bodyArg = args.shift();
    const body = bodyArg === "@-"
      ? await readStdin()
      : String(bodyArg || "{}");
    JSON.parse(body);
    headers["content-type"] = "application/json";
    init.body = body;
  }

  const response = await fetch(`${gatewayBase}${path}`, init);
  const output = await response.text();
  process.stdout.write(output);
  if (output && !output.endsWith("\n")) process.stdout.write("\n");
  if (!response.ok) {
    throw new Error(`Gateway trả HTTP ${response.status}.`);
  }
}

main().catch((error) => {
  process.stderr.write(`ltn-9router: ${error?.message || String(error)}\n`);
  process.exitCode = 1;
});
