---
name: simi-tao-anh
description: Tạo ảnh qua Simi Gateway bằng OpenAI, Gemini Imagen, DALL-E, FLUX, MiniMax, SDWebUI, ComfyUI hoặc Codex. Dùng khi user muốn tạo, vẽ, render hay chỉnh sửa hình ảnh.
---

# Simi - Tạo ảnh

Requires `NINEROUTER_URL` (and `NINEROUTER_KEY` if auth enabled). See https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router/SKILL.md for setup.

## SIMI managed setup

This skill is distributed by the SIMI installer. Route every request through
`https://ai.simi.vn`, never directly through the admin-only `router.simi.vn`.

- Base URL defaults to `https://ai.simi.vn`; only use `NINEROUTER_URL` when it is
  explicitly configured.
- Resolve the token with the same helper as Codex:
  `NINEROUTER_KEY="$("${CODEX_HOME:-$HOME/.codex}/bin/ltn-codex-token)"`.
  The helper owns the shared priority order (`LTN_TEAM_API_KEY`, then
  `NINEROUTER_KEY`, then the installer-managed credential). Never ask the user
  to enter or create another key.

Do not print, persist, or include `NINEROUTER_KEY` in command output. For a new
image, call `/v1/images/generations`; use `/v1/images/edits` for edits and outpaint.
Do not substitute SVG/HTML/Canvas drawing.
Use a finite client timeout (180 seconds by default) and report only the HTTP
status or a sanitized timeout/network error.

## Operating workflow

First classify the request, then act without asking a follow-up when the user
has supplied enough detail:

| User intent | Route | Required input | Expected result |
|---|---|---|---|
| Create a new image | `/v1/images/generations` | Prompt | New image |
| Change, remove, retouch, or restyle an image | `/v1/images/edits` | Source image plus edit prompt | Edited image |
| Expand image beyond an edge (outpaint) | `/v1/images/edits` | Source image plus direction/extra scene prompt | Larger canvas with the source preserved |
| Combine visual references | `/v1/images/edits` | All reference images plus composition prompt | New combined image |

For an edit or outpaint, use the image the user attached or explicitly named.
Do not silently generate a replacement from text alone. Preserve the parts the
user did not ask to change: subject identity, text, logo, product geometry,
lighting, camera angle, and image style when applicable. For an outpaint, state
the exact direction (left, right, top, bottom, or all sides), what must remain
unaltered, and what should appear in the new area.

Build the prompt in this order: subject and action; composition/crop; required
visible details; visual style and lighting; negative constraints; output ratio.
Keep factual text in the image short and exact. When legible text, brand marks,
or a specific person must be preserved, explicitly say so and flag any unclear
result instead of claiming it is correct.

Choose an output size that matches the intended placement: square for posts,
portrait for stories/posters, landscape for banners/slides. Respect an exact
size or ratio supplied by the user. If no ratio is supplied, choose the most
natural ratio for the requested use and state it in the completion message.

Before the final response, inspect the returned image: verify the requested
edit is visible, the main subject is not cropped unintentionally, text is
readable where required, and no obvious artifacts conflict with the prompt. On
failure, make one focused retry that fixes the observed issue; do not perform
unbounded retries. Save a successful binary response in the workspace
`outputs/` directory with a descriptive filename, retain the original input,
and show the saved image with its full path in the final response.

Treat the output as generated media: never claim it is an authentic photograph,
official brand asset, verified document, or faithful reproduction unless the
user supplied and requested that exact asset.

When an image request needs Gateway access, distinguish the actual failure:
if the environment says network access needs approval or is sandbox-blocked,
ask the user to approve internet access for this request.
Do not tell the user to run Repair for that case and do not call it a DNS error.
Report DNS only when name resolution itself failed in the returned error.
Repair is appropriate only when the installer-managed credential or installed skill/runtime is missing.

For an ordinary user, announce image work and report the saved result in natural
language. Do not show request JSON, API calls, tool/function-call syntax, `<tool_call>` markup, or internal
image-provider parameters in the chat response.

## Discover

```bash
curl $NINEROUTER_URL/v1/models/image | jq '.data[].id'
# Per-model params/options (size enum, quality enum, capabilities like edit)
curl "$NINEROUTER_URL/v1/models/info?id=openai/dall-e-3"
```

## Endpoint

`POST $NINEROUTER_URL/v1/images/generations`

| Field | Required | Notes |
|---|---|---|
| `model` | yes | from `/v1/models/image` |
| `prompt` | yes | image description |
| `n` | no | count (provider-dependent) |
| `size` | no | `1024x1024`, `1792x1024`, ... |
| `quality` | no | `standard` / `hd` (OpenAI) |
| `response_format` | no | `url` (default) or `b64_json` |

Add query `?response_format=binary` to receive raw image bytes (handy for saving file).

## Examples

Save to file (binary):

```bash
curl -X POST "$NINEROUTER_URL/v1/images/generations?response_format=binary" \
  -H "Authorization: Bearer $NINEROUTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini/gemini-3-pro-image-preview","prompt":"watercolor mountains at sunrise","size":"1024x1024"}' \
  --output out.png
```

JS (URL response):

```js
const r = await fetch(`${process.env.NINEROUTER_URL}/v1/images/generations`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${process.env.NINEROUTER_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model: "gemini/gemini-3-pro-image-preview", prompt: "neon city", size: "1024x1024" }),
});
const { data } = await r.json();
console.log(data[0].url || data[0].b64_json.slice(0, 40));
```

## Response shape

JSON (default `response_format=url`):
```json
{ "created": 1735000000, "data": [{ "url": "https://..." }] }
```

`response_format=b64_json`:
```json
{ "created": 1735000000, "data": [{ "b64_json": "iVBORw0KGgo..." }] }
```

Query `?response_format=binary` returns raw image bytes (Content-Type `image/png` or `image/jpeg`).

## Provider quirks

Common fields above work everywhere. These add/override:

| Provider | Extra/changed fields | Notes |
|---|---|---|
| `openai`, `minimax`, `openrouter`, `recraft` | `quality`, `style`, `response_format` | Standard OpenAI shape |
| `gemini` (nano-banana) | — | Only `prompt`; ignores `size`/`n` |
| `codex` (gpt-5.4-image) | `image`, `images[]`, `image_detail`, `output_format`, `background` | SSE stream; **ChatGPT Plus/Pro required** |
| `huggingface` | — | Only `prompt`; returns single image |
| `nanobanana` | `image`, `images[]` (edit mode) | `size` → aspect ratio; async polling |
| `fal-ai` | `image` (img2img) | `n` → `num_images`; `size` → ratio; async |
| `stability-ai` | `style` (preset), `output_format` | `size` → `aspect_ratio` |
| `black-forest-labs` (FLUX) | `image` (ref) | `size` → exact `width`/`height`; async |
| `runwayml` | `image` (ref) | `size` → ratio; async; video models exist |
| `sdwebui`, `comfyui` | — | Localhost noAuth (`:7860` / `:8188`) |
