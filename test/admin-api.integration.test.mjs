import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createHash, createSign, generateKeyPairSync } from "node:crypto";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

function b64url(value) {
  return Buffer.from(typeof value === "string" ? value : JSON.stringify(value)).toString("base64url");
}

function signJwt(privateKey, claims, { kid = "test-key", aud = "admin-aud", iss = "https://test.cloudflareaccess.com" } = {}) {
  const header = b64url({ alg: "RS256", typ: "JWT", kid });
  const payload = b64url({
    iss,
    aud,
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    ...claims
  });
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  signer.end();
  return `${header}.${payload}.${signer.sign(privateKey).toString("base64url")}`;
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function request(port, path, { method = "GET", token = "", csrf = "", origin = "https://admin-simi.simi.vn", host = "admin-simi.simi.vn", body = null } = {}) {
  const headers = { host };
  if (token) headers["cf-access-jwt-assertion"] = token;
  if (csrf) headers["x-ltn-csrf-token"] = csrf;
  if (origin) headers.origin = origin;
  if (body !== null) headers["content-type"] = "application/json";
  return new Promise((resolve, reject) => {
    const req = http.request({ host: "127.0.0.1", port, path, method, headers }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve({ status: res.statusCode, headers: res.headers, text, json: text && res.headers["content-type"]?.includes("json") ? JSON.parse(text) : null });
      });
    });
    req.once("error", reject);
    if (body !== null) req.write(JSON.stringify(body));
    req.end();
  });
}

