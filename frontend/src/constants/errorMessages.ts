export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  SPARE_PART_PENDING: "存在尚未逐项审批的备件，已拒绝复电",
  SPARE_PART_STOCK_INSUFFICIENT: "存在仓库余量不足的备件，已拒绝复电",
  SPARE_PART_USAGE_NOT_FOUND: "备件领用单不存在",
  SPARE_PART_USAGE_STATUS_CONFLICT: "当前领用状态不允许该操作",
  REPAIR_TICKET_NOT_FOUND: "抢修工单不存在"
};
