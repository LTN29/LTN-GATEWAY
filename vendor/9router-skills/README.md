# Vendored 9Router skills

Source: <https://github.com/decolua/9router/tree/master/skills>

These skill definitions were fetched from the upstream `master` branch on
2026-07-31 and are distributed by the SIMI Codex installer. SIMI-specific setup
notes route capability calls through `https://ai.simi.vn` so employee devices do
not access the admin-only `router.simi.vn` endpoint directly. The signed-in
browser skill uses a local Chrome extension and forwards only visible page text
through the authenticated LTN Gateway. The managed `ltn-9router` wrapper keeps
web search/fetch network access on the same authenticated route, while the PDF
skill uses a local Python runtime for file extraction.

Refresh these files deliberately with the Codex skill installer, review the
diff, run the installer and capability-proxy tests, then deploy the Gateway.
