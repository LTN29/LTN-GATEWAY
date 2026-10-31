// Ảnh gửi trong chat Sảnh: app đã nén sẵn (ảnh lớn ~200–400 KB + ảnh thu nhỏ ~20–60 KB) rồi mới gửi lên.
// Gateway chỉ nhận PNG / JPEG / WebP / GIF (kiểm tra theo nội dung file, không tin tên / content-type), gắn ảnh với
// đúng phòng chat lúc tải lên → chỉ người xem được phòng đó mới mở được ảnh. Tự xoá ảnh quá hạn và ảnh tải lên nhưng không gửi.
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { jsonLog } from "./utils.mjs";

export const fileConfig = {
  get maxBytes() { return Math.max(0.2, Number(process.env.LOBBY_IMAGE_MAX_MB || 5)) * 1048576; },
  get thumbMaxBytes() { return 256 * 1024; },
  get retentionDays() { return Math.max(1, Number(process.env.LOBBY_FILE_RETENTION_DAYS || 30)); },
  get maxTotalBytes() { return Math.max(50, Number(process.env.LOBBY_FILES_MAX_MB || 4096)) * 1048576; },
  get perDay() { return Math.max(1, Number(process.env.LOBBY_IMAGES_PER_DAY || 200)); }
};

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const ORPHAN_MS = 24 * 3600_000; // tải lên mà không gửi kèm tin nào

// nhận dạng ảnh bằng vài byte đầu file
export function sniffImage(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (buf.toString("ascii", 0, 4) === "GIF8") return "image/gif";
  return null;
}

const httpError = (status, message, type = "invalid_request_error") => Object.assign(new Error(message), { statusCode: status, type });

export class LobbyFiles {
  constructor() { this.dir = null; this.meta = new Map(); this.total = 0; this.daily = new Map(); this.sweepTimer = null; }

  async init(baseDir) {
    const dir = join(baseDir, "files");
    if (this.dir === dir) return;
    this.dir = dir; this.meta.clear(); this.total = 0;
    await mkdir(dir, { recursive: true });
    for (const f of await readdir(dir)) {
      if (!f.endsWith(".json")) continue;
      try {
        const m = JSON.parse(await readFile(join(dir, f), "utf8"));
        if (ID.test(m.id)) { this.meta.set(m.id, m); this.total += (m.size || 0) + (m.tsize || 0); }
      } catch { /* meta hỏng: lượt dọn sau xoá */ }
    }
    await this.sweep();
    clearInterval(this.sweepTimer);
    this.sweepTimer = setInterval(() => this.sweep().catch((e) => jsonLog("lobby_files_sweep_failed", { error: e.message })), 6 * 3600_000);
    this.sweepTimer.unref?.();
  }

  path(id, thumb) { return join(this.dir, `${id}${thumb ? ".t" : ""}.bin`); }

