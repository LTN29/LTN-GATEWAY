import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const hash = (k) => createHash("sha256").update(k).digest("hex");
const listen = (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==", "base64");

test("Hòm thư góp ý SIMI: gửi, bình chọn, IT duyệt, ẩn danh, rút lại", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-lobby-ideas-"));
  const keys = { ngoc: "key-ngoc", an: "key-an", it: "key-it", team: "key-team" };
  await writeFile(join(root, "teams.json"), JSON.stringify({ teams: [
    { code: "SALES", displayName: "Sales", keyHash: hash(keys.team), enabled: true, memoryFile: "SALES.md" },
    { code: "IT", displayName: "IT", keyHash: hash("x-it"), enabled: true, memoryFile: "IT.md" },
  ] }));
  await writeFile(join(root, "users.json"), JSON.stringify({ version: 1, users: {
    "s-ngoc": { displayName: "Ngọc", teamId: "SALES", keyHash: hash(keys.ngoc), enabled: true },
    "s-an": { displayName: "An", teamId: "SALES", keyHash: hash(keys.an), enabled: true },
    "it-nhan": { displayName: "Nhân IT", teamId: "IT", keyHash: hash(keys.it), enabled: true },
  } }));
  Object.assign(process.env, {
    TEAMS_FILE: join(root, "teams.json"), LTN_USERS_CONFIG_FILE: join(root, "users.json"), MEMORY_DIR: join(root, "memory"),
    LOBBY_DATA_DIR: join(root, "lobby"), LOBBY_CINEMA_LOOKUP: "false", UPSTREAM_BASE_URL: "http://127.0.0.1:9",
  });
  delete process.env.LOBBY_IDEA_REVIEW_TEAMS;
  const { createGatewayServer } = await import(`../src/server.mjs?ideas=${Date.now()}`);
  const server = createGatewayServer();
  const base = `http://127.0.0.1:${await listen(server)}/v1/lobby`;
  const call = (k, method, path, body) => fetch(`${base}/${path}`, { method, headers: { authorization: `Bearer ${keys[k]}`, "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const j = async (r) => { const t = await r.json(); return Object.assign(t, { _status: r.status }); };
  try {
    // ảnh chụp màn hình lỗi
    const up = await (await fetch(`${base}/upload?room=all`, { method: "POST", headers: { authorization: `Bearer ${keys.ngoc}`, "content-type": "image/png" }, body: PNG })).json();
    assert.ok(up.id, "tải ảnh lên");
    let r = await j(await call("ngoc", "POST", "ideas", { product: "web", site: "https://baohanh.simi.vn/tra-cuu", kind: "bug", title: "Trang tra cứu bảo hành báo lỗi khi nhập số seri", detail: "Nhập seri có dấu cách thì báo không tìm thấy", images: [up.id] }));
    assert.equal(r._status, 201);
    const bug = r.idea;
    assert.equal(bug.site, "baohanh.simi.vn", "chỉ giữ tên website");
    assert.equal(bug.status, "new"); assert.equal(bug.images.length, 1); assert.equal(bug.canEdit, true);
    r = await j(await call("an", "POST", "ideas", { product: "zalo", kind: "idea", title: "Mini app Zalo có nút đặt lịch bảo hành", anon: true }));
    const anon = r.idea;
    assert.equal((await j(await call("an", "POST", "ideas", { product: "web", title: "Thiếu website" })))._status, 400, "Website phải chọn trang");
    assert.equal((await j(await call("an", "POST", "ideas", { product: "tv", title: "Sản phẩm lạ" })))._status, 400);
    assert.equal((await j(await call("an", "POST", "ideas", { product: "mobile", title: "a" })))._status, 400, "tiêu đề quá ngắn");

    // bình chọn "Tôi cũng cần"
    r = await j(await call("an", "POST", "ideas/vote", { id: bug.id }));
    assert.equal(r.idea.votes, 1); assert.equal(r.idea.voted, true);
    assert.equal((await j(await call("an", "POST", "ideas/vote", { id: bug.id }))).idea.votes, 0, "bấm lại là bỏ");
    await call("an", "POST", "ideas/vote", { id: bug.id });

    // ẩn danh: đồng nghiệp không thấy tên, IT thấy để hỏi thêm
    let list = await j(await call("ngoc", "GET", "ideas"));
    const seen = list.ideas.find((x) => x.id === anon.id);
    assert.equal(seen.name, "Ẩn danh"); assert.equal(seen.by, null);
    assert.equal(list.canReview, false);
    assert.deepEqual(list.summary.web, { total: 1, open: 1, done: 0, fresh: 1 });
    assert.ok(list.sites.includes("prosper-supply.simi.vn"));
    const itList = await j(await call("it", "GET", "ideas"));
    assert.equal(itList.canReview, true, "team IT được duyệt");
    assert.equal(itList.ideas.find((x) => x.id === anon.id).name, "An");

    // chỉ IT duyệt
    assert.equal((await j(await call("ngoc", "POST", "ideas/review", { id: bug.id, status: "done" })))._status, 403);
    r = await j(await call("it", "POST", "ideas/review", { id: bug.id, status: "planned", reply: "Đã ghi nhận, sửa trong bản tuần sau" }));
    assert.equal(r.idea.status, "planned"); assert.equal(r.idea.replyBy, "Nhân IT");
    assert.equal((await j(await call("it", "POST", "ideas/review", { id: bug.id, status: "xyz" })))._status, 400);
    // IT đã xem → người gửi không tự rút được nữa; góp ý chưa xem thì rút được
    assert.equal((await j(await call("ngoc", "POST", "ideas/delete", { id: bug.id })))._status, 403);
    assert.equal((await j(await call("an", "POST", "ideas/delete", { id: anon.id })))._status, 200);
    list = await j(await call("ngoc", "GET", "ideas"));
    assert.deepEqual(list.ideas.map((x) => x.id), [bug.id]);
    assert.equal(list.ideas[0].votes, 1);
    assert.equal(list.ideas[0].canEdit, false);
    assert.equal((await fetch(`${base}/file?id=${bug.images[0].id}`, { headers: { authorization: `Bearer ${keys.an}` } })).status, 200, "ai cũng xem được ảnh góp ý");
    const m = await j(await call("an", "GET", "members"));
    assert.ok(m.features.includes("ideas") && !m.features.includes("honor"));
    await new Promise((res) => setTimeout(res, 500));
    const saved = JSON.parse(await readFile(join(root, "lobby", "ideas.json"), "utf8"));
    assert.equal(saved.ideas[0].reply, "Đã ghi nhận, sửa trong bản tuần sau", "lưu xuống đĩa");
  } finally {
    server.close();
  }
});
