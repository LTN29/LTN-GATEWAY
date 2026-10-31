import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const hash = (k) => createHash("sha256").update(k).digest("hex");
const listen = (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));

// đọc sự kiện SSE cho tới khi gặp sự kiện cần chờ
async function waitEvent(reader, state, name, ms = 4000) {
  const dec = new TextDecoder();
  const end = Date.now() + ms;
  for (;;) {
    const i = state.buf.indexOf("\n\n");
    if (i >= 0) {
      const block = state.buf.slice(0, i); state.buf = state.buf.slice(i + 2);
      const ev = /^event: (.+)$/m.exec(block); const data = /^data: (.+)$/m.exec(block);
      if (ev && data && ev[1] === name) return JSON.parse(data[1]);
      continue;
    }
    if (Date.now() > end) throw new Error(`Không nhận được sự kiện ${name}`);
    const r = await Promise.race([reader.read(), new Promise((res) => setTimeout(() => res({ timeout: true }), end - Date.now()))]);
    if (r.timeout) throw new Error(`Không nhận được sự kiện ${name}`);
    if (r.done) throw new Error("Luồng Sảnh bị đóng");
    state.buf += dec.decode(r.value, { stream: true });
  }
}

test("Sảnh báo ngay cho app khi admin đăng bản Văn Phòng AI mới", async () => {
  const root = await mkdtemp(join(tmpdir(), "ltn-lobby-rel-"));
  const rel = join(root, "releases");
  await mkdir(rel, { recursive: true });
  const manifest = (version) => writeFile(join(rel, "latest.json"), JSON.stringify({ app: "vanphong-ai", version, notes: "- Giao diện mới", files: {} }));
  await writeFile(join(root, "teams.json"), JSON.stringify({ teams: [{ code: "SALES", displayName: "Sales", keyHash: hash("unused"), enabled: true, memoryFile: "SALES.md" }] }));
  await writeFile(join(root, "users.json"), JSON.stringify({ version: 1, users: { "sales-ngoc": { displayName: "Ngọc", teamId: "SALES", keyHash: hash("key-ngoc"), enabled: true } } }));
  Object.assign(process.env, {
    TEAMS_FILE: join(root, "teams.json"), LTN_USERS_CONFIG_FILE: join(root, "users.json"), MEMORY_DIR: join(root, "memory"),
    LOBBY_DATA_DIR: join(root, "lobby"), VANPHONG_RELEASE_DIR: rel, LOBBY_RELEASE_CHECK_MS: "150", UPSTREAM_BASE_URL: "http://127.0.0.1:9"
  });
  const { createGatewayServer } = await import(`../src/server.mjs?release=${Date.now()}`);
  const server = createGatewayServer();
  const base = `http://127.0.0.1:${await listen(server)}/v1/lobby`;
  const ctrl = new AbortController();
  try {
    const res = await fetch(`${base}/stream`, { headers: { authorization: "Bearer key-ngoc" }, signal: ctrl.signal });
    assert.equal(res.status, 200);
    const reader = res.body.getReader(); const st = { buf: "" };
    const hello = await waitEvent(reader, st, "hello");
    assert.equal(hello.app, null, "chưa đăng bản nào");
    await manifest("1.0.0");
    assert.equal((await waitEvent(reader, st, "app-release")).version, "1.0.0", "bản đăng đầu tiên cũng được báo");
    const res2 = await fetch(`${base}/stream`, { headers: { authorization: "Bearer key-ngoc" }, signal: ctrl.signal });
    const hello2 = await waitEvent(res2.body.getReader(), { buf: "" }, "hello");
    assert.deepEqual(hello2.app, { version: "1.0.0" }, "lời chào kèm bản app đang phát hành");
    await manifest("1.0.1");
    const ev = await waitEvent(reader, st, "app-release");
    assert.equal(ev.version, "1.0.1");
    assert.match(ev.notes, /Giao diện mới/);
  } finally {
    ctrl.abort();
    server.closeAllConnections?.();
    await new Promise((r) => server.close(r));
  }
});
