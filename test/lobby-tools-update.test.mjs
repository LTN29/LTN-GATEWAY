// Bộ công cụ SIMI trên Gateway đổi (git pull) → Sảnh báo "tools-update" ngay cho mọi app đang mở; lời chào "hello" mang phiên bản hiện tại.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("Sảnh báo tools-update khi phiên bản bộ công cụ đổi", async () => {
  process.env.LOBBY_DATA_DIR = await mkdtemp(join(tmpdir(), "lobby-tools-"));
  process.env.LOBBY_RELEASE_CHECK_MS = "100";
  const mod = await import(`../src/lobby.mjs?tools=${Date.now()}`);
  let version = "aaaa000011112222";
  mod.setLobbyToolsSource(async () => ({ bundleVersion: version }));
  const lobby = mod.getLobby();
  const sent = [];
  lobby.broadcast = (ev, data) => sent.push([ev, data]);
  await new Promise((resolve) => setTimeout(resolve, 350));
  assert.equal(lobby.toolsVersion, "aaaa000011112222");
  assert.equal(sent.filter(([ev]) => ev === "tools-update").length, 0, "lần đầu chỉ ghi nhận, không báo");
  version = "bbbb000011112222";
  await new Promise((resolve) => setTimeout(resolve, 350));
  assert.deepEqual(sent.filter(([ev]) => ev === "tools-update").map(([, data]) => data), [{ version: "bbbb000011112222" }]);
  clearInterval(lobby.releaseTimer);
  for (const key of Object.keys(lobby)) if (/Timer$/.test(key)) clearInterval(lobby[key]);
});
