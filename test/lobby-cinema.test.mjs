import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { Cinema, youtubeId } from "../src/lobby-cinema.mjs";

test("nhận đủ kiểu link YouTube, từ chối link lạ", () => {
  for (const u of ["https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s", "youtu.be/dQw4w9WgXcQ?si=x", "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ", "https://music.youtube.com/watch?v=dQw4w9WgXcQ", "https://www.youtube.com/live/dQw4w9WgXcQ", "dQw4w9WgXcQ"]) {
    assert.equal(youtubeId(u), "dQw4w9WgXcQ", u);
  }
  for (const u of ["https://vimeo.com/123", "https://www.youtube.com/watch?v=short", "javascript:alert(1)", "", "https://evil.com/watch?v=dQw4w9WgXcQ"]) assert.equal(youtubeId(u), null, u);
});

function make(online = 4) {
  const events = [];
  let t = 1_000_000;
  const c = new Cinema({ broadcast: (ev, d) => events.push(d), onlineCount: () => online, lookup: async (id) => ({ title: "Video " + id, seconds: id.startsWith("l") ? 99999 : 60 }), now: () => t });
  return { c, events, tick: (ms) => { t += ms; } };
}
const who = (id) => ({ id });
const vid = (ch) => ch.repeat(11);

test("xếp hàng theo lượt: mỗi người 1 video mỗi vòng", async () => {
  const { c } = make();
  await c.add(who("a"), "An", vid("a"));          // đang chiếu
  await c.add(who("a"), "An", vid("b"));
  await c.add(who("a"), "An", vid("c"));
  await c.add(who("b"), "Bình", vid("d"));
  await c.add(who("e"), "Em", vid("e"));
  await c.add(who("b"), "Bình", vid("f"));
  assert.deepEqual(c.state().queue.map((q) => q.videoId[0]), ["d", "e", "b", "f", "c"]);
  await assert.rejects(c.add(who("a"), "An", vid("g")).then(() => c.add(who("a"), "An", vid("h"))), /tối đa 3/);
  await assert.rejects(c.add(who("x"), "X", vid("d")), /đã có/);
  await assert.rejects(c.add(who("x"), "X", "https://example.com"), /Link chưa đúng/);
  await assert.rejects(c.add(who("x"), "X", vid("l")), /dài quá/);
  clearTimeout(c.timer);
});

test("chuyển bài: chủ video bỏ qua ngay, người khác cần quá nửa phiếu", async () => {
  const { c } = make(4);
  await c.add(who("a"), "An", vid("a"));
  await c.add(who("b"), "Bình", vid("b"));
  assert.equal(c.skip(who("b")).skipped, false);
  assert.equal(c.skip(who("b")).votes, 1, "bấm 2 lần chỉ tính 1 phiếu");
  assert.equal(c.skip(who("c")).skipped, true, "2/4 người → chuyển");
  assert.equal(c.state().current.videoId, vid("b"));
  assert.equal(c.skip(who("b")).skipped, true, "chủ video bỏ qua ngay");
  assert.equal(c.state().current, null, "hết hàng chờ → tắt màn hình");
  assert.throws(() => c.skip(who("a")), /trống/);
});

test("hết video tự chuyển bài; không biết độ dài thì app báo lại", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const { c, tick } = make();
    c.lookup = async () => ({ title: "", seconds: null });
    await c.add(who("a"), "An", vid("a"));
    await c.add(who("b"), "Bình", vid("b"));
    assert.equal(c.state().current.seconds, null);
    assert.equal(c.duration(vid("z"), 30).ok, false, "chỉ nhận độ dài của video đang chiếu");
    assert.equal(c.duration(vid("a"), 30).ok, true);
    assert.equal(c.duration(vid("a"), 999).ok, false, "chỉ nhận lần báo đầu tiên");
    tick(33_600); mock.timers.tick(33_600);
    assert.equal(c.state().current.videoId, vid("b"));
    assert.equal(c.state().current.title, "Video YouTube", "không có tên thì để tên chung");
    clearTimeout(c.timer);
  } finally { mock.timers.reset(); }
});

test("chỉ người thêm mới gỡ được video khỏi hàng chờ", async () => {
  const { c } = make();
  await c.add(who("a"), "An", vid("a"));
  const { item } = await c.add(who("a"), "An", vid("b"));
  assert.throws(() => c.remove(who("b"), item.id), /Chỉ người thêm/);
  assert.equal(c.remove(who("a"), item.id).ok, true);
  assert.equal(c.state().queue.length, 0);
  clearTimeout(c.timer);
});
