// Tự cập nhật SIMI làm mới danh sách model (catalog) theo Combo hiện tại và sửa model mặc định đã bị gỡ khỏi Combo;
// không đụng các phần khác của config.toml, không làm gì khi máy chưa dùng catalog.
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CATALOG = { models: [{ slug: "cc/claude-sonnet-5-5", display_name: "Claude Sonnet 5.5" }, { slug: "cc/claude-opus-5-5", display_name: "Claude Opus 5.5" }] };

async function setup(toml) {
  const seen = [];
  const server = http.createServer((req, res) => {
    seen.push({ url: req.url, auth: req.headers.authorization });
    if (req.url === "/v1/codex/config") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ defaultModel: "cc/claude-sonnet-5-5", modelCatalog: CATALOG }));
      return;
    }
    res.writeHead(404).end();
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const home = await mkdtemp(join(tmpdir(), "simi-catalog-"));
  const catalogPath = join(home, "ltn-model-catalog.json");
  await writeFile(catalogPath, JSON.stringify({ models: [{ slug: "cx/gpt-old" }] }));
  await writeFile(join(home, "config.toml"), toml.replace("CATALOG", catalogPath.replace(/\\/g, "\\\\")));
  process.env.CODEX_HOME = home;
  process.env.LTN_GATEWAY_BASE_URL = `http://127.0.0.1:${server.address().port}/v1`;
  process.env.LTN_TEAM_API_KEY = "sk-catalog-test";
  const mod = await import(`../scripts/auto-update.mjs?catalog=${Date.now()}-${Math.random()}`);
  return { mod, home, catalogPath, seen, close: () => server.close() };
}

test("làm mới catalog theo Combo và đổi model mặc định đã bị gỡ", async () => {
  const toml = '# BEGIN LTN CODEX MANAGED ROOT\r\nmodel = "cx/gpt-old"\r\nmodel_provider = "ltn_gateway"\r\nmodel_catalog_json = "CATALOG"\r\n# END LTN CODEX MANAGED ROOT\r\n\r\n[model_providers.ltn_gateway]\r\nname = "SIMI Gateway"\r\nmodel = "khong-dung"\r\n';
  const { mod, home, catalogPath, seen, close } = await setup(toml);
  try {
    const result = await mod.refreshModelCatalog(home);
    assert.equal(result.updated, true);
    assert.deepEqual(JSON.parse(await readFile(catalogPath, "utf8")), CATALOG);
    assert.deepEqual(result.defaultModel, { from: "cx/gpt-old", to: "cc/claude-sonnet-5-5" });
    const config = await readFile(join(home, "config.toml"), "utf8");
    assert.match(config, /^model = "cc\/claude-sonnet-5-5"\r$/m, "đổi đúng dòng model gốc, giữ CRLF");
    assert.match(config, /model = "khong-dung"/, "không đụng khoá model trong bảng khác");
    assert.match(config, /model_provider = "ltn_gateway"/);
    assert.ok(existsSync(join(home, "config.toml.before-model-fix")), "giữ bản trước khi sửa");
    assert.equal(seen[0].auth, "Bearer sk-catalog-test");
    const again = await mod.refreshModelCatalog(home);
    assert.equal(again.updated, false, "catalog không đổi thì không ghi lại");
    assert.equal(again.defaultModel, null, "model đang dùng hợp lệ thì giữ nguyên");
  } finally {
    close();
    delete process.env.LTN_TEAM_API_KEY;
  }
});

test("model user tự chọn còn trong Combo thì giữ nguyên; máy chưa dùng catalog thì bỏ qua", async () => {
  const kept = await setup('model = "cc/claude-opus-5-5"\nmodel_catalog_json = "CATALOG"\n');
  try {
    const result = await kept.mod.refreshModelCatalog(kept.home);
    assert.equal(result.defaultModel, null);
    assert.match(await readFile(join(kept.home, "config.toml"), "utf8"), /model = "cc\/claude-opus-5-5"/);
  } finally { kept.close(); }
  const none = await setup('model = "cx/gpt-old"\n');
  try {
    assert.deepEqual(await none.mod.refreshModelCatalog(none.home), { skipped: "no model catalog" });
    assert.equal(none.seen.length, 0, "không gọi Gateway");
  } finally { none.close(); delete process.env.LTN_TEAM_API_KEY; }
});
