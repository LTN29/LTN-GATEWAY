import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LobbyHonor, fortuneLevel, periodRange } from "../src/lobby-honor.mjs";

const hash = (k) => createHash("sha256").update(k).digest("hex");
const listen = (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));
// 10:00 sáng giờ VN
const at = (date, h = 10) => Date.parse(`${date}T${String(h - 7).padStart(2, "0")}:00:00Z`);

test("Quẻ trên Gateway khớp fortune.js của app", () => {
  // giá trị chạy từ src/renderer/fortune.js (app Văn Phòng AI)
  assert.deepEqual(fortuneLevel("u:s-ngoc", "2026-11-06"), { n: 5, level: "Đại cát" });
  assert.deepEqual(fortuneLevel("u:s-an", "2026-11-06"), { n: 26, level: "Trung cát" });
  assert.deepEqual(fortuneLevel("t:SALES:abcd1234", "2026-11-02"), { n: 14, level: "Thượng cát" });
  assert.deepEqual(fortuneLevel("u:s-ngoc", "2026-11-03"), { n: 27, level: "Trung cát" });
});

test("Kỳ vinh danh: tuần Thứ Hai → Chủ nhật, tháng", () => {
  assert.deepEqual(periodRange("week", "2026-11-06"), { period: "week", from: "2026-11-02", to: "2026-11-08", label: "Tuần 02/11 – 08/11" });
  assert.equal(periodRange("week", "2026-11-02").from, "2026-11-02", "Thứ Hai là ngày đầu tuần");
  assert.equal(periodRange("week", "2026-11-08").from, "2026-11-02", "Chủ nhật vẫn thuộc tuần đó");
  assert.equal(periodRange("week", "2026-11-06", 1).from, "2026-10-26");
  assert.deepEqual(periodRange("month", "2026-11-06"), { period: "month", from: "2026-11-01", to: "2026-11-30", label: "Tháng 11/2026" });
  assert.equal(periodRange("month", "2026-01-15", 1).from, "2025-12-01");
  assert.equal(periodRange("month", "2028-02-10").to, "2028-02-29", "năm nhuận");
});

test("Bảng vàng: điểm quẻ, khấn có trần, AI theo ngày", async () => {
  let now = at("2026-11-03");
  const analytics = { dailyUsers: {
    a: { date: "2026-11-03", userId: "s-an", requests: 130, success: 120 },
    b: { date: "2026-11-04", userId: "s-an", requests: 10, success: 10 },
    c: { date: "2026-11-03", userId: "s-ngoc", requests: 40, success: 35 },
    old: { date: "2026-10-20", userId: "s-bao", requests: 999, success: 999 },
  } };
  const H = new LobbyHonor({ now: () => now, analytics: async () => analytics, nameOf: (id) => ({ "u:s-an": { name: "An", teamName: "Sales" } })[id] || null });
  const ngoc = { id: "u:s-ngoc", name: "Ngọc", teamName: "Sales" };
  const an = { id: "u:s-an", name: "An", teamName: "Sales" };

  const f1 = H.fortune(ngoc);
  assert.equal(f1.level, "Trung cát"); assert.equal(f1.first, true);
  assert.equal(H.fortune(ngoc).first, false, "mỗi ngày tính 1 lần");
  now = at("2026-11-06"); const f2 = H.fortune(ngoc); assert.equal(f2.level, "Đại cát");
  H.fortune(an);

  assert.equal(H.pray(ngoc).counted, true);
  assert.equal(H.pray(ngoc).counted, false, "khấn liên tục không tính");
  now += 61_000; assert.equal(H.pray(ngoc).counted, true);
  now += 61_000; assert.equal(H.pray(ngoc).counted, true);
  now += 61_000; const p4 = H.pray(ngoc); assert.equal(p4.counted, false, "tối đa 3 lần / ngày"); assert.equal(p4.prays, 3);

  const v = await H.view(ngoc);
  assert.equal(v.from, "2026-11-02");
  assert.deepEqual(v.boards.ai.map((x) => [x.name, x.score]), [["An", 130], ["Ngọc", 35]], "người ngoài kỳ không vào bảng");
  assert.deepEqual(v.boards.lucky.map((x) => [x.name, x.score, x.dai]), [["Ngọc", 4, 1], ["An", 1, 0]]);
  // Ngọc: quẻ 10 + 30, khấn 3×5, AI floor(35/5)=7 → 62 ; An: quẻ 10, AI min(20, 24) + 2 = 22 → 32
  assert.deepEqual(v.boards.thantai.map((x) => [x.name, x.score]), [["Ngọc", 62], ["An", 32]]);
  assert.deepEqual(v.boards.thantai[0].parts, { fortune: 40, pray: 15, ai: 7 });
  assert.equal(v.me.thantai.rank, 1); assert.equal(v.me.today.fortune, "Đại cát"); assert.equal(v.me.today.prays, 3);
  assert.equal(v.boards.ai[0].team, "Sales");

  now = at("2026-11-10");
  const next = await H.view(an);
  assert.equal(next.boards.lucky.length, 0, "sang tuần mới bảng trống");
  assert.equal(next.last.thantai.name, "Ngọc", "nhắc nhà vô địch tuần trước");
  const month = await H.view(an, { period: "month" });
  assert.equal(month.boards.thantai[0].name, "Ngọc");
});