  // body = [ảnh thu nhỏ (thumbBytes)] + [ảnh đầy đủ]
  async put({ by, room, body, thumbBytes, w, h }) {
    const day = new Date().toISOString().slice(0, 10);
    const key = `${day}|${by}`;
    if ((this.daily.get(key) || 0) >= fileConfig.perDay) throw httpError(429, `Hôm nay bạn đã gửi ${fileConfig.perDay} ảnh – mai gửi tiếp nhé`, "rate_limit_error");
    const tb = Math.max(0, Math.floor(Number(thumbBytes) || 0));
    if (tb > fileConfig.thumbMaxBytes || tb >= body.length) throw httpError(400, "Ảnh thu nhỏ không hợp lệ");
    const thumb = body.subarray(0, tb); const full = body.subarray(tb);
    if (full.length > fileConfig.maxBytes) throw httpError(413, `Ảnh lớn quá ${Math.round(fileConfig.maxBytes / 1048576)} MB`);
    const type = sniffImage(full);
    if (!type) throw httpError(400, "Chỉ gửi được ảnh PNG, JPG, WebP hoặc GIF");
    const ttype = tb ? sniffImage(thumb) : null;
    if (tb && !ttype) throw httpError(400, "Ảnh thu nhỏ không hợp lệ");
    if (this.total + body.length > fileConfig.maxTotalBytes) {
      jsonLog("lobby_files_full", { total: this.total });
      throw httpError(507, "Máy chủ đã hết chỗ lưu ảnh – báo admin dọn bớt nhé", "server_error");
    }
    const id = randomUUID();
    const m = { id, by, room, type, size: full.length, ttype, tsize: thumb.length, w: clampInt(w, 1, 20000), h: clampInt(h, 1, 20000), ts: Date.now(), msg: null };
    await writeFile(this.path(id), full);
    if (tb) await writeFile(this.path(id, true), thumb);
    await this.saveMeta(m);
    this.meta.set(id, m); this.total += body.length;
    this.daily.set(key, (this.daily.get(key) || 0) + 1);
    if (this.daily.size > 5000) for (const k of this.daily.keys()) if (!k.startsWith(day)) this.daily.delete(k);
    return m;
  }

  async saveMeta(m) {
    const p = join(this.dir, `${m.id}.json`); const tmp = `${p}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(m)); await rename(tmp, p);
  }

  get(id) { return ID.test(String(id)) ? this.meta.get(String(id)) || null : null; }

  // gắn ảnh vào tin nhắn (ảnh đã gắn thì không dùng lại cho tin khác)
  async attach(ids, { by, room, msgId }) {
    const out = [];
    for (const id of ids) {
      const m = this.get(id);
      if (!m || m.by !== by || m.room !== room || (m.msg && m.msg !== msgId)) throw httpError(400, "Ảnh không còn hoặc đã gửi rồi – chọn lại ảnh nhé");
      out.push(m);
    }
    for (const m of out) { m.msg = msgId; await this.saveMeta(m); }
    return out.map((m) => ({ id: m.id, w: m.w, h: m.h, type: m.type, size: m.size, thumb: !!m.tsize }));
  }

  async remove(id) {
    const m = this.meta.get(id); if (!m) return;
    this.meta.delete(id); this.total -= (m.size || 0) + (m.tsize || 0);
    await Promise.all([rm(this.path(id), { force: true }), rm(this.path(id, true), { force: true }), rm(join(this.dir, `${id}.json`), { force: true })]);
  }

  async sweep() {
    const now = Date.now(); const cutoff = now - fileConfig.retentionDays * 86_400_000;
    let n = 0;
    for (const m of [...this.meta.values()]) {
      if (m.ts < cutoff || (!m.msg && m.ts < now - ORPHAN_MS)) { await this.remove(m.id); n++; }
    }
    if (n) jsonLog("lobby_files_swept", { removed: n, total: this.total });
  }

  // gửi file ảnh: ảnh không bao giờ đổi theo id → cho app lưu đệm lâu
  async send(res, m, thumb) {
    const useThumb = thumb && m.tsize;
    const p = this.path(m.id, useThumb);
    const st = await stat(p).catch(() => null);
    if (!st) throw httpError(404, "Ảnh đã bị xoá", "not_found_error");
    res.writeHead(200, {
      "content-type": useThumb ? m.ttype : m.type,
      "content-length": st.size,
      "cache-control": "private, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; sandbox"
    });
    await new Promise((resolve, reject) => { const s = createReadStream(p); s.on("error", reject); s.on("end", resolve); s.pipe(res); });
  }

  stats() { return { files: this.meta.size, totalMB: Math.round(this.total / 104857.6) / 10, maxMB: Math.round(fileConfig.maxTotalBytes / 1048576), retentionDays: fileConfig.retentionDays }; }
}

const clampInt = (v, a, b) => Math.max(a, Math.min(b, Math.round(Number(v) || a)));
