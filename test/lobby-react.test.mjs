import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, writeFile, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const hash = (k) => createHash("sha256").update(k).digest("hex");
const listen = (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));

test("Thả cảm xúc vào tin nhắn Sảnh", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-lobby-react-"));
  const keys = { ngoc: "key-ngoc", an: "key-an", bao: "key-bao" };
  await writeFile(join(root, "teams.json"), JSON.stringify({ teams: [{ code: "SALES", displayName: "Sales", keyHash: hash("x"), enabled: true, memoryFile: "SALES.md" }] }));
  await writeFile(join(root, "users.json"), JSON.stringify({ version: 1, users: Object.fromEntries(Object.entries(keys).map(([n, k]) => [`s-${n}`, { displayName: n[0].toUpperCase() + n.slice(1), teamId: "SALES", keyHash: hash(k), enabled: true }])) }));
  Object.assign(process.env, {
    TEAMS_FILE: join(root, "teams.json"), LTN_USERS_CONFIG_FILE: join(root, "users.json"), MEMORY_DIR: join(root, "memory"),
    LOBBY_DATA_DIR: join(root, "lobby"), LOBBY_CINEMA_LOOKUP: "false", UPSTREAM_BASE_URL: "http://127.0.0.1:9"
  });
  const { createGatewayServer } = await import(`../src/server.mjs?react=${Date.now()}`);
  const server = createGatewayServer();
  const base = `http://127.0.0.1:${await listen(server)}/v1/lobby`;
  const call = (k, method, path, body) => fetch(`${base}/${path}`, { method, headers: { authorization: `Bearer ${keys[k]}`, "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const react = (k, body) => call(k, "POST", "messages/react", body);
  try {
    const { message } = await (await call("ngoc", "POST", "messages", { room: "all", text: "Chốt đơn 100 triệu 🎉" })).json();
    let r = await react("an", { room: "all", id: message.id, emoji: "🔥" });
    assert.equal(r.status, 200);
    await react("bao", { room: "all", id: message.id, emoji: "🔥" });
    r = await (await react("ngoc", { room: "all", id: message.id, emoji: "❤️" })).json();
    assert.deepEqual(Object.fromEntries(Object.entries(r.reactions).map(([e, l]) => [e, l.map((p) => p.name)])), { "🔥": ["An", "Bao"], "❤️": ["Ngoc"] });
    r = await (await react("an", { room: "all", id: message.id, emoji: "🔥" })).json();
    assert.deepEqual(r.reactions["🔥"].map((p) => p.id), ["u:s-bao"], "bấm lại là bỏ");
    assert.equal((await react("an", { room: "all", id: message.id, emoji: "hay" })).status, 400, "chỉ nhận emoji");
    assert.equal((await react("an", { room: "all", id: "khong-co", emoji: "👍" })).status, 404);
    // tin nhắn riêng: người ngoài không thả được
    const dm = (await (await call("ngoc", "POST", "messages", { to: "u:s-an", text: "riêng nhé" })).json()).message;
    assert.equal((await react("bao", { room: dm.room, id: dm.id, emoji: "👍" })).status, 403);
    assert.equal((await react("an", { room: dm.room, id: dm.id, emoji: "👍" })).status, 200);
    // tin mới gửi ngay sau khi thả vẫn được giữ, cảm xúc ghi xuống đĩa
    await call("an", "POST", "messages", { room: "all", text: "Tuyệt vời" });
    const hist = await (await call("bao", "GET", "messages?room=all")).json();
    assert.equal(hist.data.find((m) => m.id === message.id).reactions["❤️"][0].name, "Ngoc", "lịch sử có cảm xúc");
    await new Promise((res) => setTimeout(res, 1900));
    const files = await readdir(join(root, "lobby", "rooms"));
    const all = (await Promise.all(files.map((f) => readFile(join(root, "lobby", "rooms", f), "utf8")))).join("");
    const lines = all.split("\n").filter(Boolean).map((l) => JSON.parse(l));
    assert.ok(lines.find((m) => m.id === message.id).reactions["🔥"], "đã ghi xuống đĩa");
    assert.ok(lines.some((m) => m.text === "Tuyệt vời"), "tin gửi sau không bị mất khi ghi lại file");
    const members = await (await call("an", "GET", "members")).json();
    assert.ok(members.features.includes("react"));
  } finally {
    server.close();
  }
});
