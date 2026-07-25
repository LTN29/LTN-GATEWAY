export const ROLES = new Set(["SUPER_ADMIN", "IT_ADMIN", "TEAM_MANAGER", "MANAGEMENT", "AUDITOR"]);

const PERMISSIONS = {
  "dashboard:read": ["SUPER_ADMIN", "IT_ADMIN", "TEAM_MANAGER", "MANAGEMENT", "AUDITOR"],
  "users:read": ["SUPER_ADMIN", "IT_ADMIN", "TEAM_MANAGER", "AUDITOR"],
  "users:write": ["SUPER_ADMIN", "IT_ADMIN"],
  "users:key": ["SUPER_ADMIN", "IT_ADMIN"],
  "teams:read": ["SUPER_ADMIN", "IT_ADMIN", "TEAM_MANAGER", "MANAGEMENT", "AUDITOR"],
  "teams:write": ["SUPER_ADMIN", "IT_ADMIN"],
  "usage:read": ["SUPER_ADMIN", "IT_ADMIN", "TEAM_MANAGER", "MANAGEMENT", "AUDITOR"],
  "memory:read": ["SUPER_ADMIN", "IT_ADMIN", "TEAM_MANAGER", "MANAGEMENT", "AUDITOR"],
  "memory:approve_team": ["SUPER_ADMIN", "IT_ADMIN", "TEAM_MANAGER"],
  "memory:approve_company": ["SUPER_ADMIN", "MANAGEMENT"],
  "memory:rollback": ["SUPER_ADMIN", "IT_ADMIN"],
  "sync:read": ["SUPER_ADMIN", "IT_ADMIN", "AUDITOR"],
  "sync:write": ["SUPER_ADMIN", "IT_ADMIN"],
  "system:read": ["SUPER_ADMIN", "IT_ADMIN", "AUDITOR"],
  "audit:read": ["SUPER_ADMIN", "IT_ADMIN", "AUDITOR"]
};

export function normalizeAdminConfig(email, item) {
  const roles = Array.isArray(item?.roles) ? item.roles.map((role) => String(role).trim().toUpperCase()) : [];
  for (const role of roles) {
    if (!ROLES.has(role)) throw new Error(`Role không hợp lệ cho admin ${email}: ${role}`);
  }
  return {
    email: String(email || "").trim().toLowerCase(),
    displayName: String(item?.displayName || email),
    enabled: item?.enabled !== false,
    roles,
    teamIds: Array.isArray(item?.teamIds)
      ? item.teamIds.map((teamId) => String(teamId).trim().toUpperCase()).filter(Boolean)
      : []
  };
}

export function hasRole(admin, role) {
  return admin?.roles?.includes("SUPER_ADMIN") || admin?.roles?.includes(role);
}

export function can(admin, permission, { teamId = null, scope = null } = {}) {
  if (!admin?.enabled) return false;
  if (admin.roles.includes("SUPER_ADMIN")) return true;
  const allowedRoles = PERMISSIONS[permission] || [];
  if (!admin.roles.some((role) => allowedRoles.includes(role))) return false;
  if (admin.roles.includes("AUDITOR") && permission.split(":")[1] !== "read") return false;
  if (admin.roles.includes("TEAM_MANAGER")) {
    if (scope === "COMPANY") return false;
    if (teamId && !admin.teamIds.includes(String(teamId).toUpperCase())) return false;
  }
  return true;
}

export function requirePermission(admin, permission, context = {}) {
  if (!can(admin, permission, context)) {
    throw Object.assign(new Error("Bạn không có quyền thực hiện thao tác này."), {
      statusCode: 403,
      code: "FORBIDDEN"
    });
  }
}

export function visibleTeamIds(admin) {
  if (!admin || admin.roles.includes("SUPER_ADMIN") || admin.roles.includes("IT_ADMIN") || admin.roles.includes("MANAGEMENT") || admin.roles.includes("AUDITOR")) {
    return null;
  }
  return admin.teamIds || [];
}
