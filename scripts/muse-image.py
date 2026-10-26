#!/usr/bin/env python3
"""Generate or edit an image with Muse through the Simi Gateway and save it locally.

Prints exactly one JSON line. Never prints the API key.
"""

from __future__ import annotations

import argparse
import base64
import datetime as dt
import io
import json
import mimetypes
import os
import re
import sys
import unicodedata
import urllib.error
import urllib.request
from pathlib import Path

DEFAULT_MODEL = "muse2api/muse-image-chat"
DEFAULT_BASE = "https://ai.simi.vn"
MAX_REFS = 4
MAX_REF_BYTES = 15 * 1024 * 1024
MAX_IMAGE_BYTES = 40 * 1024 * 1024
# Stay below the Gateway MAX_BODY_BYTES (default 4_000_000) and UPSTREAM_TIMEOUT_MS (180 s).
MAX_REQUEST_BYTES = int(os.environ.get("MUSE_MAX_REQUEST_BYTES") or 3_800_000)
DEFAULT_TIMEOUT = 170.0
IMG_MD = re.compile(r"!\[[^\]]*\]\((\S+?)\)")
ERROR_PREFIX = "⚠️"


def _user_env(name: str) -> str:
    """Process env first, then the Windows user environment (set after Codex started)."""
    value = os.environ.get(name, "").strip()
    if value or os.name != "nt":
        return value
    try:
        import winreg

        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment") as key:
            return str(winreg.QueryValueEx(key, name)[0]).strip()
    except OSError:
        return ""


def _codex_home() -> Path:
    return Path(os.environ.get("CODEX_HOME") or Path.home() / ".codex")


def _base_url() -> str:
    base = (_user_env("LTN_GATEWAY_BASE_URL") or _user_env("NINEROUTER_URL") or DEFAULT_BASE)
    base = base.rstrip("/")
    return base if base.endswith("/v1") else base + "/v1"


def _api_key() -> str:
    key = _user_env("LTN_TEAM_API_KEY") or _user_env("NINEROUTER_KEY")
    if key:
        return key
    # macOS/Linux installs keep the key in Keychain/secret store behind a helper.
    helper = os.environ.get("LTN_CODEX_TOKEN_HELPER") or str(_codex_home() / "bin" / "ltn-codex-token")
    if os.name == "nt" or not os.access(helper, os.X_OK):
        return ""
    try:
        import subprocess

        out = subprocess.run([helper], capture_output=True, text=True, timeout=5, check=False)
        return out.stdout.strip() if out.returncode == 0 else ""
    except (OSError, subprocess.SubprocessError):
        return ""


def _client_id() -> str:
    cid = _user_env("LTN_CLIENT_ID")
    if cid:
        return cid
    try:
        return (_codex_home() / "ltn-client-id").read_text(encoding="utf-8").strip()
    except OSError:
        return ""


def _slug(text: str, limit: int = 40) -> str:
    text = unicodedata.normalize("NFKD", text.replace("đ", "d").replace("Đ", "D"))
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-").lower()
    return (text[:limit].rstrip("-") or "anh")


