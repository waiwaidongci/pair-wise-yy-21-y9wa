import type { ErrorRequestHandler } from "express";

// Last-resort wrapper; services and controllers already attach their own codes.
export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) =>
  res.status(err.status ?? 500).json({
    code: err.code ?? "INTERNAL_ERROR",
    message: err.message,
    ...(err.detail !== undefined ? { detail: err.detail } : {})
  });
