// NPC "Trợ lý SIMI" trong Sảnh: hướng dẫn dùng app từng bước (app có sẵn, admin sửa thêm được) + hỏi tự do bằng AI.
// Hỏi tự do chạy bằng tài khoản admin chọn trong tab Quản trị (thường là tài khoản chatbot, memoryMode none) → tính vào
// hạn mức của chính tài khoản đó, đi qua đúng đường /v1/responses của Gateway (định tuyến Combo, giới hạn, log như mọi người).
// Gateway chỉ lưu mã băm của API key, nên key của tài khoản NPC phải nằm trong .env: LOBBY_NPC_KEYS=<key>[,<key 2>]
// (Gateway tự đối chiếu key nào thuộc tài khoản nào – dán nhầm key của người khác thì không dùng được cho NPC).
import { createHash } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadUsers } from "./config.mjs";

const sha = (s) => createHash("sha256").update(s).digest("hex");
const httpError = (status, message, type = "invalid_request_error") => Object.assign(new Error(message), { statusCode: status, type });

export const npcConfig = {
  get perHour() { return Math.max(1, Number(process.env.LOBBY_NPC_PER_HOUR || 30)); },
  get model() { return process.env.LOBBY_NPC_MODEL || "auto"; },
  get timeoutMs() { return Math.max(5000, Number(process.env.LOBBY_NPC_TIMEOUT_MS || 90_000)); }
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

// kiểm tra nội dung hướng dẫn admin gửi lên: [{ id, icon, title, steps: [{ text, target?, view? }] }]
export function cleanGuides(list) {
  if (list === null) return null;
  if (!Array.isArray(list) || list.length > 40) throw httpError(400, "Danh sách hướng dẫn không hợp lệ");
  const t = (s, n) => String(s ?? "").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, n);
  return list.map((g, i) => {
    const steps = (Array.isArray(g.steps) ? g.steps : []).slice(0, 30).map((s) => ({
      text: t(typeof s === "string" ? s : s.text, 600),
      ...(s && s.target && /^[#.\w\-\[\]="' :>()]{1,120}$/.test(String(s.target)) ? { target: String(s.target) } : {}),
      ...(s && ["office", "chat", "lobby", "admin"].includes(s.view) ? { view: s.view } : {})
    })).filter((s) => s.text);
    if (!t(g.title, 80) || !steps.length) throw httpError(400, `Hướng dẫn số ${i + 1} cần tiêu đề và ít nhất 1 bước`);
    return { id: t(g.id, 40).replace(/[^\w-]/g, "") || `g${i + 1}`, icon: t(g.icon, 4) || "📘", title: t(g.title, 80), steps };
  });
}

// hỏi AI: đi vòng qua chính Gateway (/v1/responses) bằng key của tài khoản NPC
export async function askNpc({ npcId, question, history, guideText, notes, askerName, selfUrl }) {
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
  const ac = new AbortController(); const timer = setTimeout(() => ac.abort(), npcConfig.timeoutMs);
  let res;
  try {
    res = await fetch(`${selfUrl}/v1/responses`, {
      method: "POST", signal: ac.signal,
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json", "x-ltn-client-id": clientId },
      body: JSON.stringify({ model: npcConfig.model, instructions, input, stream: false, store: false })
    });
  } catch (e) {
    throw httpError(504, e.name === "AbortError" ? "Trợ lý suy nghĩ lâu quá – hỏi lại ngắn hơn nhé" : "Không gọi được AI cho Trợ lý", "server_error");
  } finally { clearTimeout(timer); }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw httpError(res.status === 429 ? 429 : 502, `Trợ lý chưa trả lời được: ${(data && data.error && data.error.message) || res.status}`, res.status === 429 ? "rate_limit_error" : "server_error");
  const text = (data && data.output_text) || (data && Array.isArray(data.output) ? data.output.flatMap((o) => (o.type === "message" ? o.content || [] : [])).filter((c) => c.type === "output_text").map((c) => c.text).join("\n") : "");
  if (!text.trim()) throw httpError(502, "Trợ lý chưa trả lời được – thử lại nhé", "server_error");
  return text.trim().slice(0, 8000);
}
