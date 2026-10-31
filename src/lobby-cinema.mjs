// Rạp chiếu trong Sảnh online: mọi người gửi link YouTube, xếp hàng theo lượt, cả quán cùng xem một video đồng bộ.
// Gateway giữ hàng chờ + mốc giờ bắt đầu; app tự tính đang tới giây nào. Không lưu xuống đĩa (khởi động lại là trống).
import { randomUUID } from "node:crypto";
import { jsonLog } from "./utils.mjs";

const ID = /^[A-Za-z0-9_-]{11}$/;
export const cinemaConfig = {
  get maxQueue() { return Math.max(1, Number(process.env.LOBBY_CINEMA_MAX_QUEUE || 30)); },
  get perPerson() { return Math.max(1, Number(process.env.LOBBY_CINEMA_PER_PERSON || 3)); },
  get maxSeconds() { return Math.max(60, Number(process.env.LOBBY_CINEMA_MAX_MINUTES || 180) * 60); },
  // không biết độ dài (YouTube không trả về) → tối đa bao lâu rồi tự chuyển bài
  get unknownSeconds() { return Math.max(60, Number(process.env.LOBBY_CINEMA_UNKNOWN_MINUTES || 30) * 60); },
  // false = không hỏi YouTube tên / độ dài video (máy chủ không ra Internet)
  get lookup() { return process.env.LOBBY_CINEMA_LOOKUP !== "false"; }
};

const httpError = (status, message, type = "invalid_request_error") => Object.assign(new Error(message), { statusCode: status, type });

// link YouTube → mã video 11 ký tự (watch?v=, youtu.be/, shorts/, embed/, live/, music.youtube.com)
export function youtubeId(input) {
  const s = String(input || "").trim();
  if (ID.test(s)) return s;
  let u;
  try { u = new URL(/^https?:\/\//i.test(s) ? s : "https://" + s); } catch { return null; }
  const host = u.hostname.replace(/^(www|m|music)\./, "");
  let id = null;
  if (host === "youtu.be") id = u.pathname.split("/")[1];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") id = u.searchParams.get("v");
    else { const m = u.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/); if (m) id = m[1]; }
  }
  return id && ID.test(id) ? id : null;
}

const clean = (s, n) => String(s || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);

