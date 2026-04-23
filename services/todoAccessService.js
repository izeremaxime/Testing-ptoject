import { ROLES, hasPermission, PERMISSIONS } from '../config/constants.js';

/**
 * MongoDB filter for todos the acting user may see.
 */
export function buildListFilter(user) {
  if (user.role === ROLES.ADMIN || hasPermission(user.role, PERMISSIONS.TODOS_READ_ALL)) {
    return {};
  }
  const uid = user._id;
  return {
    $or: [{ createdBy: uid }, { assignedTo: uid }],
  };
}

export function canAccessTodo(user, todo) {
  if (user.role === ROLES.ADMIN || hasPermission(user.role, PERMISSIONS.TODOS_MANAGE_ALL)) {
    return true;
  }
  const uid = user._id.toString();
  const created = todo.createdBy?.toString?.() || String(todo.createdBy);
  const assigned = todo.assignedTo?.toString?.() || (todo.assignedTo ? String(todo.assignedTo) : null);
  return created === uid || assigned === uid;
}

export function canAssignTodo(user) {
  return user.role === ROLES.ADMIN || hasPermission(user.role, PERMISSIONS.TODOS_ASSIGN);
}
