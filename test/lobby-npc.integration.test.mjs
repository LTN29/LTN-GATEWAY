import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, writeFile, readFile, readdir } from "node:fs/promises";
import http from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";

const hash = (k) => createHash("sha256").update(k).digest("hex");
const listen = (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));

// đọc sự kiện SSE từ fetch stream
function sse(url, headers) {
  const ctrl = new AbortController();
  const events = [];
  const waiters = [];
  const ready = fetch(url, { headers, signal: ctrl.signal }).then(async (res) => {
    if (res.status !== 200) { events.push({ event: "http", data: { status: res.status, body: await res.text() } }); flush(); return res; }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    (async () => {
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i;
          while ((i = buf.indexOf("\n\n")) >= 0) {
            const block = buf.slice(0, i); buf = buf.slice(i + 2);
            const ev = /^event: (.+)$/m.exec(block); const data = /^data: (.+)$/m.exec(block);
            if (ev && data) { events.push({ event: ev[1], data: JSON.parse(data[1]) }); flush(); }
          }
        }
      } catch { /* đóng */ }
    })();
    return res;
  });
  function flush() {
    for (const w of [...waiters]) {
      const hit = events.find((e) => e.event === w.event && w.pred(e.data) && !w.seen.has(e));
      if (hit) { w.seen.add(hit); waiters.splice(waiters.indexOf(w), 1); clearTimeout(w.timer); w.resolve(hit.data); }
    }
  }
  return {
    ready, events,
    next(event, pred = () => true, ms = 3000) {
      return new Promise((resolve, reject) => {
        const w = { event, pred, resolve, seen: new Set() };
        w.timer = setTimeout(() => { waiters.splice(waiters.indexOf(w), 1); reject(new Error(`Không nhận được sự kiện ${event}`)); }, ms);
        waiters.push(w); flush();
      });
    },
    close() { ctrl.abort(); }
  };
}

