// NPC "Trợ lý SIMI" trong Sảnh: hướng dẫn dùng app từng bước (app có sẵn, admin sửa thêm được) + hỏi tự do bằng AI.
// Hỏi tự do chạy bằng tài khoản admin chọn trong tab Quản trị (thường là tài khoản chatbot, memoryMode none) → tính vào
// hạn mức của chính tài khoản đó, đi qua đúng đường /v1/responses của Gateway (định tuyến Combo, giới hạn, log như mọi người).
// Gateway chỉ lưu mã băm của API key, nên key của tài khoản NPC phải nằm trong .env: LOBBY_NPC_KEYS=<key>[,<key 2>]
// (Gateway tự đối chiếu key nào thuộc tài khoản nào – dán nhầm key của người khác thì không dùng được cho NPC).
import { createHash } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadUsers } from "./config.mjs";
import { jsonLog } from "./utils.mjs";

const sha = (s) => createHash("sha256").update(s).digest("hex");
const httpError = (status, message, type = "invalid_request_error") => Object.assign(new Error(message), { statusCode: status, type });

export const npcConfig = {
  get perHour() { return Math.max(1, Number(process.env.LOBBY_NPC_PER_HOUR || 30)); },
  get model() { return process.env.LOBBY_NPC_MODEL || "auto"; },
  get timeoutMs() { return Math.max(5000, Number(process.env.LOBBY_NPC_TIMEOUT_MS || 80_000)); } // dưới 100 giây của Cloudflare
};

// keyHash → key thật (chỉ trong bộ nhớ, không ghi ra đĩa / log)
function npcKeys() {
  const out = new Map();
  for (const k of String(process.env.LOBBY_NPC_KEYS || process.env.LOBBY_NPC_KEY || "").split(/[\s,;]+/).filter(Boolean)) out.set(sha(k), k);
  return out;
}

// tài khoản chọn được làm NPC: mọi tài khoản trong users.json; "ready" = .env có key khớp
export async function npcCandidates() {
  const users = await loadUsers();
  const keys = npcKeys();
  return [...users.byId.values()].filter((u) => u.enabled !== false).map((u) => ({
    id: `u:${u.userId}`, name: u.displayName || u.userId, teamId: u.teamId, role: u.role || "",
    chatbot: u.role === "PUBLIC_CHATBOT_SERVICE" || u.memoryMode === "none", ready: keys.has(u.keyHash)
  })).sort((a, b) => Number(b.chatbot) - Number(a.chatbot) || a.name.localeCompare(b.name, "vi"));
}

async function npcKey(npcId) {
  const userId = String(npcId || "").replace(/^u:/, "");
  const users = await loadUsers();
  const u = users.byId.get(userId);
  if (!u || u.enabled === false) throw httpError(503, "Tài khoản NPC không còn – admin chọn lại trong tab Quản trị", "service_unavailable");
  const key = npcKeys().get(u.keyHash);
  if (!key) throw httpError(503, "Admin chưa thêm key của tài khoản NPC vào Gateway (LOBBY_NPC_KEYS) – tạm thời chỉ xem được hướng dẫn", "service_unavailable");
  return { key, user: u };
}

// nội dung hướng dẫn admin sửa thêm (null = dùng bản có sẵn trong app)
export class NpcStore {
  constructor() { this.dir = null; this.data = { guides: null, notes: "", updatedAt: 0 }; }
  async init(dir) {
    if (this.dir === dir) return;
    this.dir = dir;
    try { this.data = { guides: null, notes: "", updatedAt: 0, ...JSON.parse(await readFile(join(dir, "npc.json"), "utf8")) }; } catch (e) { if (e.code !== "ENOENT") throw e; }
  }
  async save(patch) {
    this.data = { ...this.data, ...patch, updatedAt: Date.now() };
    const p = join(this.dir, "npc.json"); const tmp = `${p}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(this.data, null, 1)); await rename(tmp, p);
  }
}

// nhật ký hỏi Trợ lý (60 câu gần nhất): admin xem câu nào trả lời được / lỗi / bị chấm 👎 để bổ sung ghi chú, hướng dẫn.
// Chỉ lưu câu hỏi + 300 chữ đầu câu trả lời; không lưu key, không lưu lịch sử hội thoại.
export class NpcLog {
  constructor() { this.dir = null; this.items = []; this.timer = null; }
  async init(dir) {
    if (this.dir === dir) return;
    this.dir = dir;
    try { const d = JSON.parse(await readFile(join(dir, "npc-log.json"), "utf8")); this.items = Array.isArray(d.items) ? d.items.slice(-60) : []; } catch (e) { if (e.code !== "ENOENT") throw e; }
  }
  add(entry) {
    const it = { id: createHash("sha1").update(`${Date.now()}:${Math.random()}`).digest("hex").slice(0, 16), ts: Date.now(), ...entry };
    this.items.push(it); if (this.items.length > 60) this.items.splice(0, this.items.length - 60);
    this.later();
    return it;
  }
  rate(id, byId, good) {
    const it = this.items.find((x) => x.id === id && x.byId === byId);
    if (!it) return false;
    it.fb = good ? 1 : -1; this.later();
    return true;
  }
  later() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush().catch(() => {}), 1500); this.timer.unref?.();
  }
  async flush() {
    if (!this.dir) return;
    const p = join(this.dir, "npc-log.json"); const tmp = `${p}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify({ items: this.items })); await rename(tmp, p);
  }
  recent(n = 40) { return this.items.slice(-n).reverse(); }
}

