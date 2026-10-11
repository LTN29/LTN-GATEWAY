import { config } from "./config.mjs";
import { resolvePrincipalCodexPolicy } from "./codex-routing.mjs";
import { upstreamFetch } from "./upstream.mjs";

function unavailable(message) {
  return Object.assign(new Error(message), { statusCode: 503, type: "gateway_error" });
}

export function memberSelectionEnabled(principal) {
  if (config.codexModelSelection === "combo_members") return true;
  // Avoid resolving legacy routing defaults for capability-only accounts.
  const user = principal.principalType === "user" ? principal.aiPolicy : null;
  return (user?.modelSelection ?? principal.team?.aiPolicy?.modelSelection ??
    config.codexModelSelection) === "combo_members";
}

export function comboIdsForPolicy(policy) {
  if (policy.mode === "premium_always") return [policy.combos.premium];
  if (policy.mode === "free_only") return [policy.combos.free];
  if (policy.mode === "test_only") return [policy.combos.test];
  return [...new Set([policy.combos.premium, policy.combos.free])];
}

export function membersOfCombos(payload, names) {
  if (!Array.isArray(payload?.combos)) throw unavailable("9Router không trả danh sách Combo hợp lệ.");
  const members = [];
  for (const name of names) {
    const matches = payload.combos.filter((combo) => combo.name === name);
    if (matches.length !== 1 || !Array.isArray(matches[0].models) || !matches[0].models.length) {
      throw unavailable(`Combo '${name}' không tồn tại hoặc không có model.`);
    }
    for (const model of matches[0].models) {
      if (typeof model !== "string" || !model.trim() || model !== model.trim() ||
          model.length > 200 || /[\x00-\x1f\x7f]/.test(model)) {
        throw unavailable(`Combo '${name}' chứa ID model không hợp lệ.`);
      }
      // Do not expand nested combos: this list is a direct-model allowlist.
      if (payload.combos.some((combo) => combo.name === model)) {
        throw unavailable(`Combo '${name}' chứa Combo lồng nhau; hãy dùng ID model trực tiếp.`);
      }
      members.push(model);
    }
  }
  return [...new Set(members)];
}

export async function allowedComboModels(principal, requestId, comboIds) {
  const names = comboIds || comboIdsForPolicy(resolvePrincipalCodexPolicy(principal));
  let response;
  try {
    response = await fetch(`${config.upstreamBaseUrl}/api/combos`, {
      headers: config.routerDashboardCookie ? { cookie: config.routerDashboardCookie } : {},
      signal: AbortSignal.timeout(5000),
      redirect: "manual"
    });
    if (!response.ok) throw new Error();
    return membersOfCombos(await response.json(), names);
  } catch (error) {
    if (error.statusCode) throw error;
    throw unavailable("Không đọc được Combo từ 9Router. Admin cần kiểm tra kết nối và phiên dashboard của Gateway.");
  }
}

export async function assertComboModelAllowed(principal, model, requestId, comboIds) {
  const allowed = await allowedComboModels(principal, requestId, comboIds);
  if (!allowed.includes(model)) {
    throw Object.assign(new Error("Model không thuộc Combo được cấp cho tài khoản hoặc đã hết lượt Premium."), {
      statusCode: 403, type: "permission_error"
    });
  }
}

export function codexModelEntry(model, priority = 0) {
  // Advertise only capabilities provided by the upstream; no guessed effort levels.
  const levels = Array.isArray(model.supported_reasoning_levels) ? model.supported_reasoning_levels : [];
  return {
    slug: model.id,
    display_name: model.display_name || model.id,
    description: model.description || "Model thuộc Combo được cấp",
    default_reasoning_level: model.default_reasoning_level || levels[0]?.effort || null,
    supported_reasoning_levels: levels,
    shell_type: "local",
    visibility: "list",
    supported_in_api: true,
    priority,
    availability_nux: null,
    upgrade: null,
    base_instructions: "You are a coding assistant. Follow the user's instructions and use the available tools to complete the task.",
    support_verbosity: false,
    default_verbosity: null,
    apply_patch_tool_type: null,
    truncation_policy: { mode: "bytes", limit: 10000 },
    context_window: Number.isInteger(model.context_window) && model.context_window > 0 ? model.context_window : null,
    experimental_supported_tools: [],
    input_modalities: ["text"]
  };
}

export async function comboModelList(principal, rawKey, requestId) {
  const allowed = await allowedComboModels(principal, requestId);
  const response = await upstreamFetch("/v1/models", { rawKey, requestId });
  if (!response.ok) throw unavailable("Không đọc được danh sách model từ 9Router.");
  const payload = await response.json();
  if (!Array.isArray(payload.data)) throw unavailable("Danh sách model từ 9Router không hợp lệ.");
  // Missing members are excluded, never replaced with an unrestricted model list.
  const data = allowed.flatMap((id) => {
    const item = payload.data.find((model) => model.id === id && model.owned_by !== "combo");
    return item ? [item] : [];
  });
  if (!data.length) throw unavailable("Combo được cấp không có model khả dụng trong /v1/models.");
  return { object: "list", data, models: data.map(codexModelEntry) };
}
