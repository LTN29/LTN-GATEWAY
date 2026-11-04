// Trình duyệt SIMI thao tác theo DOM: browser_snapshot liệt kê phần tử (mã eN), browser_act bấm / gõ tiếng Việt / chọn /
// nhấn phím trong 1 lần gọi, nút đăng / thanh toán phải có confirmed. Chạy trên Chrome thật (bỏ qua nếu máy không có).
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function findChrome() {
  if (process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN)) return process.env.CHROME_BIN;
  for (const base of ["/opt/pw-browsers", join(process.env.HOME || "", ".cache", "ms-playwright")]) {
    try {
      for (const dir of readdirSync(base)) {
        const bin = join(base, dir, "chrome-linux64", "chrome");
        if (/^chromium-\d+$/.test(dir) && existsSync(bin)) return bin;
      }
    } catch {}
  }
  return "";
}

const PAGE = `<!doctype html><meta charset="utf-8"><title>Sửa bài viết</title>
<h1>Bài viết</h1>
<form onsubmit="event.preventDefault(); document.getElementById('out').textContent = 'Đã lưu: ' + title.value + ' / ' + cat.value + ' / ' + document.getElementById('body').innerText">
  <label>Tiêu đề <input id="title" value="Tiêu đề cũ"></label>
  <label>Chuyên mục <select id="cat"><option value="news">Tin tức</option><option value="promo">Khuyến mãi</option></select></label>
  <div id="body" contenteditable="true" aria-label="Nội dung bài">Nội dung cũ</div>
  <button type="submit">Lưu nháp</button>
  <button type="button" onclick="document.getElementById('out').textContent='ĐÃ ĐĂNG'">Đăng bài</button>
</form>
<p id="out"></p>`;

test("browser_snapshot + browser_act điều khiển trang bằng DOM", { skip: !findChrome() && "không có Chrome" }, async () => {
  const site = http.createServer((req, res) => { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); res.end(PAGE); });
  await new Promise((resolve) => site.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${site.address().port}/bai-viet`;
  const port = 9300 + Math.floor(Math.random() * 500);
  const chrome = spawn(findChrome(), ["--headless=new", "--no-sandbox", "--disable-gpu", `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "simi-act-"))}`, "about:blank"], { stdio: "ignore" });
  const mcp = spawn(process.execPath, [join(import.meta.dirname, "..", "scripts", "browser-mcp.mjs")], {
    env: { ...process.env, LTN_CHROME_DEBUG_PORT: String(port), LTN_CHROME_HEADLESS: "1" },
    stdio: ["pipe", "pipe", "inherit"]
  });
  let buf = ""; const waiting = new Map(); let seq = 0;
  mcp.stdout.on("data", (chunk) => {
    buf += chunk;
    let index;
    while ((index = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, index); buf = buf.slice(index + 1);
      try { const msg = JSON.parse(line); waiting.get(msg.id)?.(msg); } catch {}
    }
  });
  const call = (name, args) => new Promise((resolve) => {
    const id = ++seq; waiting.set(id, (msg) => resolve(msg.result));
    mcp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method: "tools/call", params: { name, arguments: args } }) + "\n");
  });
  const text = (result) => result.content.map((part) => part.text || "").join("\n");
  const ref = (snap, pattern) => (text(snap).split("\n").find((line) => pattern.test(line)) || "").split(" ")[0];
  try {
    for (let i = 0; i < 50; i++) { try { await fetch(`http://127.0.0.1:${port}/json/version`); break; } catch { await new Promise((r) => setTimeout(r, 200)); } }
    const listed = await new Promise((resolve) => { waiting.set(0, (msg) => resolve(msg.result)); mcp.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 0, method: "tools/list" }) + "\n"); });
    assert.ok(["browser_snapshot", "browser_act", "browser_screenshot"].every((name) => listed.tools.some((tool) => tool.name === name)));

    const snap = await call("browser_snapshot", { url });
    assert.ok(!snap.isError, text(snap));
    assert.match(text(snap), /Sửa bài viết/);
    const title = ref(snap, /textbox "Tiêu đề/), cat = ref(snap, /select "Chuyên mục/), body = ref(snap, /editor "Nội dung bài"/), save = ref(snap, /button "Lưu nháp"/), post = ref(snap, /button "Đăng bài"/);
    assert.ok(title && cat && body && save && post, "đủ mã phần tử:\n" + text(snap));

    const acted = await call("browser_act", { actions: [
      { action: "type", ref: title, text: "Khuyến mãi tháng 11 – giảm 30%" },
      { action: "select", ref: cat, value: "Khuyến mãi" },
      { action: "type", ref: body, text: "Áp dụng toàn bộ cửa hàng, số lượng có hạn." },
      { action: "click", ref: save }
    ] });
    assert.ok(!acted.isError, text(acted));
    assert.match(text(acted), /Đã lưu: Khuyến mãi tháng 11 – giảm 30% \/ promo \/ Áp dụng toàn bộ cửa hàng, số lượng có hạn\./, "gõ tiếng Việt, chọn, bấm trong 1 lần gọi");

    const risky = await call("browser_act", { actions: [{ action: "click", ref: post }] });
    assert.equal(risky.isError, true);
    assert.match(text(risky), /xác nhận/);
    assert.doesNotMatch(text(risky), /ĐÃ ĐĂNG/, "chưa xác nhận thì không bấm Đăng");
    const confirmed = await call("browser_act", { actions: [{ action: "click", ref: post, confirmed: true }] });
    assert.match(text(confirmed), /ĐÃ ĐĂNG/);

    const shot = await call("browser_screenshot", {});
    const image = shot.content.find((part) => part.type === "image");
    assert.equal(image.mimeType, "image/jpeg");
    assert.ok(image.data.length > 1000 && image.data.length < 400_000, "ảnh JPEG nhỏ");
  } finally {
    mcp.kill(); chrome.kill(); site.close();
  }
});
