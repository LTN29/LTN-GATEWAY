// 📮 Hòm thư góp ý SIMI trong Sảnh: mọi người gửi ý tưởng / cải thiện / báo lỗi cho các sản phẩm SIMI,
// IT xem – duyệt – trả lời – đổi trạng thái; ai cũng thấy tiến độ và bấm "Tôi cũng cần" để IT biết việc nào nhiều người cần.
import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const httpError = (status, message, type = "invalid_request_error") => Object.assign(new Error(message), { statusCode: status, type });
const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max);

export const IDEA_PRODUCTS = {
  mobile: { icon: "📱", name: "App mobile" },
  zalo: { icon: "💬", name: "Mini app Zalo" },
  web: { icon: "🌐", name: "Website" },
  other: { icon: "✨", name: "Khác" },
};
export const IDEA_KINDS = { idea: "💡 Ý tưởng mới", improve: "🛠️ Cải thiện", bug: "🐞 Báo lỗi" };
export const IDEA_STATUS = {
  new: "📥 Mới gửi", reviewing: "🔍 IT đang xem", planned: "🗓️ Đã lên kế hoạch",
  doing: "🛠️ Đang làm", done: "✅ Đã cập nhật", declined: "🙅 Chưa phù hợp",
};
export const IDEA_SITES = ["simi.vn", "inventory.simi.vn", "baohanh.simi.vn", "prosper-supply.simi.vn"];
const OPEN = new Set(["new", "reviewing", "planned", "doing"]);
const MAX_IDEAS = 3000;
const PER_DAY = 15;

// ai được duyệt: admin Sảnh + thành viên các team trong LOBBY_IDEA_REVIEW_TEAMS (mặc định IT)
export const reviewTeams = () => new Set(String(process.env.LOBBY_IDEA_REVIEW_TEAMS ?? "IT").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean));

export class LobbyIdeas {
  constructor({ broadcast = () => {}, isAdmin = () => false, now = () => Date.now() } = {}) {
    this.broadcast = broadcast; this.isAdmin = isAdmin; this.now = now;
    this.data = { ideas: [] }; this.dir = null; this.saveT = null;
  }

