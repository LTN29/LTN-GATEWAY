#!/usr/bin/env python3
"""Sửa ảnh chính xác trên máy bằng Pillow (giữ nguyên chi tiết ảnh gốc, vài giây là xong).

Dùng cho: làm nét, phóng to, chỉnh sáng / tương phản / màu, khử nhiễu, cắt, xoay, đổi cỡ,
xoá vùng (chữ, vết bẩn) bằng màu nền, viết chữ mới đúng vị trí, làm mờ / che vùng, chèn logo.
Model tạo ảnh thì vẽ lại cả ảnh nên mất chi tiết và chậm – việc chỉnh sửa chính xác làm ở đây.

Vào (stdin, JSON): {"source": "...", "output": "...", "ops": [{"op": "sharpen", ...}, ...]}
  hoặc {"source": "...", "inspect": true} để lấy kích thước ảnh.
Ra (stdout, JSON): {"ok": true, "path": "...", "width": W, "height": H, "applied": [...]}
Toạ độ vùng "box": [x0, y0, x1, y1] theo pixel, hoặc theo tỉ lệ 0–1 của ảnh hiện tại (cả 4 số ≤ 1).
"""
import json
import os
import sys

try:
    from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps, ImageStat
except ImportError:  # pragma: no cover
    print(json.dumps({"error": {"message": "Máy chưa có Pillow – chạy Cập nhật SIMI (Repair) để cài lại bộ Python của SIMI."}}))
    sys.exit(1)

MAX_SIDE = 8000


def fail(message):
    print(json.dumps({"error": {"message": message}}, ensure_ascii=False))
    sys.exit(1)


def box_of(img, box, name="box"):
    if not isinstance(box, (list, tuple)) or len(box) != 4:
        fail(f"{name} cần 4 số [x0, y0, x1, y1]")
    try:
        x0, y0, x1, y1 = [float(v) for v in box]
    except (TypeError, ValueError):
        fail(f"{name} phải là số")
    if max(abs(x0), abs(y0), abs(x1), abs(y1)) <= 1.0:
        x0, x1 = x0 * img.width, x1 * img.width
        y0, y1 = y0 * img.height, y1 * img.height
    x0, x1 = sorted((max(0, min(img.width, x0)), max(0, min(img.width, x1))))
    y0, y1 = sorted((max(0, min(img.height, y0)), max(0, min(img.height, y1))))
    if x1 - x0 < 1 or y1 - y0 < 1:
        fail(f"{name} quá nhỏ hoặc nằm ngoài ảnh")
    return int(round(x0)), int(round(y0)), int(round(x1)), int(round(y1))


def color_of(value, fallback=(0, 0, 0)):
    if value is None:
        return fallback
    if isinstance(value, (list, tuple)):
        return tuple(int(v) for v in value[:4])
    text = str(value).strip().lstrip("#")
    if len(text) == 3:
        text = "".join(c * 2 for c in text)
    try:
        return tuple(int(text[i:i + 2], 16) for i in range(0, len(text), 2))
    except ValueError:
        fail(f"Màu không hợp lệ: {value}")


