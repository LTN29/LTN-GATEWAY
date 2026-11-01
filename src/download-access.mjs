// Ai được vào trang tải Văn Phòng AI (/install/vanphong): danh sách email do admin bật / tắt trong tab Quản trị của app.
// Đăng nhập bằng email → Gateway kiểm tra danh sách → đặt cookie ký HMAC (HttpOnly). Mỗi lần mở trang / bấm tải đều kiểm
// tra lại danh sách, nên tắt email là người đó bị chặn ngay. latest.json và file cài vẫn công khai cho app tự cập nhật.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const COOKIE = "vpdl";
const MAX_PEOPLE = 5000;
const EMAIL = /^[^\s@<>"'`]{1,96}@[A-Za-z0-9.-]{1,120}\.[A-Za-z]{2,24}$/;

export const normEmail = (v) => String(v || "").trim().toLowerCase();
export const isEmail = (v) => EMAIL.test(v);
export const gateEnabled = () => !/^(0|off|false|no)$/i.test(String(process.env.VANPHONG_DOWNLOAD_GATE || "on").trim());
const cookieDays = () => Math.max(1, Math.min(365, Number(process.env.VANPHONG_DOWNLOAD_COOKIE_DAYS) || 30));
const dataDir = () => resolve(process.env.LOBBY_DATA_DIR || "./data/lobby");

class DownloadAccess {
  constructor() { this.dir = null; this.people = []; this.secret = null; this.tries = new Map(); this.loading = null; }

  async init() {
    const dir = dataDir();
    if (this.dir === dir) return;
    if (this.loading) return this.loading;
    this.loading = (async () => {
      await mkdir(dir, { recursive: true });
      try {
        const j = JSON.parse(await readFile(join(dir, "download-access.json"), "utf8"));
        this.people = Array.isArray(j.people) ? j.people.filter((p) => p && isEmail(normEmail(p.email))).map((p) => ({ email: normEmail(p.email), on: p.on === true, at: Number(p.at) || 0, by: String(p.by || "") })) : [];
      } catch (e) { if (e.code !== "ENOENT") throw e; this.people = []; }
      // khoá ký cookie: lấy từ .env nếu có, không thì tự tạo một lần và giữ trong thư mục dữ liệu (không đưa lên git)
      const fromEnv = String(process.env.VANPHONG_DOWNLOAD_SECRET || "").trim();
      if (fromEnv.length >= 16) this.secret = fromEnv;
      else {
        const p = join(dir, "download-secret");
        try { this.secret = (await readFile(p, "utf8")).trim(); } catch (e) { if (e.code !== "ENOENT") throw e; }
        if (!this.secret || this.secret.length < 32) { this.secret = randomBytes(32).toString("hex"); await writeFile(p, this.secret, { mode: 0o600 }); }
      }
      this.dir = dir;
    })();
    try { await this.loading; } finally { this.loading = null; }
  }

  async save() {
    const p = join(this.dir, "download-access.json"); const tmp = `${p}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmp, JSON.stringify({ version: 1, people: this.people }, null, 1)); await rename(tmp, p);
  }

  allowed(email) { const e = normEmail(email); return this.people.some((p) => p.email === e && p.on); }
  list() { return [...this.people].sort((a, b) => a.email.localeCompare(b.email)); }
  summary() { const on = this.people.filter((p) => p.on).length; return { gate: gateEnabled(), total: this.people.length, on, people: this.list() }; }

  // thêm nhiều email một lần (dán cả danh sách): email đã có mà đang tắt thì bật lại
  async add(input, by) {
    const items = [...new Set((Array.isArray(input) ? input : String(input || "").split(/[\s,;]+/)).map(normEmail).filter(Boolean))].slice(0, MAX_PEOPLE);
    const bad = items.filter((e) => !isEmail(e));
    let added = 0, again = 0;
    for (const email of items.filter(isEmail)) {
      const p = this.people.find((x) => x.email === email);
      if (!p) { if (this.people.length >= MAX_PEOPLE) break; this.people.push({ email, on: true, at: Date.now(), by }); added++; }
      else if (!p.on) { p.on = true; p.at = Date.now(); p.by = by; again++; }
    }
    if (added || again) await this.save();
    return { added, again, bad: bad.slice(0, 20), badCount: bad.length };
  }

  async set(email, on, by) {
    const p = this.people.find((x) => x.email === normEmail(email));
    if (!p) throw Object.assign(new Error("Email này chưa có trong danh sách"), { statusCode: 404, type: "not_found_error" });
    p.on = !!on; p.at = Date.now(); p.by = by; await this.save();
    return { email: p.email, on: p.on };
  }

  async remove(email) {
    const e = normEmail(email); const n = this.people.length;
    this.people = this.people.filter((x) => x.email !== e);
    if (this.people.length === n) throw Object.assign(new Error("Email này chưa có trong danh sách"), { statusCode: 404, type: "not_found_error" });
    await this.save();
    return { email: e };
  }

  // ---------- cookie ----------
  sign(email) {
    const exp = Date.now() + cookieDays() * 86400_000;
    const body = `${Buffer.from(normEmail(email)).toString("base64url")}.${exp}`;
    return `${body}.${createHmac("sha256", this.secret).update(body).digest("base64url")}`;
  }

  // email của cookie nếu chữ ký đúng, còn hạn và email vẫn đang bật; ngược lại null
  who(req) {
    if (!this.secret) return null;
    const m = new RegExp(`(?:^|;\\s*)${COOKIE}=([A-Za-z0-9_.-]{10,600})`).exec(String(req.headers.cookie || ""));
    if (!m) return null;
    const [b64, exp, sig] = m[1].split(".");
    if (!b64 || !exp || !sig) return null;
    const want = createHmac("sha256", this.secret).update(`${b64}.${exp}`).digest();
    let got; try { got = Buffer.from(sig, "base64url"); } catch { return null; }
    if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
    if (!(Number(exp) > Date.now())) return null;
    const email = Buffer.from(b64, "base64url").toString("utf8");
    return this.allowed(email) ? email : null;
  }

  cookie(req, value, maxAgeSec) {
    const https = String(req.headers["x-forwarded-proto"] || "").includes("https") || !!req.headers["cf-visitor"] || !!req.socket?.encrypted;
    return `${COOKIE}=${value}; Path=/install/vanphong; Max-Age=${maxAgeSec}; HttpOnly; SameSite=Lax${https ? "; Secure" : ""}`;
  }

  // chống dò email: mỗi IP tối đa 12 lần thử sai trong 10 phút
  limited(ip) {
    const now = Date.now(); const t = this.tries.get(ip);
    if (!t || t.reset < now) return false;
    return t.n >= 12;
  }

  fail(ip) {
    const now = Date.now(); const t = this.tries.get(ip);
    if (!t || t.reset < now) this.tries.set(ip, { n: 1, reset: now + 10 * 60_000 }); else t.n++;
    if (this.tries.size > 5000) for (const [k, v] of this.tries) if (v.reset < now) this.tries.delete(k);
  }
}

export const downloadAccess = new DownloadAccess();
export const DOWNLOAD_COOKIE = COOKIE;
