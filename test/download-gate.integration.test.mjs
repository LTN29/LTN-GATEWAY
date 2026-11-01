import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, writeFile, mkdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const hash = (k) => createHash("sha256").update(k).digest("hex");
const listen = (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));
const cookieOf = (r) => (r.headers.get("set-cookie") || "").split(";")[0];

test("Trang tải Văn Phòng AI: ai cũng xem được, bấm tải mới hỏi email – chỉ email admin bật trong app mới tải được; app tự cập nhật vẫn tải công khai", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-dlgate-"));
  const rel = join(root, "rel"); await mkdir(rel, { recursive: true });
  const setup = Buffer.from("fake-setup-" + "y".repeat(3000));
  await writeFile(join(rel, "VanPhongAI-0.9.14-Setup.exe"), setup);
  await writeFile(join(rel, "latest.json"), JSON.stringify({ version: "0.9.14", date: "2026-11-01", notes: "", files: { "win-setup": { name: "VanPhongAI-0.9.14-Setup.exe", size: setup.length, sha256: hash(setup) } } }));
  const keys = { ltn: "key-ltn", ngoc: "key-ngoc" };
  await writeFile(join(root, "teams.json"), JSON.stringify({ teams: [{ code: "IT", displayName: "IT", keyHash: hash("x"), enabled: true, memoryFile: "IT.md" }] }));
  await writeFile(join(root, "users.json"), JSON.stringify({ version: 1, users: {
    "it-ltn": { displayName: "LTN", teamId: "IT", keyHash: hash(keys.ltn), enabled: true },
    "it-ngoc": { displayName: "Ngọc", teamId: "IT", keyHash: hash(keys.ngoc), enabled: true }
  } }));
  Object.assign(process.env, {
    TEAMS_FILE: join(root, "teams.json"), LTN_USERS_CONFIG_FILE: join(root, "users.json"), MEMORY_DIR: join(root, "memory"),
    LOBBY_DATA_DIR: join(root, "lobby"), LOBBY_CINEMA_LOOKUP: "false", LOBBY_ADMINS: "it-ltn", VANPHONG_RELEASE_DIR: rel,
    VANPHONG_DOWNLOAD_GATE: "on", CODEX_USAGE_FILE: join(root, "codex-usage.json")
  });
  const { createGatewayServer } = await import(`../src/server.mjs?dlgate=${Date.now()}`);
  const server = createGatewayServer();
  const port = await listen(server);
  const base = `http://127.0.0.1:${port}/install/vanphong`;
  const api = `http://127.0.0.1:${port}/v1/lobby`;
  const admin = (k, body) => fetch(`${api}/admin`, { method: "POST", headers: { authorization: `Bearer ${keys[k]}`, "content-type": "application/json" }, body: JSON.stringify(body) });
  const login = (email, headers = {}) => fetch(base + "/login", { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify({ email }) });
  try {
    // ai cũng xem được trang, ảnh, video – chưa nhập email thì trang không biết ai
    const pub = await fetch(base);
    assert.equal(pub.status, 200);
    const pHtml = await pub.text();
    assert.match(pHtml, /Codex,/); assert.match(pHtml, /id="mailForm"/, "có hộp nhập email để dùng khi bấm tải");
    assert.match(pHtml, /"email":""/); assert.doesNotMatch(pHtml, /gateForm|Quản lý danh sách/);
    assert.equal(pub.headers.get("cache-control"), "no-store");
    assert.equal((await fetch(base + "/site/demo.mp4", { headers: { range: "bytes=0-9" } })).status, 206);
    assert.equal((await fetch(base + "/site/shots/office.webp")).status, 200);
    assert.equal((await fetch(base + "/site/icon.png")).status, 200);
    assert.equal((await fetch(base + "/site/..%2F..%2Fpackage.json")).status, 404);
    assert.equal((await fetch(base + "/site/gate.html")).status, 404);
    // bấm tải khi chưa nhập email → quay về phần Tải về (trang sẽ hỏi email)
    const al = await fetch(base + "/latest/win-setup", { redirect: "manual" });
    assert.equal(al.status, 302); assert.equal(al.headers.get("location"), "/install/vanphong#tai-ve");
    // app tự cập nhật (không có cookie) vẫn đọc latest.json và tải file
    assert.equal((await fetch(base + "/latest.json")).status, 200);
    assert.equal(Buffer.from(await (await fetch(base + "/VanPhongAI-0.9.14-Setup.exe")).arrayBuffer()).equals(setup), true);

    // danh sách trống: ai cũng bị từ chối
    assert.equal((await login("ngoc.le@simigo.vn")).status, 403);

    // admin thêm danh sách trong tab Quản trị của app (dán cả loạt), người thường không làm được
    assert.equal((await admin("ngoc", { action: "dl-add", emails: "ngoc.le@simigo.vn" })).status, 403);
    const add = await (await admin("ltn", { action: "dl-add", emails: "Ngoc.Le@SimiGo.vn\nan.tran@simigo.vn, khach_gmail.com#EXT#@simigo.onmicrosoft.com\nkhong-phai-email" })).json();
    assert.deepEqual([add.added, add.again, add.badCount], [3, 0, 1]);
    const ov = await (await fetch(`${api}/admin`, { headers: { authorization: `Bearer ${keys.ltn}` } })).json();
    assert.equal(ov.download.total, 3); assert.equal(ov.download.on, 3); assert.equal(ov.download.gate, true);
    assert.ok(ov.download.people.some((p) => p.email === "khach_gmail.com#ext#@simigo.onmicrosoft.com" && p.on));
    assert.ok(ov.audit.some((a) => a.action === "download-add"), "ghi nhật ký quản trị");

    // vào bằng email trong danh sách (không phân biệt hoa thường, có khoảng trắng)
    const ok = await login("  NGOC.LE@simigo.vn ");
    assert.equal(ok.status, 200);
    const sc = ok.headers.get("set-cookie");
    assert.match(sc, /HttpOnly/); assert.match(sc, /SameSite=Lax/); assert.match(sc, /Path=\/install\/vanphong/);
    const ck = { cookie: cookieOf(ok) };
    const page = await (await fetch(base, { headers: ck })).text();
    assert.match(page, /Codex,/); assert.match(page, /"email":"ngoc\.le@simigo\.vn"/); assert.match(page, /VanPhongAI-0\.9\.14-Setup\.exe/);
    assert.match(page, /bản 0\.9\.14/);
    assert.doesNotMatch(page, /@@VER@@|@@DATA@@/);
    const vid = await fetch(base + "/site/demo.mp4", { headers: { ...ck, range: "bytes=0-99" } });
    assert.equal(vid.status, 206, "video tua được"); assert.equal(vid.headers.get("content-type"), "video/mp4");
    const al2 = await fetch(base + "/latest/win-setup", { headers: ck, redirect: "manual" });
    assert.equal(al2.headers.get("location"), "/install/vanphong/VanPhongAI-0.9.14-Setup.exe");

    // cookie giả / sửa email trong cookie → không vào được
    const [b64, exp, sig] = cookieOf(ok).split("=")[1].split(".");
    const forged = `vpdl=${Buffer.from("an.tran@simigo.vn").toString("base64url")}.${exp}.${sig}`;
    assert.match(await (await fetch(base, { headers: { cookie: forged } })).text(), /"email":""/);
    assert.equal((await fetch(base + "/latest/win-setup", { headers: { cookie: forged }, redirect: "manual" })).headers.get("location"), "/install/vanphong#tai-ve");
    assert.ok(b64);

    // admin tắt email → người đó bị chặn ngay (kể cả cookie còn hạn); bật lại thì vào lại được
    assert.equal((await admin("ltn", { action: "dl-set", email: "ngoc.le@simigo.vn", on: false })).status, 200);
    assert.match(await (await fetch(base, { headers: ck })).text(), /"email":""/);
    assert.equal((await fetch(base + "/latest/win-setup", { headers: ck, redirect: "manual" })).headers.get("location"), "/install/vanphong#tai-ve", "bị tắt thì bấm tải lại bị hỏi email");
    assert.equal((await login("ngoc.le@simigo.vn")).status, 403);
    await admin("ltn", { action: "dl-set", email: "ngoc.le@simigo.vn", on: true });
    assert.match(await (await fetch(base, { headers: ck })).text(), /"email":"ngoc\.le@simigo\.vn"/);
    // xoá khỏi danh sách
    assert.equal((await admin("ltn", { action: "dl-remove", email: "an.tran@simigo.vn" })).status, 200);
    assert.equal((await admin("ltn", { action: "dl-remove", email: "an.tran@simigo.vn" })).status, 404);
    assert.equal((await login("an.tran@simigo.vn")).status, 403);
    // danh sách lưu trên đĩa của Gateway (không ở trang web)
    const saved = JSON.parse(await readFile(join(root, "lobby", "download-access.json"), "utf8"));
    assert.deepEqual(saved.people.map((p) => p.email).sort(), ["khach_gmail.com#ext#@simigo.onmicrosoft.com", "ngoc.le@simigo.vn"]);

    // đăng xuất xoá cookie
    const out = await fetch(base + "/logout", { method: "POST", headers: ck });
    assert.match(out.headers.get("set-cookie"), /Max-Age=0/);
    assert.equal((await fetch(base + "/login")).status, 405);

    // dò email: thử sai nhiều lần thì bị chặn 10 phút
    const ipH = { "x-forwarded-for": "203.0.113.9" };
    let last;
    for (let i = 0; i < 13; i++) last = await login(`do-${i}@simigo.vn`, ipH);
    assert.equal(last.status, 429);
    assert.equal((await login("ngoc.le@simigo.vn", ipH)).status, 429);
  } finally {
    await new Promise((r) => server.close(r));
    for (const k of ["VANPHONG_RELEASE_DIR", "VANPHONG_DOWNLOAD_GATE", "LOBBY_ADMINS"]) delete process.env[k];
  }
});
