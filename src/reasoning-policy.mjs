import { isOutsideControlPrincipal } from "./principal-control.mjs";

const EFFORTS = ["none", "minimal", "low", "medium", "high", "xhigh", "max", "ultra"];

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
    ? payload.reasoning_effort ?? reasoning.effort
    : reasoning.effort ?? payload.reasoning_effort;
  const effort = cappedReasoningEffort(requested, principal);
  const result = { ...payload };
  if (format === "responses" || payload.reasoning !== undefined) {
    result.reasoning = { ...reasoning, effort };
  }
  if (format === "chat" || payload.reasoning_effort !== undefined) {
    result.reasoning_effort = effort;
  }
  return result;
}
