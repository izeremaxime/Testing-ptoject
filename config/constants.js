export const ROLES = {
  USER: 'user',
  MANAGER: 'manager',
  ADMIN: 'admin',
};

/** Role hierarchy: higher index = more privilege */
export const ROLE_ORDER = [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN];

export const PERMISSIONS = {
  USERS_MANAGE: 'users:manage',
  TODOS_READ_ALL: 'todos:read_all',
  TODOS_MANAGE_ALL: 'todos:manage_all',
  TODOS_ASSIGN: 'todos:assign',
  TODOS_TEAM_ANALYTICS: 'todos:team_analytics',
  TODOS_EXPORT: 'todos:export',
  SYSTEM_ANALYTICS: 'system:analytics',
};

const ALL_PERMS = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ALL_PERMS,
  [ROLES.MANAGER]: [
    PERMISSIONS.TODOS_READ_ALL,
    PERMISSIONS.TODOS_MANAGE_ALL,
    PERMISSIONS.TODOS_ASSIGN,
    PERMISSIONS.TODOS_TEAM_ANALYTICS,
  ],
  [ROLES.USER]: [],
};

export function roleMeetsMinimum(userRole, minimumRole) {
  const u = ROLE_ORDER.indexOf(userRole);
  const m = ROLE_ORDER.indexOf(minimumRole);
  if (u === -1 || m === -1) return false;
  return u >= m;
}

export function hasPermission(role, permission) {
  const list = ROLE_PERMISSIONS[role] || [];
  if (list.includes(permission)) return true;
  return false;
}
