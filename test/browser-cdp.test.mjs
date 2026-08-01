import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createHash } from "node:crypto";
import { readCdpPage } from "../scripts/browser-cdp.mjs";

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
