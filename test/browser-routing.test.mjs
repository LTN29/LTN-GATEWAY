import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const skill = (name) => readFile(new URL(`../vendor/9router-skills/${name}/SKILL.md`, import.meta.url), "utf8");
const description = (text) => text.match(/^description: (.*)$/m)[1];

test("marketplace and social links route to the SIMI browser, not curl or web fetch", async () => {
  const browser = await skill("simi-trinh-duyet");
  assert.match(description(browser), /Shopee/);
  assert.match(browser, /## Browser-first sites \(mandatory\)/);
  assert.match(browser, /never use curl, wget, Python requests, r\.jina\.ai/);
  assert.match(browser, /updatesimi/);

  const fetch = await skill("simi-doc-trang-web");
  assert.match(description(fetch), /KHÔNG dùng cho Shopee/);
  assert.match(fetch, /chuyển sang `simi-trinh-duyet`/);

  const search = await skill("simi-tim-kiem-web");
  assert.match(search, /không thay bằng tìm kiếm: dùng\n`simi-trinh-duyet`/);

  const router = await skill("simi");
  assert.match(router, /always use `simi-trinh-duyet` first, never curl or web fetch/);

  const mcp = await readFile(new URL("../scripts/browser-mcp.mjs", import.meta.url), "utf8");
  assert.match(mcp, /Use this FIRST for Shopee/);
});
