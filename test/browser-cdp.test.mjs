import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  downloadCdpWorkbook,
  isLikelyRedirectUrl,
  readCdpPage,
  readCdpPages,
  resolveNavigationUrl,
  validateBrowserEvaluationExpressions
} from "../scripts/browser-cdp.mjs";

test("Facebook redirect links are unwrapped without changing ordinary short URLs", () => {
  const destination = "https://www.facebook.com/groups/example/posts/123?mibextid=abc";
  const redirect = `https://l.facebook.com/l.php?u=${encodeURIComponent(destination)}&h=token`;
  assert.equal(resolveNavigationUrl(redirect), destination);
  assert.equal(resolveNavigationUrl("https://bit.ly/example"), "https://bit.ly/example");
  assert.equal(isLikelyRedirectUrl("https://vt.tiktok.com/ZSabc/"), true);
  assert.equal(isLikelyRedirectUrl("https://vm.tiktok.com/ZSabc/"), true);
  assert.equal(isLikelyRedirectUrl("https://www.tiktok.com/@creator/video/123"), false);
});

test("browser page evaluation expressions compile before they are sent to Chrome", () => {
  assert.equal(validateBrowserEvaluationExpressions(), true);
});

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

function serverFrame(value) {
  const payload = Buffer.from(JSON.stringify(value));
  if (payload.length < 126) return Buffer.concat([Buffer.from([0x81, payload.length]), payload]);
  const header = Buffer.alloc(4);
  header[0] = 0x81;
  header[1] = 126;
  header.writeUInt16BE(payload.length, 2);
  return Buffer.concat([header, payload]);
}

function readClientFrame(buffer) {
  if (buffer.length < 2) return null;
  const lengthByte = buffer[1] & 0x7f;
  const masked = Boolean(buffer[1] & 0x80);
  let headerLength = 2;
  let length = lengthByte;
  if (lengthByte === 126) {
    if (buffer.length < 4) return null;
    length = buffer.readUInt16BE(2);
    headerLength = 4;
  }
  const maskLength = masked ? 4 : 0;
  if (buffer.length < headerLength + maskLength + length) return null;
  let payloadStart = headerLength;
  const mask = masked ? buffer.subarray(payloadStart, payloadStart + 4) : null;
  if (mask) payloadStart += 4;
  const payload = Buffer.from(buffer.subarray(payloadStart, payloadStart + length));
  if (mask) {
    for (let index = 0; index < payload.length; index += 1) payload[index] ^= mask[index % 4];
  }
  return { payload, consumed: headerLength + maskLength + length };
}