def border_color(img, box, pad=6):
    """Màu nền quanh vùng (trung vị viền ngoài) – để xoá chữ / vết mà không lộ mảng màu lạ."""
    x0, y0, x1, y1 = box
    rgb = img.convert("RGB")
    strips = []
    for b in ((x0 - pad, y0 - pad, x1 + pad, y0), (x0 - pad, y1, x1 + pad, y1 + pad), (x0 - pad, y0, x0, y1), (x1, y0, x1 + pad, y1)):
        bx = (max(0, b[0]), max(0, b[1]), min(rgb.width, b[2]), min(rgb.height, b[3]))
        if bx[2] - bx[0] >= 1 and bx[3] - bx[1] >= 1:
            strips.append(rgb.crop(bx))
    if not strips:
        return (255, 255, 255)
    meds = [ImageStat.Stat(s).median for s in strips]
    return tuple(int(sorted(m[i] for m in meds)[len(meds) // 2]) for i in range(3))


FONT_FILES = {
    "bold": ["arialbd.ttf", "segoeuib.ttf", "Arial Bold.ttf", "Helvetica-Bold.ttf", "DejaVuSans-Bold.ttf", "LiberationSans-Bold.ttf", "NotoSans-Bold.ttf"],
    "regular": ["arial.ttf", "segoeui.ttf", "Arial.ttf", "Helvetica.ttf", "DejaVuSans.ttf", "LiberationSans-Regular.ttf", "NotoSans-Regular.ttf"],
    "serif": ["timesbd.ttf", "times.ttf", "Times New Roman.ttf", "DejaVuSerif-Bold.ttf", "LiberationSerif-Bold.ttf"],
}
FONT_DIRS = [
    os.path.join(os.environ.get("WINDIR", "C:\\Windows"), "Fonts"),
    os.path.expanduser("~/AppData/Local/Microsoft/Windows/Fonts"),
    "/System/Library/Fonts/Supplemental", "/System/Library/Fonts", "/Library/Fonts", os.path.expanduser("~/Library/Fonts"),
    "/usr/share/fonts/truetype/dejavu", "/usr/share/fonts/truetype/liberation", "/usr/share/fonts/truetype", "/usr/share/fonts",
]


def load_font(kind, size):
    if kind and os.path.isfile(str(kind)):
        return ImageFont.truetype(str(kind), size)
    for name in FONT_FILES.get(str(kind or "bold"), FONT_FILES["bold"]):
        for folder in FONT_DIRS:
            path = os.path.join(folder, name)
            if os.path.isfile(path):
                return ImageFont.truetype(path, size)
    for folder in FONT_DIRS:  # tìm sâu một tầng (Linux)
        if os.path.isdir(folder):
            for root, _dirs, files in os.walk(folder):
                for name in files:
                    if name.lower().endswith(".ttf") and "bold" in name.lower():
                        return ImageFont.truetype(os.path.join(root, name), size)
    return ImageFont.load_default()


def distance_map(img, color):
    """Ảnh xám: mỗi điểm = độ lệch màu lớn nhất (0–255) so với `color`."""
    rgb = img.convert("RGB")
    diff = ImageChops.difference(rgb, Image.new("RGB", rgb.size, tuple(color[:3])))
    r, g, b = diff.split()
    return ImageChops.lighter(ImageChops.lighter(r, g), b)


def ramp(dist, tolerance, soften):
    """0 khi lệch ≤ tolerance, 255 khi lệch ≥ tolerance + soften, chuyển dần ở giữa (mép chữ không bị răng cưa)."""
    soften = max(1, int(soften))
    return dist.point([0 if d <= tolerance else 255 if d >= tolerance + soften else int(255 * (d - tolerance) / soften) for d in range(256)])


def corner_color(img):
    """Màu nền: trung vị 4 góc ảnh."""
    rgb = img.convert("RGB")
    k = max(2, min(rgb.width, rgb.height) // 40)
    meds = [ImageStat.Stat(rgb.crop(b)).median for b in ((0, 0, k, k), (rgb.width - k, 0, rgb.width, k), (0, rgb.height - k, k, rgb.height), (rgb.width - k, rgb.height - k, rgb.width, rgb.height))]
    return tuple(int(sorted(m[i] for m in meds)[1]) for i in range(3))


def main_color(img, skip):
    """Màu chiếm nhiều nhất không phải nền (vd màu chữ của logo); bỏ qua điểm trong suốt."""
    small = img.convert("RGBA")
    small.thumbnail((160, 160))
    counts = {}
    raw = small.tobytes()
    for i in range(0, len(raw), 4):
        r, g, b, a = raw[i], raw[i + 1], raw[i + 2], raw[i + 3]
        if a < 128 or max(abs(r - skip[0]), abs(g - skip[1]), abs(b - skip[2])) <= 40:
            continue
        key = (r // 24, g // 24, b // 24)
        n, sr, sg, sb = counts.get(key, (0, 0, 0, 0))
        counts[key] = (n + 1, sr + r, sg + g, sb + b)
    if not counts:
        fail("Không tìm thấy màu nào khác màu nền để đổi – nêu rõ màu cần đổi ở `from`")
    n, sr, sg, sb = max(counts.values())
    return (sr // n, sg // n, sb // n)


def apply(img, op):
    kind = str(op.get("op", "")).lower()
    region = op.get("box")
    if kind in ("sharpen", "denoise", "enhance", "autocontrast", "blur") and region is not None:
        b = box_of(img, region)
        part = apply(img.crop(b), {**op, "box": None})
        out = img.copy()
        out.paste(part, b[:2])
        return out
    if kind == "sharpen":
        return img.filter(ImageFilter.UnsharpMask(radius=float(op.get("radius", 2)), percent=int(op.get("amount", 160)), threshold=int(op.get("threshold", 2))))
    if kind == "upscale":
        factor = max(1.0, min(4.0, float(op.get("factor", 2))))
        size = (int(img.width * factor), int(img.height * factor))
        if max(size) > MAX_SIDE:
            fail(f"Ảnh sau khi phóng to quá lớn (tối đa {MAX_SIDE}px mỗi cạnh)")
        up = img.resize(size, Image.LANCZOS)
        return up.filter(ImageFilter.UnsharpMask(radius=1.2 * factor, percent=90, threshold=2))
    if kind == "denoise":
        size = int(op.get("size", 3))
        return img.filter(ImageFilter.MedianFilter(size if size % 2 else size + 1))
    if kind == "enhance":
        out = img
        for key, cls in (("brightness", ImageEnhance.Brightness), ("contrast", ImageEnhance.Contrast), ("saturation", ImageEnhance.Color), ("sharpness", ImageEnhance.Sharpness)):
            if op.get(key) is not None:
                out = cls(out).enhance(max(0.0, min(4.0, float(op[key]))))
        return out
    if kind == "autocontrast":
        has_alpha = img.mode == "RGBA"
        base = ImageOps.autocontrast(img.convert("RGB"), cutoff=float(op.get("cutoff", 1)))
        if has_alpha:
            base.putalpha(img.getchannel("A"))
        return base
    if kind == "blur":
        return img.filter(ImageFilter.GaussianBlur(float(op.get("radius", 12))))
    if kind == "crop":
        return img.crop(box_of(img, op.get("box")))
    if kind == "resize":
        w, h = op.get("width"), op.get("height")
        if not w and not h:
            fail("resize cần width hoặc height")
        w = int(w or img.width * int(h) / img.height)
        h = int(h or img.height * int(w) / img.width)
        if max(w, h) > MAX_SIDE:
            fail(f"Kích thước quá lớn (tối đa {MAX_SIDE}px)")
        return img.resize((w, h), Image.LANCZOS)
    if kind == "rotate":
        return img.rotate(-float(op.get("degrees", 90)), expand=True, resample=Image.BICUBIC, fillcolor=color_of(op.get("fill"), (255, 255, 255)))
    if kind == "flip":
        return ImageOps.mirror(img) if op.get("direction", "horizontal") == "horizontal" else ImageOps.flip(img)
    if kind == "erase":
        b = box_of(img, op.get("box"))
        fill = border_color(img, b) if op.get("color") in (None, "auto") else color_of(op.get("color"))
        out = img.copy()
        ImageDraw.Draw(out).rectangle(b, fill=fill[:3] + ((255,) if out.mode == "RGBA" else ()))
        feather = int(op.get("feather", 3))
        if feather > 0:  # làm mềm mép để không lộ khung chữ nhật
            pad = feather * 3
            fb = (max(0, b[0] - pad), max(0, b[1] - pad), min(out.width, b[2] + pad), min(out.height, b[3] + pad))
            mask = Image.new("L", out.size, 0)
            ImageDraw.Draw(mask).rectangle(fb, fill=255)
            mask = mask.filter(ImageFilter.GaussianBlur(feather))
            blurred = out.filter(ImageFilter.GaussianBlur(feather))
            edge = Image.new("L", out.size, 0)
            ImageDraw.Draw(edge).rectangle(fb, fill=255)
            ImageDraw.Draw(edge).rectangle((b[0] + pad, b[1] + pad, b[2] - pad, b[3] - pad), fill=0)
            out = Image.composite(blurred, out, edge.filter(ImageFilter.GaussianBlur(feather)))
        return out
    if kind == "transparent":
        # xoá nền theo màu (logo, chữ ký, con dấu, ảnh sản phẩm nền trơn): mode "edge" chỉ xoá vùng nền nối với mép ảnh
        # (giữ mảng cùng màu nằm trong vật thể), "all" xoá mọi điểm cùng màu nền
        out = img.convert("RGBA")
        bg = corner_color(out) if op.get("color") in (None, "auto") else color_of(op.get("color"))
        tol = int(op.get("tolerance", 24))
        keep = ramp(distance_map(out, bg), tol, op.get("soften", 16))  # 255 = giữ
        if str(op.get("mode", "edge")).lower() != "all":
            scale = max(1, max(out.size) // 700)
            small = keep.resize((max(1, out.width // scale), max(1, out.height // scale)), Image.BILINEAR).point(lambda v: 0 if v < 128 else 255)
            w, h = small.size
            px = small.load()
            for x, y in [(x, y) for x in range(0, w, 2) for y in (0, h - 1)] + [(x, y) for y in range(0, h, 2) for x in (0, w - 1)]:
                if px[x, y] == 0:
                    ImageDraw.floodfill(small, (x, y), 100)
            outside = small.point(lambda v: 255 if v == 100 else 0).resize(out.size, Image.BILINEAR).filter(ImageFilter.MaxFilter(3))
            keep = ImageChops.lighter(keep, ImageChops.invert(outside))  # ngoài vùng nối mép: giữ nguyên
        out.putalpha(ImageChops.darker(out.getchannel("A"), keep))
        return out
    if kind == "recolor":
        # đổi 1 màu thành màu khác, giữ mép mượt và độ trong suốt (vd chữ logo đen → trắng)
        out = img.convert("RGBA")
        source = main_color(out, corner_color(out)) if op.get("from") in (None, "auto") else color_of(op.get("from"))
        target = color_of(op.get("to") or op.get("color"), (255, 255, 255))
        weight = ImageChops.invert(ramp(distance_map(out, source), int(op.get("tolerance", 40)), op.get("soften", 40)))  # 255 = đổi hẳn
        region = op.get("box")
        if region is not None:
            only = Image.new("L", out.size, 0)
            ImageDraw.Draw(only).rectangle(box_of(out, region), fill=255)
            weight = ImageChops.darker(weight, only)
        alpha = out.getchannel("A")
        out = Image.composite(Image.new("RGBA", out.size, tuple(target[:3]) + (255,)), out, weight)
        out.putalpha(alpha)
        return out
    if kind == "text":
        text = str(op.get("text", ""))
        if not text.strip():
            fail("text cần nội dung chữ")
        b = box_of(img, op.get("box"))
        bw, bh = b[2] - b[0], b[3] - b[1]
        size = max(6, bh)
        font = load_font(op.get("font", "bold"), size)
        draw = ImageDraw.Draw(img)
        spacing = float(op.get("letter_spacing", 0))
        while size > 6:  # thu cỡ chữ cho vừa khung
            l, t, r, btm = draw.textbbox((0, 0), text, font=font)
            width = r - l + spacing * size * max(0, len(text) - 1)
            if width <= bw and btm - t <= bh:
                break
            size -= max(1, size // 20)
            font = load_font(op.get("font", "bold"), size)
        out = img.copy()
        layer = Image.new("RGBA", out.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        l, t, r, btm = d.textbbox((0, 0), text, font=font)
        width = r - l + spacing * size * max(0, len(text) - 1)
        align = op.get("align", "center")
        x = b[0] if align == "left" else b[2] - width if align == "right" else b[0] + (bw - width) / 2
        y = b[1] + (bh - (btm - t)) / 2 - t
        col = color_of(op.get("color"), (40, 40, 40))
        alpha = int(255 * max(0.0, min(1.0, float(op.get("opacity", 1)))))
        fill = col[:3] + (alpha,)
        if spacing:
            cx = x - l
            for ch in text:
                d.text((cx, y), ch, font=font, fill=fill)
                cx += d.textlength(ch, font=font) + spacing * size
        else:
            d.text((x - l, y), text, font=font, fill=fill)
        soft = float(op.get("soften", 0.4))
        if soft > 0:  # mép chữ hơi mềm cho hoà với ảnh chụp
            layer = layer.filter(ImageFilter.GaussianBlur(soft))
        base = out.convert("RGBA")
        base.alpha_composite(layer)
        return base if out.mode == "RGBA" else base.convert(out.mode)
    if kind == "overlay":
        path = str(op.get("image", ""))
        if not os.path.isfile(path):
            fail("overlay cần image là đường dẫn ảnh (logo) trên máy")
        logo = Image.open(path).convert("RGBA")
        b = box_of(img, op.get("box"))
        logo.thumbnail((b[2] - b[0], b[3] - b[1]), Image.LANCZOS)
        base = img.convert("RGBA")
        pos = (b[0] + (b[2] - b[0] - logo.width) // 2, b[1] + (b[3] - b[1] - logo.height) // 2)
        base.alpha_composite(logo, pos)
        return base if img.mode == "RGBA" else base.convert(img.mode)
    fail(f"Thao tác không hỗ trợ: {kind}")


def main():
    try:
        req = json.loads(sys.stdin.read() or "{}")
    except json.JSONDecodeError:
        fail("Dữ liệu vào không phải JSON")
    src = str(req.get("source", ""))
    if not os.path.isfile(src):
        fail("Không thấy ảnh gốc: " + src)
    img = Image.open(src)
    img = ImageOps.exif_transpose(img)  # ảnh điện thoại: xoay đúng chiều
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if "A" in img.getbands() or img.mode == "P" else "RGB")
    if req.get("inspect"):
        print(json.dumps({"ok": True, "width": img.width, "height": img.height, "mode": img.mode}))
        return
    ops = req.get("ops") or []
    if not isinstance(ops, list) or not ops:
        fail("Cần ít nhất 1 thao tác trong ops")
    applied = []
    for op in ops[:40]:
        if not isinstance(op, dict):
            fail("Mỗi thao tác là một object {op: ...}")
        img = apply(img, op)
        applied.append(op.get("op"))
    out = str(req.get("output", ""))
    if not out:
        fail("Thiếu output")
    os.makedirs(os.path.dirname(os.path.abspath(out)) or ".", exist_ok=True)
    ext = os.path.splitext(out)[1].lower()
    if ext in (".jpg", ".jpeg"):
        img.convert("RGB").save(out, quality=95, subsampling=0, optimize=True)
    elif ext == ".webp":
        img.save(out, quality=95)
    else:
        img.save(out, optimize=True)
    print(json.dumps({"ok": True, "path": out, "width": img.width, "height": img.height, "applied": applied}, ensure_ascii=False))


if __name__ == "__main__":
    main()
