#!/usr/bin/env python3
"""Extract text from a local PDF for the installed 9Router PDF skill."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def parse_page_range(value: str | None, page_count: int) -> list[int]:
    if not value:
        return list(range(page_count))
    pages: set[int] = set()
    for part in value.split(","):
        item = part.strip()
        if not item:
            continue
        if "-" in item:
            start_text, end_text = item.split("-", 1)
            start = int(start_text)
            end = int(end_text)
            if start < 1 or end < start:
                raise ValueError("Khoảng trang không hợp lệ.")
            pages.update(range(start - 1, end))
        else:
            page = int(item)
            if page < 1:
                raise ValueError("Số trang phải bắt đầu từ 1.")
            pages.add(page - 1)
    return sorted(page for page in pages if page < page_count)


def extract_with_pypdf(path: Path, page_indexes: list[int]) -> tuple[int, list[dict]]:
    from pypdf import PdfReader

    reader = PdfReader(str(path))
    if reader.is_encrypted:
        if reader.decrypt("") == 0:
            raise RuntimeError("PDF được mã hóa và cần mật khẩu để đọc.")
    pages = []
    for index in page_indexes:
        text = reader.pages[index].extract_text() or ""
        pages.append({"page": index + 1, "text": text})
    return len(reader.pages), pages


def extract_with_pymupdf(path: Path, page_indexes: list[int]) -> tuple[int, list[dict]]:
    import fitz

    document = fitz.open(str(path))
    try:
        pages = [
            {"page": index + 1, "text": document.load_page(index).get_text("text") or ""}
            for index in page_indexes
        ]
        return document.page_count, pages
    finally:
        document.close()


def extract(path: Path, page_range: str | None, max_chars: int) -> dict:
    if not path.is_file():
        raise FileNotFoundError(f"Không tìm thấy PDF: {path}")
    if path.suffix.lower() != ".pdf":
        raise ValueError("Tệp đầu vào phải có phần mở rộng .pdf.")

    try:
        from pypdf import PdfReader  # noqa: F401

        page_count = len(PdfReader(str(path)).pages)
        indexes = parse_page_range(page_range, page_count)
        page_count, pages = extract_with_pypdf(path, indexes)
        extractor = "pypdf"
    except ImportError:
        try:
            import fitz  # noqa: F401
        except ImportError as error:
            raise RuntimeError(
                "Thiếu thư viện PDF. Chạy installer lại hoặc cài pypdf và pymupdf."
            ) from error
        import fitz

        with fitz.open(str(path)) as document:
            page_count = document.page_count
        indexes = parse_page_range(page_range, page_count)
        page_count, pages = extract_with_pymupdf(path, indexes)
        extractor = "pymupdf"

    full_text = "\n\n".join(
        f"[Trang {page['page']}]\n{page['text'].strip()}" for page in pages
    ).strip()
    truncated = len(full_text) > max_chars
    if truncated:
        full_text = full_text[:max_chars]
    empty_pages = [page["page"] for page in pages if not page["text"].strip()]
    return {
        "file": str(path.resolve()),
        "extractor": extractor,
        "page_count": page_count,
        "pages_requested": [page["page"] for page in pages],
        "empty_pages": empty_pages,
        "needs_ocr": bool(empty_pages),
        "truncated": truncated,
        "text": full_text,
    }


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description="Extract visible text from a local PDF.")
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--pages", help="Pages such as 1-3,5")
    parser.add_argument("--max-chars", type=int, default=200_000)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    if args.max_chars < 1:
        parser.error("--max-chars phải lớn hơn 0.")
    try:
        result = extract(args.pdf, args.pages, args.max_chars)
    except Exception as error:  # user-facing CLI boundary
        print(f"ltn-pdf: {error}", file=sys.stderr)
        return 1
    if args.json:
        print(json.dumps(result, ensure_ascii=False))
    else:
        print(result["text"])
        if result["needs_ocr"]:
            print(
                f"\n[Chú ý: trang không có lớp text, cần OCR: {result['empty_pages']}]",
                file=sys.stderr,
            )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