test("Bảng vàng qua HTTP", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-lobby-honor-"));
  const keys = { ngoc: "key-ngoc", an: "key-an" };
  await writeFile(join(root, "teams.json"), JSON.stringify({ teams: [{ code: "SALES", displayName: "Sales", keyHash: hash("x"), enabled: true, memoryFile: "SALES.md" }] }));
  await writeFile(join(root, "users.json"), JSON.stringify({ version: 1, users: {
    "s-ngoc": { displayName: "Ngọc", teamId: "SALES", keyHash: hash(keys.ngoc), enabled: true },
    "s-an": { displayName: "An", teamId: "SALES", keyHash: hash(keys.an), enabled: true },
    "s-bao": { displayName: "Bảo", teamId: "SALES", keyHash: hash("key-bao"), enabled: true }
  } }));
  const { localDate } = await import("../src/lobby-honor.mjs");
  const today = localDate();
  await writeFile(join(root, "analytics.json"), JSON.stringify({ version: 1, dailyUsers: { [`${today}|s-bao`]: { date: today, userId: "s-bao", teamId: "SALES", requests: 50, success: 48 } } }));
  Object.assign(process.env, {
    TEAMS_FILE: join(root, "teams.json"), LTN_USERS_CONFIG_FILE: join(root, "users.json"), MEMORY_DIR: join(root, "memory"),
    USER_ANALYTICS_FILE: join(root, "analytics.json"),
    LOBBY_DATA_DIR: join(root, "lobby"), LOBBY_CINEMA_LOOKUP: "false", UPSTREAM_BASE_URL: "http://127.0.0.1:9"
  });
  const { config } = await import("../src/config.mjs");
  config.userAnalyticsFile = join(root, "analytics.json"); // config đã nạp từ import đầu file
  const { createGatewayServer } = await import(`../src/server.mjs?honor=${Date.now()}`);
  const server = createGatewayServer();
  const base = `http://127.0.0.1:${await listen(server)}/v1/lobby`;
  const auth = (k) => ({ authorization: `Bearer ${keys[k]}` });
  const post = (k, path) => fetch(`${base}/${path}`, { method: "POST", headers: { ...auth(k), "content-type": "application/json" }, body: "{}" });
  try {
    const f = await (await post("ngoc", "honor/fortune")).json();
    assert.equal(f.level, fortuneLevel("u:s-ngoc", today).level);
    assert.equal((await (await post("ngoc", "honor/pray")).json()).counted, true);
    assert.equal((await (await post("ngoc", "honor/pray")).json()).counted, false);
    const r = await fetch(`${base}/honor`, { headers: auth("an") });
    assert.equal(r.status, 200);
    const v = await r.json();
    assert.deepEqual(v.boards.ai.map((x) => [x.name, x.score]), [["Bảo", 48]], "người chưa vào Sảnh vẫn có tên từ danh sách tài khoản");
    assert.equal(v.boards.lucky[0].name, "Ngọc");
    assert.equal(v.boards.thantai[0].name, "Ngọc");
    assert.equal(v.me.lucky.rank, null);
    const m = await (await fetch(`${base}/members`, { headers: auth("an") })).json();
    assert.ok(m.features.includes("honor"));
    await new Promise((res) => setTimeout(res, 600));
    const saved = JSON.parse(await readFile(join(root, "lobby", "honor.json"), "utf8"));
    assert.equal(saved.days[today]["u:s-ngoc"].p, 1, "lưu xuống đĩa");
    assert.equal((await fetch(`${base}/honor?period=month`, { headers: auth("an") }).then((x) => x.json())).period, "month");
  } finally {
    server.close();
  }
});
