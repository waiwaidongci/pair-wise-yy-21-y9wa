import type { RequestHandler } from "express";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { BusinessError } from "../utils/AppError";

// authMiddleware 注入的角色；admin 为超级角色，兼容本地联调。
export const rbacMiddleware = (roles: string[] = []): RequestHandler => (req, res, next) => {
  const role = String((req as { user?: { role?: string } }).user?.role ?? "admin");
  if (roles.length === 0 || role === "admin" || roles.includes(role)) {
    next();
    return;
  }
  next(new BusinessError(ERROR_CODES.RBAC_DENIED, ERROR_MESSAGES.RBAC_DENIED, 403, { required_roles: roles, role }));
};
