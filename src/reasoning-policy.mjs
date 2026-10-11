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

export function applyReasoningPolicy(payload, principal, format = "responses") {
  const reasoning = payload.reasoning && typeof payload.reasoning === "object" &&
    !Array.isArray(payload.reasoning) ? payload.reasoning : {};
  const requested = format === "chat"
    ? payload.reasoning_effort ?? reasoning.effort ?? payload.output_config?.effort
    : reasoning.effort ?? payload.reasoning_effort ?? payload.output_config?.effort;
  let effort = cappedReasoningEffort(requested, principal);
  const adaptiveClaude = isAdaptiveClaudeModel(payload.model);
  if (adaptiveClaude && ["none", "minimal"].includes(effort)) effort = "low";
  const result = { ...payload };
  if (format === "responses" || payload.reasoning !== undefined) {
    result.reasoning = { ...reasoning, effort };
  }
  if (format === "chat" || payload.reasoning_effort !== undefined || adaptiveClaude) {
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