async function getJson(url, ms) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms);
  try { return await fetch(url, { signal: ac.signal, headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36", "accept-language": "vi,en;q=0.8" } }); } finally { clearTimeout(t); }
}

// tên + độ dài video; video riêng tư / không cho nhúng thì YouTube oEmbed trả 401/403/404
export async function lookupVideo(videoId) {
  if (!cinemaConfig.lookup) return { title: "", seconds: null };
  let title = ""; let author = "";
  try {
    const r = await getJson(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent("https://www.youtube.com/watch?v=" + videoId)}`, 6000);
    if (r.status === 401 || r.status === 403) throw httpError(400, "Video này không cho phát nhúng ở trang khác – chọn video khác nhé");
    if (r.status === 404 || r.status === 400) throw httpError(400, "Không tìm thấy video (riêng tư, đã xoá hoặc link sai)");
    if (r.ok) { const j = await r.json(); title = clean(j.title, 160); author = clean(j.author_name, 80); }
  } catch (e) { if (e.statusCode) throw e; /* mạng lỗi → vẫn cho chiếu, không có tên */ }
  let seconds = null;
  try {
    const r = await getJson(`https://www.youtube.com/watch?v=${videoId}&hl=vi`, 8000);
    if (r.ok) {
      const m = (await r.text()).match(/"lengthSeconds":"(\d+)"/);
      if (m && Number(m[1]) > 0) seconds = Number(m[1]);
    }
  } catch { /* không biết độ dài: app báo lại khi phát, hoặc tự chuyển sau unknownSeconds */ }
  return { title, author, seconds };
}

export class Cinema {
  constructor({ broadcast, onlineCount, lookup = lookupVideo, now = () => Date.now() }) {
    this.broadcast = broadcast;     // (event, data) → gửi cho mọi người trong Sảnh
    this.onlineCount = onlineCount; // () → số người đang online (để tính phiếu chuyển bài)
    this.lookup = lookup;
    this.now = now;
    this.current = null;            // { id, videoId, title, author, by, byName, startedAt, seconds, skips:Set }
    this.queue = [];                // [{ id, videoId, title, author, by, byName, addedAt, seconds }]
    this.timer = null;
  }

  // xếp hàng theo lượt: mỗi người 1 video / vòng; ai đang có video chiếu thì lùi xuống vòng sau
  order() {
    const seen = new Map();
    const cur = this.current && this.current.by;
    const ranked = this.queue.map((it, i) => {
      const k = (seen.get(it.by) || 0) + (it.by === cur ? 1 : 0);
      seen.set(it.by, (seen.get(it.by) || 0) + 1);
      return { it, round: k, i };
    });
    ranked.sort((a, b) => a.round - b.round || a.i - b.i);
    this.queue = ranked.map((r) => r.it);
  }

  skipNeed() { return Math.max(1, Math.ceil(Math.max(1, this.onlineCount()) / 2)); }

  state() {
    const c = this.current;
    return {
      now: this.now(),
      current: c ? { id: c.id, videoId: c.videoId, title: c.title, author: c.author, by: c.by, byName: c.byName, startedAt: c.startedAt, seconds: c.seconds, skips: c.skips.size, skipNeed: this.skipNeed() } : null,
      queue: this.queue.map((q) => ({ id: q.id, videoId: q.videoId, title: q.title, author: q.author, by: q.by, byName: q.byName, seconds: q.seconds }))
    };
  }

  emit() { this.broadcast("cinema", this.state()); }

  schedule() {
    clearTimeout(this.timer); this.timer = null;
    const c = this.current; if (!c) return;
    const len = c.seconds || cinemaConfig.unknownSeconds;
    const ms = Math.max(0, c.startedAt + len * 1000 + 2000 - this.now());
    this.timer = setTimeout(() => this.next("ended"), ms);
    this.timer.unref?.();
  }

  // chiếu video kế tiếp trong hàng chờ (hoặc tắt màn hình khi hết)
  next(reason) {
    const prev = this.current;
    const it = this.queue.shift();
    this.current = it ? { ...it, startedAt: this.now() + 1500, skips: new Set() } : null;
    this.order();
    this.schedule();
    if (prev || it) jsonLog("lobby_cinema_next", { reason, videoId: it ? it.videoId : null });
    this.emit();
  }

  async add(ident, name, url) {
    const videoId = youtubeId(url);
    if (!videoId) throw httpError(400, "Link chưa đúng – dán link YouTube (youtube.com/watch?v=… hoặc youtu.be/…)");
    if (this.queue.length >= cinemaConfig.maxQueue) throw httpError(429, "Hàng chờ đã đầy, đợi bớt video rồi thêm nhé", "rate_limit_error");
    if (this.queue.filter((q) => q.by === ident.id).length >= cinemaConfig.perPerson) throw httpError(429, `Mỗi người xếp tối đa ${cinemaConfig.perPerson} video – đợi tới lượt rồi thêm tiếp nhé`, "rate_limit_error");
    if ((this.current && this.current.videoId === videoId) || this.queue.some((q) => q.videoId === videoId)) throw httpError(409, "Video này đã có trong hàng chờ", "conflict_error");
    const meta = await this.lookup(videoId);
    if (meta.seconds && meta.seconds > cinemaConfig.maxSeconds) throw httpError(400, `Video dài quá ${Math.round(cinemaConfig.maxSeconds / 60)} phút`);
    const item = { id: randomUUID(), videoId, title: meta.title || "Video YouTube", author: meta.author || "", by: ident.id, byName: name, addedAt: this.now(), seconds: meta.seconds || null };
    this.queue.push(item);
    jsonLog("lobby_cinema_add", { member: ident.id, videoId });
    if (!this.current) { this.next("start"); return { item, playing: true }; }
    this.order();
    this.emit();
    return { item, playing: false, position: this.queue.indexOf(item) + 1 };
  }

  // người thêm video bỏ qua ngay; người khác bỏ phiếu, đủ quá nửa số người online thì chuyển
  skip(ident) {
    const c = this.current;
    if (!c) throw httpError(409, "Màn hình đang trống", "conflict_error");
    if (c.by !== ident.id) {
      c.skips.add(ident.id);
      if (c.skips.size < this.skipNeed()) { this.emit(); return { skipped: false, votes: c.skips.size, need: this.skipNeed() }; }
    }
    this.next(c.by === ident.id ? "skip_owner" : "skip_vote");
    return { skipped: true };
  }

  // chỉ người thêm mới gỡ được video của mình khỏi hàng chờ
  remove(ident, id) {
    const i = this.queue.findIndex((q) => q.id === id);
    if (i < 0) throw httpError(404, "Video không còn trong hàng chờ", "not_found_error");
    if (this.queue[i].by !== ident.id) throw httpError(403, "Chỉ người thêm mới gỡ được video này", "permission_error");
    this.queue.splice(i, 1);
    this.order();
    this.emit();
    return { ok: true };
  }

  // app báo độ dài video (khi Gateway không tự lấy được) → hẹn giờ chuyển bài chính xác
  duration(videoId, seconds) {
    const c = this.current;
    const s = Math.round(Number(seconds));
    if (!c || c.videoId !== videoId || c.seconds || !(s > 0 && s <= cinemaConfig.maxSeconds)) return { ok: false };
    c.seconds = s;
    this.schedule();
    this.emit();
    return { ok: true };
  }
}