test("CDP client reads visible DOM text without a Chrome extension", async () => {
  let server;
  let port;
  const sockets = new Set();
  server = http.createServer((req, res) => {
    if (req.url !== "/json/list") {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify([{
      type: "page",
      url: "https://inventory.simi.vn/inventory",
      title: "Inventory",
      webSocketDebuggerUrl: `ws://127.0.0.1:${port}/devtools/page/test`
    }]));
  });

  server.on("upgrade", (request, socket) => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
    const key = request.headers["sec-websocket-key"] || "";
    const accept = createHash("sha1")
      .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
      .digest("base64");
    socket.write([
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${accept}`,
      "\r\n"
    ].join("\r\n"));

    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      const frame = readClientFrame(buffer);
      if (!frame) return;
      buffer = buffer.subarray(frame.consumed);
      if (!frame.payload.length) return;
      const command = JSON.parse(frame.payload.toString("utf8"));
      socket.write(serverFrame({
        id: command.id,
        result: {
          result: {
            value: {
              url: "https://inventory.simi.vn/inventory",
              title: "Inventory",
              text: "TỔNG TỒN 26.659",
              selectedText: ""
            }
          }
        }
      }));
    });
  });

  port = await listen(server);
  try {
    const page = await readCdpPage({
      port,
      targetUrl: "https://inventory.simi.vn/inventory"
    });
    assert.equal(page.source, "chrome-cdp");
    assert.equal(page.text, "TỔNG TỒN 26.659");
  } finally {
    for (const socket of sockets) socket.destroy();
    await close(server);
  }
});

test("CDP client accepts a final URL after a shortened link redirects", async () => {
  let server;
  let port;
  let navigatedTo = "";
  const shortUrl = "https://bit.ly/koc-post";
  const finalUrl = "https://www.facebook.com/groups/example/posts/123";
  const sockets = new Set();
  server = http.createServer((req, res) => {
    if (req.url !== "/json/list") {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify([{
      type: "page",
      url: "https://inventory.simi.vn/inventory",
      title: "Inventory",
      webSocketDebuggerUrl: `ws://127.0.0.1:${port}/devtools/page/test`
    }]));
  });

  server.on("upgrade", (request, socket) => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
    const key = request.headers["sec-websocket-key"] || "";
    const accept = createHash("sha1")
      .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
      .digest("base64");
    socket.write([
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${accept}`,
      "\r\n"
    ].join("\r\n"));

    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      const frame = readClientFrame(buffer);
      if (!frame) return;
      buffer = buffer.subarray(frame.consumed);
      if (!frame.payload.length) return;
      const command = JSON.parse(frame.payload.toString("utf8"));
      if (command.method === "Page.navigate") navigatedTo = command.params.url;
      const pageUrl = navigatedTo ? finalUrl : "https://inventory.simi.vn/inventory";
      const isMetadata = command.params?.expression?.includes("publishedAtCandidates");
      const result = command.method === "Runtime.evaluate"
        ? {
            result: {
              value: isMetadata ? {
                publishedAtCandidates: ["2026-07-18T08:00:00.000Z"],
                loginRequired: false,
                accessStatus: "ok"
              } : {
                url: pageUrl,
                title: "Inventory",
                text: "Đơn Shopee 12",
                selectedText: "",
                readyState: "complete"
              }
            }
          }
        : {};
      socket.write(serverFrame({ id: command.id, result }));
    });
  });

  port = await listen(server);
  try {
    const page = await readCdpPage({
      port,
      targetUrl: shortUrl,
      timeoutMs: 2_000
    });
    assert.equal(navigatedTo, shortUrl);
    assert.equal(page.requestedUrl, shortUrl);
    assert.equal(page.finalUrl, finalUrl);
    assert.equal(page.redirected, true);
    assert.deepEqual(page.publishedAtCandidates, ["2026-07-18T08:00:00.000Z"]);
    assert.equal(page.accessStatus, "ok");
    assert.equal(page.text, "Đơn Shopee 12");
  } finally {
    for (const socket of sockets) socket.destroy();
    await close(server);
  }
});

test("CDP client opens separate tabs for multiple requested URLs", async () => {
  let server;
  let port;
  let nextTarget = 1;
  const sockets = new Set();
  const targets = new Map();
  const initialUrl = "https://inventory.simi.vn/inventory";
  const initialPath = "/devtools/page/initial";
  targets.set(initialPath, initialUrl);

  server = http.createServer((req, res) => {
    if (req.url === "/json/list") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify([...targets.entries()].map(([path, url]) => ({
        type: "page",
        url,
        title: "Inventory",
        webSocketDebuggerUrl: `ws://127.0.0.1:${port}${path}`
      }))));
      return;
    }
    if (req.method === "PUT" && req.url.startsWith("/json/new?")) {
      const url = decodeURIComponent(req.url.slice("/json/new?".length));
      const path = `/devtools/page/created-${nextTarget++}`;
      targets.set(path, url);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({
        type: "page",
        url,
        title: "New page",
        webSocketDebuggerUrl: `ws://127.0.0.1:${port}${path}`
      }));
      return;
    }
    res.writeHead(404).end();
  });

  server.on("upgrade", (request, socket) => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
    const key = request.headers["sec-websocket-key"] || "";
    const accept = createHash("sha1")
      .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
      .digest("base64");
    socket.write([
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${accept}`,
      "\r\n"
    ].join("\r\n"));

    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      const frame = readClientFrame(buffer);
      if (!frame) return;
      buffer = buffer.subarray(frame.consumed);
      if (!frame.payload.length) return;
      const command = JSON.parse(frame.payload.toString("utf8"));
      const targetPath = new URL(`ws://localhost${request.url}`).pathname;
      let url = targets.get(targetPath) || initialUrl;
      if (command.method === "Page.navigate" && /vt\.tiktok\.com/.test(command.params.url)) {
        url = "https://www.tiktok.com/@creator/video/123";
        targets.set(targetPath, url);
      }
      const result = command.method === "Runtime.evaluate"
        ? {
            result: {
              value: {
                url,
                title: "Inventory",
                text: url,
                selectedText: "",
                readyState: "complete"
              }
            }
          }
        : {};
      socket.write(serverFrame({ id: command.id, result }));
    });
  });

  port = await listen(server);
  try {
    const pages = await readCdpPages({
      port,
      targetUrls: [
        initialUrl,
        "https://inventory.simi.vn/admin/shopee/orders",
        "https://simigo-my.sharepoint.com/sites/sales",
        "https://vt.tiktok.com/ZSabc/"
      ],
      timeoutMs: 2_000
    });
    assert.equal(pages.length, 4);
    assert.deepEqual(pages.map((page) => page.url), [
      initialUrl,
      "https://inventory.simi.vn/admin/shopee/orders",
      "https://simigo-my.sharepoint.com/sites/sales",
      "https://www.tiktok.com/@creator/video/123"
    ]);
    assert.equal(pages[3].requestedUrl, "https://vt.tiktok.com/ZSabc/");
    assert.equal(pages[3].redirected, true);
    assert.equal(targets.size, 4);
  } finally {
    for (const socket of sockets) socket.destroy();
    await close(server);
  }
});

