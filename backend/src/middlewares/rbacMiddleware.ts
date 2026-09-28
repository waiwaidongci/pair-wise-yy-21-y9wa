import type { RequestHandler } from "express";
import { HttpError } from "../utils/httpError";

export const rbacMiddleware =
  (roles: string[] = []): RequestHandler =>
  (req, _res, next) => {
    if (roles.length === 0) return next();
    const role = String((req as any).user?.role ?? "");
    if (!roles.includes(role)) {
      return next(new HttpError("RBAC_DENIED", 403, { required_roles: roles, current_role: role }));
    }
    next();
  };
