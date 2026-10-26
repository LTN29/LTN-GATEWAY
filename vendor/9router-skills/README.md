# Vendored 9Router skills

Source: <https://github.com/decolua/9router/tree/master/skills>

These skill definitions were fetched from the upstream `master` branch on
2026-07-31 and are distributed by the SIMI Codex installer. SIMI-specific setup
notes route capability calls through `https://ai.simi.vn` so employee devices do
not access the admin-only `router.simi.vn` endpoint directly. The signed-in
browser skill uses read-only local Chrome DevTools Protocol via MCP in a
dedicated signed-in profile; it requires no extension. Local Word/Excel/PDF
work uses the managed Python document tools without uploading files. The managed `ltn-9router` wrapper keeps
web search/fetch network access on the same authenticated route, while the PDF
skill uses a local Python runtime for file extraction.

Refresh these files deliberately with the Codex skill installer, review the
diff, run the installer and capability-proxy tests, then deploy the Gateway.

Skill instructions describe conditional capabilities, not new permissions.
Capability APIs (web/media/vector) are open to every account, including
Combo-member accounts; only conversation APIs are limited to Combo members.
If the Gateway returns 403, report that the feature is not enabled for the
account and stop instead of bypassing Gateway access checks.

`muse-tao-anh` is a SIMI-authored skill (not from upstream). It uses the
managed `ltn-muse` wrapper and `scripts/muse-image.py`, calling the Muse
model through the conversation API, so the model must be in the account's Combo.

`simi-cap-nhat` is a SIMI-authored skill. It runs the official full installer
from `https://ai.simi.vn` in non-interactive Update mode (same as menu option 5),
reusing the stored key, so users can update from chat without a terminal.