// kiểm tra nội dung hướng dẫn admin gửi lên: [{ id, icon, title, steps: [{ text, target?, view? }] }]
export function cleanGuides(list) {
  if (list === null) return null;
  if (!Array.isArray(list) || list.length > 40) throw httpError(400, "Danh sách hướng dẫn không hợp lệ");
  const t = (s, n) => String(s ?? "").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, n);
  return list.map((g, i) => {
    const steps = (Array.isArray(g.steps) ? g.steps : []).slice(0, 30).map((s) => ({
      text: t(typeof s === "string" ? s : s.text, 600),
      ...(s && s.target && /^[#.\w\-\[\]="' :>()]{1,120}$/.test(String(s.target)) ? { target: String(s.target) } : {}),
      ...(s && ["office", "chat", "lobby", "admin"].includes(s.view) ? { view: s.view } : {}),
      ...(s && ["npc", "bar", "dance", "cinema", "game", "garden"].includes(s.place) ? { place: s.place } : {})
    })).filter((s) => s.text);
    if (!t(g.title, 80) || !steps.length) throw httpError(400, `Hướng dẫn số ${i + 1} cần tiêu đề và ít nhất 1 bước`);
    return { id: t(g.id, 40).replace(/[^\w-]/g, "") || `g${i + 1}`, icon: t(g.icon, 4) || "📘", title: t(g.title, 80), steps };
  });
}

// LOBBY_NPC_MODEL=auto: hỏi Gateway tài khoản NPC được dùng model nào (/v1/models – chế độ "combo_members" chỉ nhận
// đúng model trong Combo, gửi "auto" sẽ bị từ chối) rồi chọn model nhanh / rẻ trước. Nhớ 10 phút.
const modelCache = new Map(); // key → { list: [model ưu tiên trước], at }
async function modelList(selfUrl, key, clientId, fresh) {
  if (npcConfig.model !== "auto") return [npcConfig.model];
  const c = modelCache.get(key);
  if (c && !fresh && Date.now() - c.at < 600_000) return c.list;
  let ids = [];
  try {
    const r = await fetch(`${selfUrl}/v1/models`, { headers: { authorization: `Bearer ${key}`, "x-ltn-client-id": clientId }, signal: AbortSignal.timeout(15_000) });
    ids = r.ok ? ((await r.json()).data || []).map((m) => m && m.id).filter((x) => typeof x === "string") : [];
  } catch { /* để "auto": Gateway tự chọn Combo nếu không bật chọn model */ }
  const fast = (id) => (/mini|flash|haiku|nano|lite|fast/i.test(id) ? 0 : 1);
  const list = ids.length ? ids.map((id, i) => [id, i]).sort((a, b) => fast(a[0]) - fast(b[0]) || a[1] - b[1]).map((x) => x[0]) : ["auto"];
  modelCache.set(key, { list, at: Date.now() });
  return list;
}
// model vừa trả lời được thì lần sau thử trước
function rememberModel(key, model) { const c = modelCache.get(key); if (c && c.list[0] !== model) c.list = [model, ...c.list.filter((m) => m !== model)]; }

// tình trạng từng model (bộ nhớ): lỗi thì tạm nghỉ (theo "reset after 2m" của máy chủ AI, mặc định 2 phút) → câu sau thử model khác ngay
const health = new Map(); // model → { ok, err, at, until }
function coolDown(model, err) {
  const m = /reset (?:after|in)\s*(\d+)\s*(s|m|h)/i.exec(String(err));
  const ms = m ? Number(m[1]) * { s: 1000, m: 60_000, h: 3600_000 }[m[2].toLowerCase()] : 120_000;
  health.set(model, { ok: false, err: String(err).slice(0, 200), at: Date.now(), until: Date.now() + Math.min(Math.max(ms, 15_000), 3600_000) });
}
export function npcModelHealth() {
  const now = Date.now();
  return Object.fromEntries([...health].map(([m, h]) => [m, { ok: h.ok, err: h.err || "", at: h.at, cooling: h.until > now ? h.until : 0 }]));
}

// model tài khoản NPC được dùng (cho admin chọn) – đọc mới từ Gateway.
// mode "combo_members": Gateway gửi đúng model được chọn → chọn model + tự chuyển model khác khi lỗi có tác dụng.
// mode "combo": Gateway tự định tuyến theo Combo của tài khoản (bỏ qua tên model) → chọn model không đổi được gì.
export async function npcModelsFor({ npcId, selfUrl }) {
  const { key } = await npcKey(npcId);
  const cid = sha(`npc:${npcId}`);
  const clientId = `${cid.slice(0, 8)}-${cid.slice(8, 12)}-4${cid.slice(13, 16)}-8${cid.slice(17, 20)}-${cid.slice(20, 32)}`;
  let mode = "combo_members"; let combos = null;
  try {
    const r = await fetch(`${selfUrl}/v1/codex/installer-config`, { headers: { authorization: `Bearer ${key}`, "x-ltn-client-id": clientId }, signal: AbortSignal.timeout(15_000) });
    if (r.ok) {
      const lines = (await r.text()).split(/\r?\n/);
      if (lines[1] && lines[1] !== "combo_members") { mode = "combo"; combos = { routing: lines[1], list: lines.slice(2, 5).filter(Boolean) }; }
    }
  } catch { /* không đọc được: coi như chọn model được */ }
  const list = npcConfig.model === "auto" ? await modelList(selfUrl, key, clientId, true) : [npcConfig.model];
  return { mode, combos, models: list.filter((m) => m !== "auto") };
}

const MAX_TRIES = 5;

// hỏi AI: đi vòng qua chính Gateway (/v1/responses) bằng key của tài khoản NPC.
// models: danh sách admin chọn (ưu tiên theo thứ tự) – lỗi thì tự chuyển model kế tiếp, hết thì thử model tự động còn lại.
export async function askNpc({ npcId, question, history, guideText, notes, askerName, selfUrl, models }) {
  const { key, user } = await npcKey(npcId);
  const instructions = [
    `Bạn là "${user.displayName || "Trợ lý SIMI"}", NPC hướng dẫn trong app Văn Phòng AI của công ty.`,
    "Nhiệm vụ: chỉ cách dùng app Văn Phòng AI (tab Văn phòng, Chat, Sảnh, Quản trị…) và cách dùng AI hiệu quả trong công việc.",
    "Trả lời bằng tiếng Việt, ngắn gọn, thân thiện. Khi chỉ thao tác thì đánh số từng bước, gọi đúng tên nút như trong app.",
    "Không bịa tính năng không có trong hướng dẫn; không chắc thì nói rõ và gợi ý hỏi admin. Không hỏi / không ghi nhớ thông tin cá nhân, mật khẩu, API key.",
    askerName ? `Người đang hỏi: ${askerName}.` : "",
    "",
    "=== HƯỚNG DẪN APP (nguồn chính xác) ===",
    String(guideText || "").slice(0, 24_000),
    notes ? `\n=== GHI CHÚ THÊM CỦA ADMIN ===\n${String(notes).slice(0, 4000)}` : ""
  ].filter((x) => x !== "").join("\n");
  const input = [];
  for (const h of (Array.isArray(history) ? history : []).slice(-6)) {
    const role = h && h.role === "assistant" ? "assistant" : "user";
    const text = String(h && h.text || "").slice(0, 2000);
    if (text) input.push({ role, content: [{ type: role === "assistant" ? "output_text" : "input_text", text }] });
  }
  input.push({ role: "user", content: [{ type: "input_text", text: question }] });
  const cid = sha(`npc:${npcId}`); // mã máy cố định cho NPC (định tuyến / hạn mức theo máy)
  const clientId = `${cid.slice(0, 8)}-${cid.slice(8, 12)}-4${cid.slice(13, 16)}-8${cid.slice(17, 20)}-${cid.slice(20, 32)}`;
  // Gọi dạng stream (giống tab Chat của app): các combo Codex phía sau chỉ nhận stream = true.
  // Lỗi trả về mã 503 (không dùng 502/504: Cloudflare thay trang lỗi đó bằng trang HTML của nó, app mất thông báo thật).
  const ac = new AbortController(); const timer = setTimeout(() => ac.abort(), npcConfig.timeoutMs);
  const call = async (model) => {
    const res = await fetch(`${selfUrl}/v1/responses`, {
      method: "POST", signal: ac.signal,
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json", accept: "text/event-stream", "x-ltn-client-id": clientId },
      body: JSON.stringify({ model, instructions, input, stream: true, store: false })
    });
    return { status: res.status, ok: res.ok, raw: await res.text() };
  };
  const errors = [];
  try {
    const chosen = (Array.isArray(models) ? models : []).filter((m) => typeof m === "string" && m);
    const auto = await modelList(selfUrl, key, clientId);
    const all = [...new Set([...chosen, ...auto])];
    // model đang tạm nghỉ vì lỗi xếp xuống cuối (vẫn thử nếu không còn model nào khác)
    const now = Date.now();
    const order = [...all.filter((m) => !(health.get(m)?.until > now)), ...all.filter((m) => health.get(m)?.until > now)];
    for (const model of order.slice(0, MAX_TRIES)) {
      const r = await call(model);
      const { text, error } = parseResponsesBody(r.raw);
      if (r.ok && !error && text.trim()) {
        health.set(model, { ok: true, at: Date.now(), until: 0 });
        rememberModel(key, model);
        return { text: text.trim().slice(0, 8000), model };
      }
      const detail = error || (r.ok ? "câu trả lời trống" : `mã ${r.status}`);
      errors.push({ model, status: r.status, detail: String(detail).slice(0, 240) });
      jsonLog("lobby_npc_error", { npc: npcId, stage: "upstream", model, status: r.status, error: String(detail).slice(0, 300) });
      if (r.status === 401) break; // key NPC sai: model khác cũng vậy
      if (model !== "auto") coolDown(model, detail);
    }
  } catch (e) {
    jsonLog("lobby_npc_error", { npc: npcId, stage: "fetch", error: e.name === "AbortError" ? "timeout" : String(e.message || e).slice(0, 200) });
    throw httpError(503, e.name === "AbortError" ? "Trợ lý suy nghĩ lâu quá – hỏi lại ngắn hơn nhé" : "Không gọi được AI cho Trợ lý – báo admin kiểm tra Gateway", "server_error");
  } finally { clearTimeout(timer); }
  const last = errors.at(-1) || { detail: "không có model nào", status: 503 };
  const tried = errors.length > 1 ? ` (đã thử ${errors.length} model: ${errors.map((x) => x.model).join(", ")})` : "";
  throw Object.assign(httpError(errors.length && errors.every((x) => x.status === 429) ? 429 : 503,
    `Trợ lý chưa trả lời được: ${last.detail}${tried}`, errors.every((x) => x.status === 429) ? "rate_limit_error" : "server_error"), { tried: errors });
}

// đọc câu trả lời /v1/responses: SSE (response.output_text.delta / response.completed / error) hoặc JSON thường
export function parseResponsesBody(raw) {
  const body = String(raw || "");
  const fromJson = (d) => {
    if (!d || typeof d !== "object") return { text: "", error: null };
    if (d.error) return { text: "", error: d.error.message || (typeof d.error === "string" ? d.error : JSON.stringify(d.error)) };
    const r = d.response || d;
    const text = r.output_text || (Array.isArray(r.output) ? r.output.flatMap((o) => (o.type === "message" ? o.content || [] : [])).filter((c) => c.type === "output_text").map((c) => c.text).join("\n") : "");
    return { text: text || "", error: null };
  };
  const t = body.trimStart();
  if (t.startsWith("{")) { try { return fromJson(JSON.parse(t)); } catch { /* không phải JSON */ } }
  if (/^\s*</.test(t)) return { text: "", error: "máy chủ AI trả về trang HTML thay vì câu trả lời" };
  let deltas = "", done = "", error = null;
  for (const block of body.split(/\r?\n\r?\n/)) {
    const data = block.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("\n");
    if (!data || data === "[DONE]") continue;
    let ev; try { ev = JSON.parse(data); } catch { continue; }
    if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") deltas += ev.delta;
    else if (ev.type === "response.output_text.done" && typeof ev.text === "string") done += (done ? "\n" : "") + ev.text;
    else if (ev.type === "response.completed") { const r = fromJson(ev); if (r.text) done = r.text; }
    else if (ev.type === "response.failed" || ev.type === "error") error = (ev.response && ev.response.error && ev.response.error.message) || (ev.error && ev.error.message) || ev.message || "AI báo lỗi";
  }
  return { text: done || deltas, error: done || deltas ? null : error };
}