test("CDP client reads Excel cell content from frames and the accessibility tree", async () => {
  let server;
  let port;
  const sockets = new Set();
  const workbookUrl = "https://simigo.sharepoint.com/:x:/s/marketing/workbook";
  server = http.createServer((req, res) => {
    if (req.url !== "/json/list") {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify([{
      type: "page",
      url: workbookUrl,
      title: "Marketing.xlsx",
      webSocketDebuggerUrl: `ws://127.0.0.1:${port}/devtools/page/excel`
    }]));
  });

  server.on("upgrade", (request, socket) => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
    const key = request.headers["sec-websocket-key"] || "";
    const accept = createHash("sha1")
      .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
      .digest("base64");
    socket.write([
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${accept}`,
      "\r\n"
    ].join("\r\n"));

    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      const frame = readClientFrame(buffer);
      if (!frame) return;
      buffer = buffer.subarray(frame.consumed);
      const command = JSON.parse(frame.payload.toString("utf8"));
      let result = {};
      if (command.method === "Page.getFrameTree") {
        result = {
          frameTree: {
            frame: { id: "top" },
            childFrames: [{ frame: { id: "excel-frame" } }]
          }
        };
      } else if (command.method === "Page.createIsolatedWorld") {
        result = { executionContextId: command.params.frameId === "excel-frame" ? 2 : 1 };
      } else if (command.method === "Accessibility.getFullAXTree") {
        result = {
          nodes: [{
            ignored: false,
            role: { value: "gridcell" },
            name: { value: "C5" },
            value: { value: "125000" }
          }]
        };
      } else if (command.method === "Runtime.evaluate" && command.params.contextId === 2) {
        result = {
          result: {
            value: {
              url: "https://excel.officeapps.live.com/x/_layouts/xlviewerinternal.aspx",
              title: "Workbook frame",
              text: "SHEET GUI KOC",
              semanticText: "C5 | 125000",
              selectedText: "",
              readyState: "complete"
            }
          }
        };
      } else if (command.method === "Runtime.evaluate") {
        result = {
          result: {
            value: {
              url: workbookUrl,
              title: "Marketing.xlsx",
              text: "Marketing.xlsx",
              selectedText: "",
              readyState: "complete"
            }
          }
        };
      }
      socket.write(serverFrame({ id: command.id, result }));
    });
  });

  port = await listen(server);
  try {
    const page = await readCdpPage({ port, targetUrl: workbookUrl, timeoutMs: 2_000 });
    assert.match(page.text, /SHEET GUI KOC/);
    assert.match(page.text, /C5 \| 125000/);
    assert.match(page.text, /\[gridcell\] C5 125000/);
    assert.deepEqual(page.extraction, {
      mode: "dom-frames-accessibility",
      frameCount: 2,
      accessibilityNodeCount: 1
    });
  } finally {
    for (const socket of sockets) socket.destroy();
    await close(server);
  }
});

test("CDP client downloads a SharePoint workbook with browser download events", async () => {
  let server;
  let port;
  const sockets = new Set();
  const downloadDir = await mkdtemp(join(tmpdir(), "simi-workbook-"));
  const guid = "download-guid";
  server = http.createServer((req, res) => {
    if (req.method === "PUT" && req.url.startsWith("/json/new?")) {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({
        type: "page",
        url: "https://simigo.sharepoint.com/:x:/s/marketing/workbook",
        title: "Workbook",
        webSocketDebuggerUrl: `ws://127.0.0.1:${port}/devtools/page/download`
      }));
      return;
    }
    res.writeHead(404).end();
  });

  server.on("upgrade", (request, socket) => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
    const key = request.headers["sec-websocket-key"] || "";
    const accept = createHash("sha1")
      .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
      .digest("base64");
    socket.write([
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${accept}`,
      "\r\n"
    ].join("\r\n"));

    let buffer = Buffer.alloc(0);
    socket.on("data", async (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      const frame = readClientFrame(buffer);
      if (!frame) return;
      buffer = buffer.subarray(frame.consumed);
      if (!frame.payload.length) return;
      const command = JSON.parse(frame.payload.toString("utf8"));
      socket.write(serverFrame({ id: command.id, result: {} }));
      if (command.method === "Page.navigate") {
        await writeFile(join(downloadDir, guid), "mock workbook bytes");
        socket.write(serverFrame({
          method: "Browser.downloadWillBegin",
          params: { guid, suggestedFilename: "DATA KOC.xlsx", url: command.params.url }
        }));
        socket.write(serverFrame({
          method: "Browser.downloadProgress",
          params: { guid, state: "completed", receivedBytes: 19, totalBytes: 19 }
        }));
      }
    });
  });

  port = await listen(server);
  try {
    const result = await downloadCdpWorkbook({
      port,
      targetUrl: "https://simigo.sharepoint.com/:x:/s/marketing/workbook?e=abc",
      downloadDir,
      timeoutMs: 2_000
    });
    assert.equal(result.object, "browser.workbook.download");
    assert.equal(result.data.filename, "DATA KOC.xlsx");
    assert.equal(await readFile(result.data.path, "utf8"), "mock workbook bytes");
  } finally {
    for (const socket of sockets) socket.destroy();
    await close(server);
    await rm(downloadDir, { recursive: true, force: true });
  }
});
