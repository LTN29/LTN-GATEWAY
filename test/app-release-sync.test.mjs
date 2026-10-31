import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createHash, randomBytes } from "node:crypto";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// GitHub giả: /releases/latest + tải file qua /releases/assets/:id (chuyển hướng như GitHub thật)
async function fakeGithub() {
  const st = { tag: null, notes: "", files: {}, badDigest: false, auth: [] };
  const srv = http.createServer((req, res) => {
    st.auth.push(req.headers.authorization || "");
    if (req.url === "/repos/LTN29/APP/releases/latest") {
      if (req.headers.authorization !== "Bearer tok") { res.writeHead(401); return res.end("{}"); }
      if (!st.tag) { res.writeHead(404); return res.end("{}"); }
      const assets = Object.entries(st.files).map(([name, body], i) => ({ id: i + 1, name, size: body.length, digest: "sha256:" + (st.badDigest ? "0".repeat(64) : createHash("sha256").update(body).digest("hex")) }));
      assets.push({ id: 99, name: "SHA256SUMS.txt", size: 1 });
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ tag_name: st.tag, body: st.notes, assets }));
    }
    const m = req.url.match(/^\/repos\/LTN29\/APP\/releases\/assets\/(\d+)$/);
    if (m) { res.writeHead(302, { location: `/blob/${m[1]}` }); return res.end(); }
    const b = req.url.match(/^\/blob\/(\d+)$/);
    if (b) { const body = Object.values(st.files)[Number(b[1]) - 1]; res.writeHead(200, { "content-length": body.length }); return res.end(body); }
    res.writeHead(404); res.end();
  });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  return { st, url: `http://127.0.0.1:${srv.address().port}`, close: () => srv.close() };
}

test("Gateway tự lấy bản app mới từ GitHub Release và đăng (latest.json)", async () => {
  const gh = await fakeGithub();
  const out = await mkdtemp(join(tmpdir(), "vp-sync-"));
  Object.assign(process.env, { VANPHONG_RELEASE_DIR: out, VANPHONG_GITHUB_REPO: "LTN29/APP", VANPHONG_GITHUB_TOKEN: "tok", VANPHONG_GITHUB_API: gh.url });
  const { syncOnce } = await import("../src/app-release-sync.mjs");
  try {
    assert.equal((await syncOnce()).status, "no-release");

    const setup = randomBytes(70_000), mac = randomBytes(50_000);
    Object.assign(gh.st, { tag: "v1.2.3", notes: "- Màn chiếu YouTube\n- Sửa lỗi", files: { "VanPhongAI-1.2.3-Setup.exe": setup, "VanPhongAI-1.2.3-mac-arm64.zip": mac } });
    const r = await syncOnce();
    assert.equal(r.status, "published"); assert.equal(r.version, "1.2.3");
    const latest = JSON.parse(await readFile(join(out, "latest.json"), "utf8"));
    assert.equal(latest.version, "1.2.3");
    assert.match(latest.notes, /Màn chiếu YouTube/, "ghi chú lấy từ nội dung Release");
    assert.equal(latest.files["win-setup"].sha256, createHash("sha256").update(setup).digest("hex"));
    assert.ok(latest.files["mac-arm64"], "đủ file cho các hệ điều hành có trong Release");
    assert.ok(!(await readdir(out)).includes(".incoming") || (await readdir(join(out, ".incoming"))).length === 0, "dọn thư mục tải tạm");
    assert.ok(gh.st.auth.some((a) => a === "Bearer tok"), "gửi token khi hỏi GitHub");

    assert.equal((await syncOnce()).status, "up-to-date", "đã có bản này thì không tải lại");

    Object.assign(gh.st, { tag: "v1.2.4", badDigest: true, files: { "VanPhongAI-1.2.4-Setup.exe": randomBytes(1000) } });
    await assert.rejects(syncOnce(), /không khớp SHA-256/);
    assert.equal(JSON.parse(await readFile(join(out, "latest.json"), "utf8")).version, "1.2.3", "file hỏng thì giữ nguyên bản đang phát hành");

    Object.assign(gh.st, { tag: "v1.2.2", badDigest: false, files: { "VanPhongAI-1.2.2-Setup.exe": randomBytes(1000) } });
    assert.equal((await syncOnce()).status, "up-to-date", "Release cũ hơn thì bỏ qua");

    process.env.VANPHONG_GITHUB_TOKEN = "sai";
    await assert.rejects(syncOnce(), /VANPHONG_GITHUB_TOKEN/);
  } finally { gh.close(); }
});
