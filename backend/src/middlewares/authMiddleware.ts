import type { RequestHandler } from "express";
import { Role } from "../constants/Role";

// Dev JWT shim: the gateway normally decodes a bearer token; here the role is
// forwarded through the x-role header so RBAC still touches every write route.
export const authMiddleware: RequestHandler = (req, _res, next) => {
  (req as any).user = { id: 1, role: req.header("x-role") ?? Role[0] };
  next();
};