  async init(dir) {
    if (this.dir === dir) return;
    this.dir = dir; await mkdir(dir, { recursive: true });
    try { const d = JSON.parse(await readFile(join(dir, "ideas.json"), "utf8")); if (d && Array.isArray(d.ideas)) this.data = d; }
    catch (e) { if (e.code !== "ENOENT") throw e; }
  }
  saveLater() {
    if (!this.dir) return;
    clearTimeout(this.saveT);
    this.saveT = setTimeout(() => this.flush().catch(() => {}), 300);
    this.saveT.unref?.();
  }
  async flush() {
    clearTimeout(this.saveT);
    if (!this.dir) return;
    const p = join(this.dir, "ideas.json"); const tmp = `${p}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(this.data)); await rename(tmp, p);
  }

  canReview(ident) { return !!ident && !ident.shared && (this.isAdmin(ident) || reviewTeams().has(String(ident.teamId || "").toUpperCase())); }
  find(id) { const x = this.data.ideas.find((i) => i.id === String(id || "")); if (!x) throw httpError(404, "Góp ý không còn", "not_found_error"); return x; }

  // ẩn tên người gửi ẩn danh với mọi người trừ IT (IT cần hỏi thêm thông tin)
  view(x, ident) {
    const reviewer = this.canReview(ident);
    const mine = x.by === ident.id;
    const out = { ...x, votes: x.votes.length, voted: x.votes.includes(ident.id), mine, canEdit: mine && x.status === "new" };
    if (x.anon && !reviewer && !mine) { out.by = null; out.name = "Ẩn danh"; out.team = ""; }
    return out;
  }

  summary() {
    const s = Object.fromEntries(Object.keys(IDEA_PRODUCTS).map((k) => [k, { total: 0, open: 0, done: 0, fresh: 0 }]));
    for (const x of this.data.ideas) {
      const b = s[x.product] || s.other; b.total++;
      if (OPEN.has(x.status)) b.open++; if (x.status === "done") b.done++; if (x.status === "new") b.fresh++;
    }
    return s;
  }

  list(ident) {
    const ideas = this.data.ideas.slice().sort((a, b) => b.ts - a.ts).slice(0, 500).map((x) => this.view(x, ident));
    return { ideas, summary: this.summary(), canReview: this.canReview(ident), products: IDEA_PRODUCTS, kinds: IDEA_KINDS, statuses: IDEA_STATUS, sites: IDEA_SITES };
  }

  notify(action, x) {
    // mỗi người nhận bản đã ẩn tên theo quyền của họ → gửi bản tối thiểu, app tải lại danh sách khi cần
    this.broadcast("idea", { action, id: x.id, product: x.product, title: x.title, status: x.status, by: x.anon ? null : x.by, owner: x.by, summary: this.summary() });
  }

  create(ident, profile, body, images = [], id = randomUUID()) {
    if (ident.shared) throw httpError(403, "Key dùng chung của team không gửi góp ý được – đăng nhập tài khoản cá nhân nhé", "permission_error");
    const product = String(body.product || "");
    if (!IDEA_PRODUCTS[product]) throw httpError(400, "Chọn sản phẩm: App mobile, Mini app Zalo, Website hoặc Khác");
    const kind = IDEA_KINDS[body.kind] ? body.kind : "idea";
    const title = clean(body.title, 140);
    const detail = clean(body.detail, 3000);
    if (title.length < 4) throw httpError(400, "Viết tiêu đề góp ý rõ hơn chút nhé (ít nhất 4 ký tự)");
    let site = "";
    if (product === "web") {
      site = clean(body.site, 80).toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      if (!site) throw httpError(400, "Chọn website cần góp ý (vd. baohanh.simi.vn)");
      if (!/^[a-z0-9.-]+$/.test(site)) throw httpError(400, "Tên website không hợp lệ");
    }
    const day = this.now() - 86_400_000;
    if (this.data.ideas.filter((x) => x.by === ident.id && x.ts > day).length >= PER_DAY) throw httpError(429, `Mỗi ngày gửi tối đa ${PER_DAY} góp ý – cảm ơn bạn rất nhiều 🙏`, "rate_limit_error");
    const x = {
      id, product, site, kind, title, detail, images,
      by: ident.id, name: profile.name, team: ident.teamName || ident.teamId || "", anon: !!body.anon,
      ts: this.now(), status: "new", votes: [], reply: "", replyBy: "", updatedAt: this.now(),
    };
    this.data.ideas.push(x);
    if (this.data.ideas.length > MAX_IDEAS) this.data.ideas.splice(0, this.data.ideas.length - MAX_IDEAS);
    this.saveLater(); this.notify("new", x);
    return { idea: this.view(x, ident) };
  }

  vote(ident, body) {
    if (ident.shared) throw httpError(403, "Đăng nhập tài khoản cá nhân để bình chọn", "permission_error");
    const x = this.find(body.id);
    const i = x.votes.indexOf(ident.id);
    if (i >= 0) x.votes.splice(i, 1); else x.votes.push(ident.id);
    this.saveLater(); this.notify("update", x);
    return { idea: this.view(x, ident) };
  }

  review(ident, profile, body) {
    if (!this.canReview(ident)) throw httpError(403, "Chỉ IT / admin mới duyệt góp ý", "permission_error");
    const x = this.find(body.id);
    if (body.status !== undefined) { if (!IDEA_STATUS[body.status]) throw httpError(400, "Trạng thái không hợp lệ"); x.status = body.status; }
    if (body.reply !== undefined) { x.reply = clean(body.reply, 2000); x.replyBy = x.reply ? profile.name : ""; }
    x.updatedAt = this.now(); x.reviewedAt = this.now();
    this.saveLater(); this.notify("update", x);
    return { idea: this.view(x, ident) };
  }

  // người gửi rút lại khi IT chưa xem; IT xoá được mọi góp ý (spam / trùng)
  remove(ident, body) {
    const x = this.find(body.id);
    const own = x.by === ident.id && x.status === "new";
    if (!own && !this.canReview(ident)) throw httpError(403, "Chỉ rút lại được góp ý của mình khi IT chưa xem", "permission_error");
    this.data.ideas = this.data.ideas.filter((i) => i !== x);
    this.saveLater(); this.broadcast("idea", { action: "delete", id: x.id, owner: x.by, summary: this.summary() });
    return { ok: true, images: x.images || [] };
  }
}
