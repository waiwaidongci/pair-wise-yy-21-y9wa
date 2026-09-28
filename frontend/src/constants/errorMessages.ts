export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  USAGE_NOT_FOUND: "备件领用单不存在",
  USAGE_STATUS_CONFLICT: "当前领用状态不允许该操作",
  PART_STOCK_INSUFFICIENT: "仓库余量不足，无法按实发数量出库",
  TICKET_NOT_FOUND: "抢修工单不存在",
  RESTORE_PENDING_PARTS: "存在未处理备件，复电被拒绝"
} as const;
