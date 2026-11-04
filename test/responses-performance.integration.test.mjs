// Hiệu năng /v1/responses khi dùng Codex:
// (1) Codex gửi lại cả lịch sử kèm mọi ảnh chụp màn hình → body > 4 MB vẫn nhận, chỉ ảnh mới nhất được gửi lên 9Router
// (2) cùng 1 hội thoại (prompt_cache_key) thì phần bộ nhớ trong instructions giữ nguyên dù bộ nhớ team vừa đổi (không phá cache)
// (3) nhiều request cùng lúc: sổ lượt dùng Codex gộp ghi, không sót lượt nào
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const listen = (server) => new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", () => resolve(server.address().port)); });
const close = (server) => new Promise((resolve) => server.close(resolve));

test("Responses: body lớn, bộ nhớ cố định theo hội thoại, nhiều request cùng lúc", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-gw-perf-"));
  const memoryDir = join(root, "memory");
  await mkdir(memoryDir, { recursive: true });
  const key = "team-perf-test-key";
  const hash = (value) => createHash("sha256").update(value).digest("hex");
  await writeFile(join(root, "teams.json"), JSON.stringify({ teams: [{ code: "SALES", displayName: "Sales", keyHash: hash(key), memoryFile: "SALES.md", enabled: true }] }));
  await writeFile(join(root, "users.json"), JSON.stringify({ version: 1, users: {} }));
  await writeFile(join(memoryDir, "COMPANY.md"), "# COMPANY\nCompany fact");
  await writeFile(join(memoryDir, "SALES.md"), "# SALES\nTeam fact version one");

  const seen = [];
  const upstream = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : null;
    if (req.url === "/v1/responses") {
      seen.push(body);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ id: "resp", object: "response", status: "completed", output: [] }));
      return;
    }
    res.writeHead(404, { "content-type": "application/json" });
    res.end("{}");
  });
  const upstreamPort = await listen(upstream);
  Object.assign(process.env, {
    TEAMS_FILE: join(root, "teams.json"),
    LTN_USERS_CONFIG_FILE: join(root, "users.json"),
    MEMORY_DIR: memoryDir,
    UPSTREAM_BASE_URL: `http://127.0.0.1:${upstreamPort}`,
    ONEDRIVE_MODE: "local",
    ONEDRIVE_LOCAL_DIR: join(root, "sync"),
    CODEX_COMBO_PREMIUM: "SIMI-GPT",
    CODEX_COMBO_FREE: "SIMI-FREE",
    CODEX_DEFAULT_POLICY: "limited_daily",
    CODEX_DEFAULT_PREMIUM_LIMIT: "1000",
    CODEX_USAGE_FILE: join(root, "codex-usage.json"),
    LTN_LEGACY_TEAM_KEYS_ENABLED: "true",
    MEMORY_EXTRACTION_ENABLED: "false",
    MAX_BODY_BYTES: "4000000",
    RESPONSES_MAX_IMAGES: "4"
  });
  const { createGatewayServer } = await import(`../src/server.mjs?perf=${Date.now()}`);
  const gateway = createGatewayServer();
  const port = await listen(gateway);
  const post = (body, headers = {}) => fetch(`http://127.0.0.1:${port}/v1/responses`, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json", "x-ltn-client-id": "11111111-1111-4111-8111-111111111111", ...headers },
    body: JSON.stringify(body)
  });

  try {
    // (1) 12 ảnh chụp màn hình ~800 KB base64 mỗi ảnh ≈ 9,6 MB
    const shot = "data:image/png;base64," + "A".repeat(800_000);
    const input = [];
    for (let i = 0; i < 12; i++) {
      input.push({ type: "message", role: "user", content: [{ type: "input_text", text: `bước ${i}` }, { type: "input_image", image_url: shot }] });
    }
    const big = await post({ model: "SIMI-GPT", input, prompt_cache_key: "conv-big-0001" });
    assert.equal(big.status, 200, "body ~10 MB vẫn được nhận (trước đây 413)");
    const sentImages = JSON.stringify(seen.at(-1).input).split("input_image").length - 1;
    assert.equal(sentImages, 4, "chỉ 4 ảnh mới nhất được gửi lên 9Router");

    // (2) bộ nhớ cố định theo hội thoại
    const ask = (conv) => post({ model: "SIMI-GPT", input: "xin chào", prompt_cache_key: conv });
    assert.equal((await ask("conv-memory-0001")).status, 200);
    const first = seen.at(-1).instructions;
    assert.match(first, /Team fact version one/);
    await writeFile(join(memoryDir, "SALES.md"), "# SALES\nTeam fact version two");
    assert.equal((await ask("conv-memory-0001")).status, 200);
    assert.equal(seen.at(-1).instructions, first, "cùng hội thoại: instructions giữ nguyên từng byte");
    assert.equal((await ask("conv-memory-0002")).status, 200);
    assert.match(seen.at(-1).instructions, /Team fact version two/, "hội thoại mới đọc bộ nhớ mới");
    // không có prompt_cache_key → luôn đọc bộ nhớ mới nhất như cũ
    assert.equal((await post({ model: "SIMI-GPT", input: "xin chào" })).status, 200);
    assert.match(seen.at(-1).instructions, /Team fact version two/);

    // (3) 30 request cùng lúc
    const before = seen.length;
    const results = await Promise.all(Array.from({ length: 30 }, (_, i) => post({ model: "SIMI-GPT", input: `song song ${i}` })));
    assert.ok(results.every((r) => r.status === 200), "30 request cùng lúc đều thành công");
    assert.equal(seen.length - before, 30);
    // lượt dùng được xác nhận ngay sau khi trả lời xong → chờ chút cho ghi xong
    let usage, total = 0;
    for (let i = 0; i < 100 && total < 35; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
      usage = JSON.parse(await readFile(join(root, "codex-usage.json"), "utf8"));
      total = Object.values(usage.codex_daily_usage).reduce((n, r) => n + r.successful_request_count, 0);
    }
    assert.equal(total, 35, "sổ lượt dùng ghi đủ mọi request (5 + 30)");
    assert.ok(Object.values(usage.codex_daily_usage).every((r) => r.reservations.length === 0), "không còn chỗ giữ treo");
  } finally {
    await close(gateway);
    await close(upstream);
  }
});