test("Admin API validates Cloudflare JWT, CSRF, RBAC and one-time keys", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-admin-api-"));
  const teamsFile = join(root, "teams.json");
  const usersFile = join(root, "users.json");
  const adminsFile = join(root, "admins.json");
  const jwksFile = join(root, "jwks.json");
  const memoryDir = join(root, "memory");
  const adminDistDir = join(root, "admin-ui-dist");
  const queueFile = join(root, "memory-review-queue.jsonl");
  const auditFile = join(root, "admin-audit.jsonl");
  await mkdir(memoryDir, { recursive: true });
  await mkdir(adminDistDir, { recursive: true });
  await writeFile(join(adminDistDir, "index.html"), "<!doctype html><title>LTN Admin</title><main>admin-ui-ok</main>");
  await writeFile(teamsFile, JSON.stringify({ teams: [{ code: "SALES", keyHash: hash("team-key"), enabled: true, memoryFile: "SALES.md", displayName: "Sales" }] }));
  await writeFile(usersFile, JSON.stringify({ version: 1, users: {} }));
  await writeFile(adminsFile, JSON.stringify({
    version: 1,
    admins: {
      "admin@simi.vn": { displayName: "Admin", enabled: true, roles: ["SUPER_ADMIN"], teamIds: [] },
      "manager@simi.vn": { displayName: "Manager", enabled: true, roles: ["TEAM_MANAGER"], teamIds: ["SALES"] },
      "disabled@simi.vn": { displayName: "Disabled", enabled: false, roles: ["IT_ADMIN"], teamIds: [] }
    }
  }));
  await writeFile(queueFile, JSON.stringify({
    id: "company-candidate",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourceUserId: "sales-ngoc",
    sourceTeamId: "SALES",
    scope: "COMPANY",
    category: "policy",
    normalizedKey: "company.policy",
    summary: "Company policy candidate.",
    targetFile: "memory/COMPANY.md",
    confidence: 0.95,
    status: "pending",
    sensitivity: "none",
    durability: "long_term",
    sourceType: "explicit_user_statement",
    decision: null
  }) + "\n");

  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const jwk = publicKey.export({ format: "jwk" });
  jwk.kid = "test-key";
  jwk.alg = "RS256";
  jwk.use = "sig";
  await writeFile(jwksFile, JSON.stringify({ keys: [jwk] }));

  process.env.TEAMS_FILE = teamsFile;
  process.env.LTN_USERS_CONFIG_FILE = usersFile;
  process.env.ADMIN_CONFIG_FILE = adminsFile;
  process.env.CLOUDFLARE_ACCESS_JWKS_FILE = jwksFile;
  process.env.CLOUDFLARE_ACCESS_TEAM_DOMAIN = "test.cloudflareaccess.com";
  process.env.CLOUDFLARE_ACCESS_AUD = "admin-aud";
  process.env.ADMIN_ALLOWED_HOSTS = "admin-simi.simi.vn";
  process.env.ADMIN_ALLOWED_ORIGIN = "https://admin-simi.simi.vn";
  process.env.ADMIN_UI_ENABLED = "true";
  process.env.ADMIN_UI_DIST_DIR = adminDistDir;
  process.env.ADMIN_AUDIT_FILE = auditFile;
  process.env.MEMORY_DIR = memoryDir;
  process.env.MEMORY_REVIEW_QUEUE_FILE = queueFile;
  process.env.MEMORY_AUDIT_FILE = join(root, "memory-audit.jsonl");
  process.env.MEMORY_SYNC_OUTBOX_FILE = join(root, "memory-sync-outbox.jsonl");
  process.env.MEMORY_BACKUP_DIR = join(root, "memory-backups");
  process.env.UPSTREAM_BASE_URL = "http://127.0.0.1:1";

  const { createGatewayServer } = await import(`../src/server.mjs?admin=${Date.now()}`);
  const server = createGatewayServer();
  const port = await listen(server);
  const adminToken = signJwt(privateKey, { email: "admin@simi.vn" });
  const managerToken = signJwt(privateKey, { email: "manager@simi.vn" });
  const wrongAudToken = signJwt(privateKey, { email: "admin@simi.vn" }, { aud: "wrong-aud" });
  const disabledToken = signJwt(privateKey, { email: "disabled@simi.vn" });

  try {
    assert.equal((await request(port, "/admin/api/v1/me")).status, 401);
    assert.equal((await request(port, "/admin/api/v1/me", { token: wrongAudToken })).status, 401);
    assert.equal((await request(port, "/admin/api/v1/me", { token: disabledToken })).status, 403);
    assert.equal((await request(port, "/admin/api/v1/me", { token: adminToken, host: "ai.simi.vn" })).status, 404);

    const me = await request(port, "/admin/api/v1/me", { token: adminToken });
    assert.equal(me.status, 200);
    assert.equal(me.json.data.admin.email, "admin@simi.vn");

    const adminRoot = await request(port, "/", { origin: "" });
    assert.equal(adminRoot.status, 302);
    assert.equal(adminRoot.headers.location, "/admin/");
    assert.equal((await request(port, "/", { host: "ai.simi.vn", origin: "" })).status, 404);
    const adminUi = await request(port, "/admin/", { origin: "" });
    assert.equal(adminUi.status, 200);
    assert.match(adminUi.text, /admin-ui-ok/);

    const csrf = (await request(port, "/admin/api/v1/csrf", { token: adminToken })).json.data.token;
    assert.equal((await request(port, "/admin/api/v1/users", { method: "POST", token: adminToken, body: { userId: "sales-ngoc", teamId: "SALES" } })).status, 403);
    assert.equal((await request(port, "/admin/api/v1/users", { method: "POST", token: adminToken, csrf, origin: "https://evil.example", body: { userId: "sales-ngoc", teamId: "SALES" } })).status, 403);

    const created = await request(port, "/admin/api/v1/users", {
      method: "POST",
      token: adminToken,
      csrf,
      body: { userId: "sales-ngoc", displayName: "Ngọc", teamId: "SALES", role: "Sales" }
    });
    assert.equal(created.status, 201);
    assert.match(created.json.data.apiKey, /^ltn-user-/);
    assert.equal(created.headers["cache-control"], "no-store");
    assert.equal(created.json.data.user.keyHash, undefined);
    assert.doesNotMatch(await readFile(usersFile, "utf8"), new RegExp(created.json.data.apiKey));
    assert.doesNotMatch(await readFile(auditFile, "utf8"), new RegExp(created.json.data.apiKey));

    const managerCsrf = (await request(port, "/admin/api/v1/csrf", { token: managerToken })).json.data.token;
    const companyApprove = await request(port, "/admin/api/v1/memory/review/company-candidate/approve", {
      method: "POST",
      token: managerToken,
      csrf: managerCsrf,
      body: { note: "try" }
    });
    assert.equal(companyApprove.status, 403);

    const publicHealth = await request(port, "/health", { host: "127.0.0.1", origin: "" });
    assert.equal(publicHealth.status, 200);
  } finally {
    await close(server);
  }
});
