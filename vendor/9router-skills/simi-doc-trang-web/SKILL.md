---
name: simi-doc-trang-web
description: Đọc URL công khai thành Markdown, văn bản hoặc HTML qua Simi Gateway. Dùng khi user muốn đọc bài viết, trích xuất nội dung trang, xem tài liệu cài đặt hoặc khi máy không truy cập trực tiếp được URL; không dùng như proxy tải file nhị phân.
---

# Simi - Đọc nội dung trang web

Requires `NINEROUTER_URL` (and `NINEROUTER_KEY` if auth enabled). See https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router/SKILL.md for setup.

## SIMI managed setup

This skill is distributed by the SIMI installer. Route every request through
`https://ai.simi.vn`, never directly through the admin-only `router.simi.vn`.

- Windows: read `NINEROUTER_URL` and `NINEROUTER_KEY` from the user environment.
- macOS/Linux: set `NINEROUTER_URL=https://ai.simi.vn` and obtain the key at runtime
  with `NINEROUTER_KEY="$("$HOME/.codex/bin/ltn-codex-token")"`.

Do not print, persist, or include `NINEROUTER_KEY` in command output.

In a SIMI-managed installation, prefer the generated `ltn-9router` wrapper;
it supplies the Gateway URL, API key, and client ID without exposing the key:

```text
ltn-9router POST /web/fetch {"model":"fetch-combo","url":"https://example.com","format":"markdown"}
```

## Discover

```bash
ltn-9router GET /models/web | jq '.data[] | select(.kind=="webFetch") | .id'
# Per-provider params
curl "$NINEROUTER_URL/v1/models/info?id=firecrawl/fetch"
```

IDs end in `/fetch` (e.g. `firecrawl/fetch`, `jina/fetch`). `fetch-combo` chains providers with auto-fallback.

## Endpoint

`POST $NINEROUTER_URL/v1/web/fetch`

| Field | Required | Notes |
|---|---|---|
| `model` (or `provider`) | yes | from `/v1/models/web` (e.g. `firecrawl` or `jina-reader`) |
| `url` | yes | URL to extract |
| `format` | no | `markdown` (default) / `text` / `html` |
| `max_characters` | no | truncate output |

## Examples

### Jina Reader
```bash
ltn-9router POST /web/fetch '{"model":"jina-reader","url":"https://9router.com","format":"markdown"}'
```

### Exa
```bash
ltn-9router POST /web/fetch '{"model":"exa","url":"https://example.com","format":"markdown","max_characters":0}'
```

### Firecrawl
```bash
ltn-9router POST /web/fetch '{"model":"firecrawl","url":"https://example.com","format":"markdown","max_characters":0}'
```

### Tavily
```bash
ltn-9router POST /web/fetch '{"model":"tavily","url":"https://example.com","format":"markdown","max_characters":0}'
```


JS:

```js
const r = await fetch(`${process.env.NINEROUTER_URL}/v1/web/fetch`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${process.env.NINEROUTER_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model: "fetch-combo", url: "https://example.com", format: "markdown", max_characters: 5000 }),
});
const { data } = await r.json();
console.log(data.title, data.content.length);
```

## Response shape

```json
{
  "provider": "jina-reader",
  "url": "...",
  "title": "...",
  "content": { "format": "markdown", "text": "...", "length": 1234 },
  "metadata": { "author": null, "published_at": null, "language": null },
  "usage": { "fetch_cost_usd": 0 },
  "metrics": { "response_time_ms": 850, "upstream_latency_ms": 700 }
}
```

## Provider quirks

| Provider | Auth | Best for |
|---|---|---|
| `firecrawl` | Bearer | JS-rendered pages, `format=markdown/html` |
| `jina-reader` | Bearer (optional) | Free tier (~1M chars/mo); fastest plain markdown |
| `tavily` | Bearer | Bulk extract; returns `raw_content` |
| `exa` | `x-api-key` | Pre-indexed pages; fast text extraction |