test("Sảnh: NPC Trợ lý – admin chọn tài khoản, hỏi AI bằng key của tài khoản đó, sửa hướng dẫn", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-lobby-npc-"));
  const keys = { ltn: "key-ltn", ngoc: "key-ngoc", bot: "key-bot-secret", other: "key-other-bot" };
  // AI giả: ghi lại yêu cầu, trả lời kèm vài chữ của hướng dẫn để kiểm tra
  const seen = [];
  const up = http.createServer(async (req, res) => {
    let raw = ""; for await (const c of req) raw += c;
    const body = raw ? JSON.parse(raw) : {};
    seen.push({ url: req.url, auth: req.headers.authorization, body });
    if (req.url === "/v1/models") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ object: "list", data: [{ id: "SIMI-GPT", owned_by: "combo" }, { id: "SIMI-FREE", owned_by: "combo" }] })); }
    if (req.url === "/v1/responses") {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ id: "r1", object: "response", status: "completed", output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: "1. Bấm 🖼️ để gửi ảnh." }] }] }));
    }
    res.writeHead(404); res.end("{}");
  });
  const upPort = await listen(up);
  await writeFile(join(root, "teams.json"), JSON.stringify({ teams: [{ code: "IT", displayName: "IT", keyHash: hash("x"), enabled: true, memoryFile: "IT.md" }] }));
  await writeFile(join(root, "users.json"), JSON.stringify({ version: 1, users: {
    "it-ltn": { displayName: "LTN", teamId: "IT", keyHash: hash(keys.ltn), enabled: true },
    "it-ngoc": { displayName: "Ngọc", teamId: "IT", keyHash: hash(keys.ngoc), enabled: true },
    "simi-bot": { displayName: "ChatBot", teamId: "IT", role: "PUBLIC_CHATBOT_SERVICE", memoryMode: "none", keyHash: hash(keys.bot), enabled: true },
    "bot-2": { displayName: "Bot khác", teamId: "IT", role: "PUBLIC_CHATBOT_SERVICE", memoryMode: "none", keyHash: hash(keys.other), enabled: true }
  } }));
  Object.assign(process.env, {
    TEAMS_FILE: join(root, "teams.json"), LTN_USERS_CONFIG_FILE: join(root, "users.json"), MEMORY_DIR: join(root, "memory"),
    LOBBY_DATA_DIR: join(root, "lobby"), LOBBY_CINEMA_LOOKUP: "false", UPSTREAM_BASE_URL: `http://127.0.0.1:${upPort}`,
    LOBBY_ADMINS: "it-ltn", LOBBY_NPC_KEYS: keys.bot, LOBBY_NPC_PER_HOUR: "2",
    CODEX_COMBO_PREMIUM: "SIMI-GPT", CODEX_COMBO_FREE: "SIMI-FREE", CODEX_DEFAULT_POLICY: "limited_daily", CODEX_DEFAULT_PREMIUM_LIMIT: "50",
    CODEX_USAGE_FILE: join(root, "codex-usage.json"), CODEX_USAGE_TIMEZONE: "Asia/Ho_Chi_Minh"
  });
  const { createGatewayServer } = await import(`../src/server.mjs?lobbynpc=${Date.now()}`);
  const server = createGatewayServer();
  const base = `http://127.0.0.1:${await listen(server)}/v1/lobby`;
  const auth = (k) => ({ authorization: `Bearer ${keys[k]}` });
  const post = (k, path, body) => fetch(`${base}/${path}`, { method: "POST", headers: { ...auth(k), "content-type": "application/json" }, body: JSON.stringify(body) });
  const streams = [];
  try {
    const ngoc = sse(`${base}/stream`, auth("ngoc")); streams.push(ngoc);
    const h = await ngoc.next("hello");
    assert.ok(h.features.includes("npc")); assert.equal(h.npc, null, "chưa chọn tài khoản NPC");
    const r0 = await post("ngoc", "npc/ask", { question: "Gửi ảnh sao?" });
    assert.equal(r0.status, 503); assert.match((await r0.json()).error.message, /chưa chọn tài khoản/);

    const ov = await (await fetch(`${base}/admin`, { headers: auth("ltn") })).json();
    const bot = ov.npcCandidates.find((c) => c.id === "u:simi-bot");
    assert.ok(bot.chatbot && bot.ready, "tài khoản chatbot có key trong .env → sẵn sàng");
    assert.equal(ov.npcCandidates.find((c) => c.id === "u:bot-2").ready, false, "chưa có key → chưa hỏi AI được");
    assert.equal(ov.npcCandidates[0].chatbot, true, "tài khoản chatbot xếp đầu danh sách");
    assert.equal((await post("ngoc", "admin", { action: "npc", id: "u:simi-bot" })).status, 403);
    assert.equal((await post("ltn", "admin", { action: "npc", id: "u:khong-co" })).status, 404);
    await post("ltn", "admin", { action: "npc", id: "u:simi-bot" });
    const ev = await ngoc.next("npc");
    assert.equal(ev.npc.name, "ChatBot"); assert.equal(ev.npc.ready, true);

    const r1 = await (await post("ngoc", "npc/ask", { question: "Gửi ảnh trong Sảnh sao?", guide: "## Gửi ảnh\n1. Bấm nút 🖼️", history: [{ role: "user", text: "chào" }, { role: "assistant", text: "Chào bạn!" }] })).json();
    assert.equal(r1.answer, "1. Bấm 🖼️ để gửi ảnh.");
    const call = seen.find((x) => x.url === "/v1/responses");
    assert.equal(call.auth, `Bearer ${keys.bot}`, "gọi AI bằng key của tài khoản NPC (tính vào hạn mức tài khoản đó)");
    assert.match(call.body.instructions, /Bấm nút 🖼️/, "kèm hướng dẫn app làm nguồn trả lời");
    assert.match(call.body.instructions, /Người đang hỏi: Ngọc/);
    assert.equal(call.body.input.length, 3, "kèm vài câu trước để hiểu ngữ cảnh");
    assert.ok(["SIMI-GPT", "SIMI-FREE"].includes(call.body.model), "đi qua định tuyến Combo của Gateway");

    // admin sửa hướng dẫn + ghi chú
    assert.equal((await post("ltn", "admin", { action: "npc-guides", guides: [{ title: "", steps: [] }] })).status, 400);
    await post("ltn", "admin", { action: "npc-guides", guides: [{ icon: "🧾", title: "Xin nghỉ phép", steps: ["Mở Chat", { text: "Gõ /nghi-phep", target: "#chInput", view: "chat" }, { text: "x", target: "<img onerror=1>" }] }], notes: "Hỏi IT qua nhóm Zalo IT" });
    await ngoc.next("npc-guides");
    const g = await (await fetch(`${base}/npc`, { headers: auth("ngoc") })).json();
    assert.equal(g.guides[0].title, "Xin nghỉ phép");
    assert.equal(g.guides[0].steps[1].target, "#chInput"); assert.equal(g.guides[0].steps[2].target, undefined, "bỏ chỗ chỉ tới không hợp lệ");
    await post("ngoc", "npc/ask", { question: "Xin nghỉ phép?", guide: "bản trong app" });
    const call2 = seen.filter((x) => x.url === "/v1/responses").at(-1);
    assert.match(call2.body.instructions, /Xin nghỉ phép/); assert.doesNotMatch(call2.body.instructions, /bản trong app/, "đã sửa thì dùng hướng dẫn của admin");
    assert.match(call2.body.instructions, /nhóm Zalo IT/, "kèm ghi chú của admin");
    const r3 = await post("ngoc", "npc/ask", { question: "Câu thứ 3" });
    assert.equal(r3.status, 429, "giới hạn số câu hỏi mỗi giờ");
    const audit = (await readFile(join(root, "lobby", "admin-audit.jsonl"), "utf8"));
    assert.match(audit, /npc-guides/);
    assert.doesNotMatch(audit + JSON.stringify(ov), /key-bot-secret/, "không lộ key NPC");
  } finally {
    streams.forEach((s) => s.close());
    await new Promise((r) => server.close(r)); up.close();
  }
});
