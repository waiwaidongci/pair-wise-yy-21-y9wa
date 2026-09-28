export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  USAGE_NOT_FOUND: "spare part usage not found",
  USAGE_STATUS_CONFLICT: "spare part usage status does not allow this action",
  PART_STOCK_INSUFFICIENT: "warehouse remaining quantity is lower than issued quantity",
  TICKET_NOT_FOUND: "repair ticket not found",
  RESTORE_PENDING_PARTS: "ticket has unresolved spare part usages, restoration rejected",
  SERVICE_ERROR: "service invocation failed",
  CONTROLLER_ERROR: "controller invocation failed"
};