def _b64_len(n: int) -> int:
    return 4 * ((n + 2) // 3)

def _shrink(data: bytes, max_side: int, quality: int) -> bytes | None:
    """Downscale to JPEG with Pillow; None when Pillow is unavailable or fails."""
    try:
        from PIL import Image
    except ImportError:
        return None
    try:
        with Image.open(io.BytesIO(data)) as im:
            im.load()
            rgb = im.convert("RGB")
            rgb.thumbnail((max_side, max_side))
            buf = io.BytesIO()
            rgb.save(buf, format="JPEG", quality=quality, optimize=True)
            return buf.getvalue()
    except (OSError, ValueError):
        return None

def _data_url(path: Path, budget: int) -> str:
    """Encode a reference image, downscaling it so the request fits the Gateway limit."""
    data = path.read_bytes()
    if len(data) > MAX_REF_BYTES:
        raise ValueError(f"ảnh tham chiếu quá lớn (>15 MB): {path.name}")
    mime = mimetypes.guess_type(path.name)[0] or ""
    if path.suffix.lower() == ".webp":
        mime = "image/webp"
    if not mime.startswith("image/"):
        raise ValueError(f"không phải file ảnh: {path.name}")
    if _b64_len(len(data)) > budget:
        for side, quality in ((2048, 88), (1536, 85), (1024, 80), (768, 75)):
            small = _shrink(data, side, quality)
            if small is None:
                break
            if _b64_len(len(small)) <= budget:
                data, mime = small, "image/jpeg"
                break
        if _b64_len(len(data)) > budget:
            raise ValueError(
                f"ảnh tham chiếu quá lớn để gửi qua Gateway: {path.name}. "
                "Hãy dùng ảnh nhỏ hơn (dưới khoảng 2 MB) rồi thử lại.")
    return f"data:{mime};base64,{base64.b64encode(data).decode()}"


def _post_json(url: str, body: dict, headers: dict, timeout: float) -> dict:
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"),
                                 headers={**headers, "content-type": "application/json"},
                                 method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read()[:400].decode("utf-8", "replace")
        try:
            detail = json.loads(detail).get("error", {}).get("message", detail)
        except (ValueError, AttributeError):
            pass
        if exc.code == 413:
            raise RuntimeError("Gateway từ chối vì ảnh tham chiếu quá lớn (HTTP 413). "
                               "Hãy dùng ảnh nhỏ hơn rồi thử lại.") from None
        raise RuntimeError(f"Gateway trả HTTP {exc.code}: {detail}") from None


def _fetch_image(url: str, timeout: float) -> tuple[bytes, str]:
    if url.startswith("data:"):
        head, _, payload = url.partition(",")
        return base64.b64decode(payload), head[5:].split(";")[0]
    if not url.lower().startswith("https://") and not url.lower().startswith("http://"):
        raise RuntimeError("link ảnh không hợp lệ")
    req = urllib.request.Request(url, headers={"user-agent": "muse-tao-anh/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        ctype = (r.headers.get("content-type") or "").split(";")[0].strip().lower()
        data = r.read(MAX_IMAGE_BYTES + 1)
    if len(data) > MAX_IMAGE_BYTES:
        raise RuntimeError("ảnh tải về quá lớn")
    if not ctype.startswith("image/"):
        raise RuntimeError(f"link ảnh không trả về ảnh (content-type {ctype or 'trống'})")
    return data, ctype


def _save(data: bytes, mime: str, target: Path) -> Path:
    """Save as PNG when Pillow is available (best support in viewers), else as-is."""
    try:
        from PIL import Image

        with Image.open(io.BytesIO(data)) as im:
            im.load()
            out = target.with_suffix(".png")
            im.save(out, format="PNG")
            return out
    except ImportError:
        pass
    ext = {"image/webp": ".webp", "image/jpeg": ".jpg", "image/png": ".png"}.get(mime, ".img")
    out = target.with_suffix(ext)
    out.write_bytes(data)
    return out


def run(args: argparse.Namespace) -> dict:
    key = _api_key()
    if not key:
        return {"ok": False, "error": "Thiếu key Gateway (LTN_TEAM_API_KEY / NINEROUTER_KEY)."}

    refs = [Path(p).expanduser() for p in (args.ref or [])]
    if len(refs) > MAX_REFS:
        return {"ok": False, "error": f"Tối đa {MAX_REFS} ảnh tham chiếu."}
    for p in refs:
        if not p.is_file():
            return {"ok": False, "error": f"Không thấy ảnh tham chiếu: {p}"}

    content: str | list = args.prompt
    if refs:
        # The Gateway rejects bodies above MAX_BODY_BYTES; split the budget between refs.
        room = MAX_REQUEST_BYTES - 16_000 - len(args.prompt.encode("utf-8"))
        budget = max(64_000, room // len(refs))
        content = [{"type": "text", "text": args.prompt}] + [
            {"type": "image_url", "image_url": {"url": _data_url(p, budget)}} for p in refs]

    headers = {"authorization": f"Bearer {key}", "accept": "application/json",
               "user-agent": "muse-tao-anh/1.0"}
    cid = _client_id()
    if cid:
        headers["x-ltn-client-id"] = cid

    body = {"model": args.model, "stream": False,
            "messages": [{"role": "user", "content": content}]}
    resp = _post_json(_base_url() + "/chat/completions", body, headers, args.timeout)
    text = (((resp.get("choices") or [{}])[0].get("message") or {}).get("content") or "").strip()
    urls = IMG_MD.findall(text)
    if not urls:
        msg = text if text.startswith(ERROR_PREFIX) else (text[:300] or "Muse không trả về ảnh.")
        return {"ok": False, "error": msg}

    out_dir = Path(args.out_dir).expanduser()
    out_dir.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    stem = f"{stamp}-{_slug(args.prompt)}"
    n = 2
    while any(out_dir.glob(stem + "*")):  # never overwrite an earlier round
        stem = f"{stamp}-{_slug(args.prompt)}-{n}"
        n += 1
    images = []
    for i, url in enumerate(urls, 1):
        data, mime = _fetch_image(url, 60)
        path = _save(data, mime, out_dir / (stem if len(urls) == 1 else f"{stem}-{i}"))
        item = {"path": str(path.resolve())}
        if not url.startswith("data:"):
            item["url"] = url
            item["download_url"] = url + ("&" if "?" in url else "?") + "download=1"
        images.append(item)

    meta = out_dir / f"{stem}.json"
    meta.write_text(json.dumps({
        "created": stamp, "model": args.model, "prompt": args.prompt,
        "references": [str(p.resolve()) for p in refs],
        "images": images, "reply": text if not text.count("data:") else "(inline)",
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"ok": True, "images": images, "meta": str(meta.resolve())}


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--prompt", required=True, help="Mô tả ảnh đầy đủ cho lượt này")
    ap.add_argument("--ref", action="append", help="Ảnh tham chiếu (lặp lại, tối đa 4)")
    ap.add_argument("--model", default=os.environ.get("MUSE_IMAGE_MODEL", DEFAULT_MODEL))
    ap.add_argument("--out-dir", default=os.environ.get(
        "MUSE_IMAGE_DIR", str(Path.home() / "Pictures" / "muse")))
    ap.add_argument("--timeout", type=float, default=DEFAULT_TIMEOUT, help="Giây chờ Gateway")
    args = ap.parse_args()
    if not args.prompt.strip():
        print(json.dumps({"ok": False, "error": "Prompt trống."}, ensure_ascii=False))
        return 1
    try:
        result = run(args)
    except (TimeoutError, OSError) as exc:  # includes URLError/socket timeout
        reason = getattr(exc, "reason", exc)
        result = {"ok": False, "error": f"Lỗi mạng hoặc hết thời gian chờ: {reason}. "
                                        "Không tự gọi lại; ảnh có thể vẫn đang được tạo."}
    except (RuntimeError, ValueError) as exc:
        result = {"ok": False, "error": str(exc)}
    print(json.dumps(result, ensure_ascii=False))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    sys.exit(main())
