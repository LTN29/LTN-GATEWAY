// 🏆 Bảng vàng Sảnh: vinh danh theo tuần / tháng
//   🤖 Chiến thần AI     – nhiều lượt dùng AI thành công nhất (lấy từ thống kê AI của Gateway, chỉ tài khoản cá nhân)
//   🍀 Người may mắn nhất – bóc được nhiều quẻ xịn nhất (Đại cát 3 điểm · Thượng cát 2 · Trung cát 1)
//   💰 Thần Tài sống      – tổng điểm Tài lộc: quẻ + khấn Thần Tài + chăm dùng AI (mỗi phần có trần theo ngày, không cày được)
// Quẻ do Gateway tự tính (cùng công thức với fortune.js của app) → không gian lận mức quẻ được.
import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { config, loadUsers } from "./config.mjs";
import { readUserAnalyticsSnapshot } from "./user-analytics-store.mjs";

const httpError = (status, message, type = "invalid_request_error") => Object.assign(new Error(message), { statusCode: status, type });

// ---- quẻ: y hệt src/renderer/fortune.js của app (đổi ở đó thì đổi ở đây) ----
const LEVEL = "ĐĐTGĐTTGĐTTGĐTGĐGTTĐTGĐTGGGĐGĐ".split("").map((c) => ({ "Đ": "Đại cát", "T": "Thượng cát", "G": "Trung cát" })[c]);
function hash(str) { let h = 0x811c9dc5; for (const ch of String(str)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
function rng(seed) { let s = seed || 1; return () => { s = (Math.imul(s ^ (s >>> 15), 0x2c1b3c6d) + 0x6d2b79f5) >>> 0; s ^= s >>> 13; return (s >>> 0) / 4294967296; }; }
export function fortuneLevel(id, date) {
  const R = rng(hash(`${id || "me"}|${date}|simi-que`));
  const n = 1 + Math.floor(R() * LEVEL.length);
  return { n, level: LEVEL[n - 1] };
}

export const HONOR_RULES = {
  luck: { "Đại cát": 3, "Thượng cát": 2, "Trung cát": 1 },
  fortunePts: { "Đại cát": 30, "Thượng cát": 20, "Trung cát": 10 },
  prayPts: 5, prayMaxPerDay: 3, prayGapMs: 60_000,
  aiPer: 5, aiMaxPerDay: 20,
};
const KEEP_DAYS = 70;
const TOP = 10;

export const honorConfig = {
  get enabled() { return process.env.LOBBY_HONOR !== "0" && process.env.LOBBY_HONOR !== "false"; },
};

// ---- ngày theo giờ Việt Nam ----
export function localDate(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: config.codexUsageTimezone || "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
const addDays = (date, n) => new Date(Date.parse(`${date}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
const dm = (date) => `${date.slice(8, 10)}/${date.slice(5, 7)}`;

/** khoảng ngày của tuần (Thứ Hai → Chủ nhật) / tháng chứa `today`, lùi `offset` kỳ */
export function periodRange(period, today, offset = 0) {
  if (period === "month") {
    let [y, m] = today.split("-").map(Number);
    m -= offset; while (m < 1) { m += 12; y -= 1; }
    const from = `${y}-${String(m).padStart(2, "0")}-01`;
    const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
    return { period, from, to: addDays(next, -1), label: `Tháng ${m}/${y}` };
  }
  const wd = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7; // Thứ Hai = 0
  const from = addDays(today, -wd - 7 * offset);
  const to = addDays(from, 6);
  return { period: "week", from, to, label: `Tuần ${dm(from)} – ${dm(to)}` };
}

export class LobbyHonor {
  /** nameOf(id) → { name, teamName } | null (người đã từng vào Sảnh) */
  constructor({ nameOf = () => null, now = () => Date.now(), analytics = readUserAnalyticsSnapshot } = {}) {
    this.nameOf = nameOf; this.now = now; this.analytics = analytics;
    this.data = { days: {} };
    this.dir = null; this.saveT = null;
    this.cache = new Map(); // khoá kỳ → { at, value } (đọc thống kê AI tốn kém → giữ 30 giây)
  }

  async init(dir) {
    if (this.dir === dir) return;
    this.dir = dir; await mkdir(dir, { recursive: true });
    try { const d = JSON.parse(await readFile(join(dir, "honor.json"), "utf8")); if (d && d.days && typeof d.days === "object") this.data = d; }
    catch (e) { if (e.code !== "ENOENT") throw e; }
  }
  saveLater() {
    if (!this.dir) return;
    clearTimeout(this.saveT);
    this.saveT = setTimeout(async () => {
      try { const p = join(this.dir, "honor.json"); const tmp = `${p}.${process.pid}.tmp`; await writeFile(tmp, JSON.stringify(this.data)); await rename(tmp, p); } catch { /* lần sau lưu lại */ }
    }, 400);
    this.saveT.unref?.();
  }
  today() { return localDate(new Date(this.now())); }
  day(date) {
    const days = this.data.days;
    if (!days[date]) {
      days[date] = {};
      const cut = addDays(date, -KEEP_DAYS);
      for (const k of Object.keys(days)) if (k < cut) delete days[k];
    }
    return days[date];
  }
  rec(date, ident) {
    const d = this.day(date);
    const r = d[ident.id] || (d[ident.id] = {});
    if (ident.name) r.nm = String(ident.name).slice(0, 60);
    if (ident.teamName) r.tm = String(ident.teamName).slice(0, 60);
    return r;
  }

  /** đã xin quẻ hôm nay → ghi nhận (mỗi ngày 1 lần, mức quẻ do Gateway tự tính) */
  fortune(ident) {
    if (!honorConfig.enabled) throw httpError(404, "Bảng vàng đang tắt", "not_found_error");
    const date = this.today();
    const r = this.rec(date, ident);
    const first = !r.f;
    if (first) { const q = fortuneLevel(ident.id, date); r.f = q.level; r.n = q.n; this.cache.clear(); this.saveLater(); }
    return { date, level: r.f, n: r.n, first, points: HONOR_RULES.fortunePts[r.f] || 0 };
  }

  /** quỳ khấn ở bàn thờ → tối đa 3 lần tính điểm / ngày, cách nhau ít nhất 1 phút */
  pray(ident) {
    if (!honorConfig.enabled) throw httpError(404, "Bảng vàng đang tắt", "not_found_error");
    const R = HONOR_RULES; const date = this.today(); const now = this.now();
    const r = this.rec(date, ident);
    const n = r.p || 0;
    let counted = false;
    if (n < R.prayMaxPerDay && (!r.pt || now - r.pt >= R.prayGapMs)) { r.p = n + 1; r.pt = now; counted = true; this.cache.clear(); this.saveLater(); }
    return { date, counted, gain: counted ? R.prayPts : 0, prays: r.p || 0, max: R.prayMaxPerDay, points: (r.p || 0) * R.prayPts };
  }

  async aiByDay(from, to) {
    const out = new Map(); // id → Map(date → lượt thành công)
    let snap = null;
    try { snap = await this.analytics(); } catch { snap = null; }
    for (const rec of Object.values((snap && snap.dailyUsers) || {})) {
      if (!rec || !rec.userId || !rec.date || rec.date < from || rec.date > to) continue;
      const n = Number(rec.success ?? rec.requests) || 0; if (!n) continue;
      const id = `u:${rec.userId}`;
      const m = out.get(id) || new Map(); m.set(rec.date, (m.get(rec.date) || 0) + n); out.set(id, m);
    }
    return out;
  }

  async boards(range) {
    const key = `${range.from}|${range.to}`;
    const hit = this.cache.get(key);
    if (hit && this.now() - hit.at < 30_000) return hit.value;
    const R = HONOR_RULES;
    const ai = await this.aiByDay(range.from, range.to);
    const people = new Map(); // id → điểm
    const P = (id) => people.get(id) || (people.set(id, { id, ai: 0, luck: 0, dai: 0, draws: 0, prays: 0, tai: 0, taiF: 0, taiP: 0, taiA: 0, nm: null, tm: null }), people.get(id));
    for (let d = range.from; d <= range.to; d = addDays(d, 1)) {
      for (const [id, r] of Object.entries(this.data.days[d] || {})) {
        const p = P(id);
        if (r.nm) p.nm = r.nm; if (r.tm) p.tm = r.tm;
        if (r.f) { p.draws += 1; p.luck += R.luck[r.f] || 0; if (r.f === "Đại cát") p.dai += 1; p.taiF += R.fortunePts[r.f] || 0; }
        if (r.p) { p.prays += r.p; p.taiP += Math.min(r.p, R.prayMaxPerDay) * R.prayPts; }
      }
    }
    for (const [id, days] of ai) {
      const p = P(id);
      for (const n of days.values()) { p.ai += n; p.taiA += Math.min(R.aiMaxPerDay, Math.floor(n / R.aiPer)); }
    }
    let users = null;
    const named = async (p) => {
      const known = this.nameOf(p.id);
      let name = known && known.name || p.nm; let team = known && known.teamName || p.tm;
      if (!name && p.id.startsWith("u:")) {
        users = users || await loadUsers().catch(() => null);
        const u = users && users.byId && users.byId.get(p.id.slice(2));
        if (u) { name = u.displayName; team = team || (u.team && u.team.displayName) || u.teamId; }
      }
      return { id: p.id, name: name || "Đồng nghiệp", team: team || "" };
    };
    const list = [...people.values()];
    for (const p of list) p.tai = p.taiF + p.taiP + p.taiA;
    const rank = async (arr, score, extra) => Promise.all(arr.filter((p) => score(p) > 0).sort((a, b) => score(b) - score(a) || extra.tie(b) - extra.tie(a) || a.id.localeCompare(b.id))
      .slice(0, TOP).map(async (p, i) => ({ rank: i + 1, ...(await named(p)), ...extra.pick(p) })));
    const value = {
      ai: await rank(list, (p) => p.ai, { tie: () => 0, pick: (p) => ({ score: p.ai, requests: p.ai }) }),
      lucky: await rank(list, (p) => p.luck, { tie: (p) => p.dai, pick: (p) => ({ score: p.luck, dai: p.dai, draws: p.draws }) }),
      thantai: await rank(list, (p) => p.tai, { tie: (p) => p.luck, pick: (p) => ({ score: p.tai, parts: { fortune: p.taiF, pray: p.taiP, ai: p.taiA } }) }),
      all: people,
    };
    this.cache.set(key, { at: this.now(), value });
    return value;
  }

  async view(ident, { period = "week", offset = 0 } = {}) {
    if (!honorConfig.enabled) throw httpError(404, "Bảng vàng đang tắt", "not_found_error");
    period = period === "month" ? "month" : "week";
    offset = Math.max(0, Math.min(8, Math.floor(Number(offset) || 0)));
    const today = this.today();
    const range = periodRange(period, today, offset);
    const b = await this.boards(range);
    const prevRange = periodRange(period, today, offset + 1);
    const prev = await this.boards(prevRange);
    const mine = b.all.get(ident.id);
    const pos = (arr) => { const i = arr.findIndex((x) => x.id === ident.id); return i >= 0 ? i + 1 : null; };
    const t = this.data.days[today]?.[ident.id] || {};
    return {
      ...range, today,
      boards: { ai: b.ai, lucky: b.lucky, thantai: b.thantai },
      last: { label: prevRange.label, ai: prev.ai[0] || null, lucky: prev.lucky[0] || null, thantai: prev.thantai[0] || null },
      me: {
        id: ident.id,
        ai: { rank: pos(b.ai), score: mine ? mine.ai : 0 },
        lucky: { rank: pos(b.lucky), score: mine ? mine.luck : 0, dai: mine ? mine.dai : 0, draws: mine ? mine.draws : 0 },
        thantai: { rank: pos(b.thantai), score: mine ? mine.tai : 0, parts: mine ? { fortune: mine.taiF, pray: mine.taiP, ai: mine.taiA } : { fortune: 0, pray: 0, ai: 0 } },
        today: { fortune: t.f || null, prays: t.p || 0 },
      },
      rules: HONOR_RULES,
    };
  }
}
