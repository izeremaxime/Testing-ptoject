import { AppError } from '../utils/AppError.js';
import { hasPermission, roleMeetsMinimum, ROLES } from '../config/constants.js';

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) throw AppError.unauthorized();
      if (!allowedRoles.includes(req.user.role)) {
        throw AppError.forbidden('Insufficient role');
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}

export function requireMinimumRole(minimumRole) {
  return (req, res, next) => {
    try {
      if (!req.user) throw AppError.unauthorized();
      if (!roleMeetsMinimum(req.user.role, minimumRole)) {
        throw AppError.forbidden('Insufficient role level');
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}

export function requirePermission(permission) {
  return (req, res, next) => {
    try {
      if (!req.user) throw AppError.unauthorized();
      if (req.user.role === ROLES.ADMIN || hasPermission(req.user.role, permission)) {
        return next();
      }
      throw AppError.forbidden('Missing permission');
    } catch (e) {
      next(e);
    }
  };
}
