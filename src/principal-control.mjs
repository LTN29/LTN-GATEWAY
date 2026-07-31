const OUTSIDE_CONTROL_ROLES = new Set(["IT", "IT_ADMIN"]);

function normalized(value) {
  return String(value || "").trim().toUpperCase();
}

/**
 * IT administrators still authenticate and use the configured AI route, but
 * their prompts and responses are excluded from memory and user analytics.
 *
 * The team check is the primary production rule. Role aliases keep older user
 * records safe when IT was stored in the free-text role field instead.
 */
export function isOutsideControlPrincipal(principal) {
  const teamId = normalized(principal.teamId || principal.team?.code);
  if (teamId === "IT") return true;
  if (principal?.principalType !== "user") return false;
  const role = normalized(principal.role);
  return OUTSIDE_CONTROL_ROLES.has(role);
}
