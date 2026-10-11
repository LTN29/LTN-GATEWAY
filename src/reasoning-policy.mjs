import { isOutsideControlPrincipal } from "./principal-control.mjs";

const EFFORTS = ["none", "minimal", "low", "medium", "high", "xhigh", "max", "ultra"];

export function isAdaptiveClaudeModel(model) {
  return /(?:^|\/)claude-(?:opus|sonnet)-5[.-]5(?:$|[-:(\[])/i.test(String(model || ""));
}

export function cappedReasoningEffort(value, principal) {
  const effort = typeof value === "string" ? value.trim().toLowerCase() : "medium";
  const index = EFFORTS.indexOf(effort);
  if (index < 0) return "medium";
  const maximum = isOutsideControlPrincipal(principal) ? "high" : "medium";
  return index > EFFORTS.indexOf(maximum) ? maximum : effort;
}

function withoutKeys(value, keys) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const result = { ...value };
  for (const key of keys) delete result[key];
  return result;
}

function clearNativeThinkingOverrides(payload) {
  const result = withoutKeys(payload, ["thinking", "thinkingConfig", "enable_thinking", "thinking_budget"]);
  if (result.generationConfig) {
    result.generationConfig = withoutKeys(result.generationConfig, ["thinkingConfig"]);
  }
  if (result.request?.generationConfig) {
    result.request = { ...result.request,
      generationConfig: withoutKeys(result.request.generationConfig, ["thinkingConfig"]) };
  }
  if (result.params) {
    result.params = withoutKeys(result.params, ["thinking", "reasoning_effort"]);
  }
  return result;
}

export function applyReasoningPolicy(payload, principal, format = "responses") {
  const reasoning = payload.reasoning && typeof payload.reasoning === "object" &&
    !Array.isArray(payload.reasoning) ? payload.reasoning : {};
  const requested = format === "chat"
    ? payload.reasoning_effort ?? reasoning.effort ?? payload.output_config?.effort
    : reasoning.effort ?? payload.reasoning_effort ?? payload.output_config?.effort;
  let effort = cappedReasoningEffort(requested, principal);
  const adaptiveClaude = isAdaptiveClaudeModel(payload.model);
  if (adaptiveClaude && ["none", "minimal"].includes(effort)) effort = "low";
  // On OpenAI routes, express intent once; 9Router converts it to provider fields.
  // Native toggles and token budgets otherwise conflict with that intent.
  const result = format === "messages" ? { ...payload } : clearNativeThinkingOverrides(payload);
  if (format === "responses" || payload.reasoning !== undefined) {
    result.reasoning = { ...reasoning, effort };
  }
  if (format !== "messages") {
    result.reasoning_effort = effort;
  }
  // 9Router reads native output_config before OpenAI effort; keep them consistent.
  if (payload.output_config !== undefined || adaptiveClaude || format === "messages") {
    result.output_config = { ...payload.output_config, effort };
  }
  if (adaptiveClaude) {
    result.thinking = {
      type: "adaptive",
      ...(payload.thinking?.display ? { display: payload.thinking.display } : {})
    };
  }
  if (format === "messages") {
    delete result.reasoning;
    delete result.reasoning_effort;
  }
  return result;
}
