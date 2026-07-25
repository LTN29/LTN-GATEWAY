import { config } from "./config.mjs";
import { sha256 } from "./utils.mjs";
import {
  reserveDailyUsageSlot,
  confirmDailyUsageSlot,
  releaseDailyUsageSlot
} from "./codex-usage-store.mjs";

const VALID_MODES = new Set(["premium_always", "limited_daily", "free_only"]);
const VALID_SCOPES = new Set(["client", "team", "user"]);
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateComboId(comboId, name) {
  const value = String(comboId || "").trim();
  if (!value) {
    const error = new Error(`Thiếu Combo ID ${name}. Admin cần cấu hình Combo trên Gateway hoặc teams.json.`);
    error.statusCode = 500;
    error.type = "gateway_error";
    throw error;
  }
  if (value.length > 200 || /[\r\n]/.test(value) || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(value)) {
    const error = new Error(`Combo ID ${name} không hợp lệ.`);
    error.statusCode = 500;
    error.type = "gateway_error";
    throw error;
  }
  return value;
}

export function validateClientId(value) {
  const clientId = String(value || "").trim();
  if (
    !clientId ||
    clientId.length > 100 ||
    /[\r\n]/.test(clientId) ||
    !UUID_RE.test(clientId)
  ) {
    const error = new Error("X-LTN-Client-ID phải là UUID hợp lệ.");
    error.statusCode = 400;
    error.type = "invalid_request_error";
    throw error;
  }
  return clientId.toLowerCase();
}

function dailyDate(timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function resolveTeamCodexPolicy(team) {
  const raw = team.aiPolicy || {};
  const inheritedMode = raw.mode && raw.mode !== "inherit"
    ? raw.mode
    : config.codexDefaultPolicy;
  const mode = VALID_MODES.has(inheritedMode)
    ? inheritedMode
    : "limited_daily";
  const usageScope = VALID_SCOPES.has(raw.usageScope)
    ? raw.usageScope
    : "client";

  const premiumLimit =
    raw.premiumLimit !== undefined && raw.premiumLimit !== null
      ? raw.premiumLimit
      : config.codexDefaultPremiumLimit;

  const policy = {
    mode,
    usageScope,
    premiumLimit,
    resetTimezone: config.codexUsageTimezone,
    combos: {
      premium: raw.premiumCombo || config.codexCombos.premium,
      free: raw.freeCombo || config.codexCombos.free
    }
  };

  if (mode === "premium_always") {
    policy.combos.premium = validateComboId(policy.combos.premium, "premium");
  } else if (mode === "free_only") {
    policy.combos.free = validateComboId(policy.combos.free, "free");
  } else {
    policy.combos.premium = validateComboId(policy.combos.premium, "premium");
    policy.combos.free = validateComboId(policy.combos.free, "free");
  }

  return policy;
}

export function resolvePrincipalCodexPolicy(principal) {
  if (!principal || principal.principalType === "team") {
    return resolveTeamCodexPolicy(principal?.team || principal);
  }

  const userPolicy = principal.aiPolicy || {};
  if (userPolicy.mode && userPolicy.mode !== "inherit") {
    const syntheticTeam = {
      ...principal.team,
      aiPolicy: {
        ...userPolicy,
        usageScope: userPolicy.usageScope || "user"
      }
    };
    return resolveTeamCodexPolicy(syntheticTeam);
  }

  const policy = resolveTeamCodexPolicy(principal.team);
  if (policy.mode === "limited_daily" && !policy.usageScope) {
    policy.usageScope = "user";
  }
  if (policy.mode === "limited_daily" && policy.usageScope === "client") {
    policy.usageScope = "user";
  }
  return policy;
}

export function codexConfigForTeam(team) {
  const policy = resolveTeamCodexPolicy(team);
  const routing = {
    mode: policy.mode
  };

  if (policy.mode === "limited_daily") {
    routing.premiumLimit = policy.premiumLimit;
    routing.usageScope = policy.usageScope;
    routing.resetTimezone = policy.resetTimezone;
  }

  const combos = {};
  if (policy.combos.premium) combos.premium = policy.combos.premium;
  if (policy.combos.free) combos.free = policy.combos.free;

  return {
    team: team.code,
    routing,
    combos
  };
}

export function codexConfigForPrincipal(principal) {
  const teamConfig = codexConfigForTeam(principal.team || principal);
  if (!principal || principal.principalType === "team") return teamConfig;
  const policy = resolvePrincipalCodexPolicy(principal);
  return {
    ...teamConfig,
    principalType: "user",
    userId: principal.userId,
    displayName: principal.displayName,
    teamId: principal.teamId,
    teamDisplayName: principal.team.displayName,
    role: principal.role,
    routing: {
      ...teamConfig.routing,
      mode: policy.mode,
      ...(policy.mode === "limited_daily" ? {
        premiumLimit: policy.premiumLimit,
        usageScope: policy.usageScope,
        resetTimezone: policy.resetTimezone
      } : {})
    }
  };
}

export async function selectCodexRoute({ team, principal, headers }) {
  const activePrincipal = principal || { principalType: "team", team, teamId: team.code };
  const activeTeam = activePrincipal.team || team;
  const policy = principal ? resolvePrincipalCodexPolicy(activePrincipal) : resolveTeamCodexPolicy(team);
  if (policy.mode === "premium_always") {
    return {
      routeTier: "premium",
      requestNumber: null,
      limit: null,
      selectedCombo: policy.combos.premium,
      premiumRemaining: null,
      clientIdHashPrefix: null,
      confirm: async () => {},
      release: async () => {}
    };
  }

  if (policy.mode === "free_only") {
    return {
      routeTier: "free",
      requestNumber: null,
      limit: null,
      selectedCombo: policy.combos.free,
      premiumRemaining: 0,
      clientIdHashPrefix: null,
      confirm: async () => {},
      release: async () => {}
    };
  }

  const clientId = policy.usageScope === "client" || activePrincipal.principalType === "user"
    ? validateClientId(headers["x-ltn-client-id"])
    : "";
  const clientIdHash = clientId ? sha256(clientId) : "";
  const usageDate = dailyDate(policy.resetTimezone);
  const reservation = await reserveDailyUsageSlot({
    teamCode: activeTeam.code,
    principalType: activePrincipal.principalType || "team",
    userId: activePrincipal.userId || null,
    clientIdHash,
    usageDate,
    usageScope: policy.usageScope,
    premiumLimit: policy.premiumLimit
  });
  const selectedCombo = reservation.routeTier === "premium"
    ? policy.combos.premium
    : policy.combos.free;

  return {
    routeTier: reservation.routeTier,
    requestNumber: reservation.requestNumber,
    limit: policy.premiumLimit,
    selectedCombo,
    premiumRemaining: Math.max(
      0,
      policy.premiumLimit - reservation.requestNumber
    ),
    clientIdHashPrefix: clientIdHash ? clientIdHash.slice(0, 12) : null,
    confirm: () => confirmDailyUsageSlot(
      reservation.key,
      reservation.reservationId
    ),
    release: () => releaseDailyUsageSlot(
      reservation.key,
      reservation.reservationId
    )
  };
}
