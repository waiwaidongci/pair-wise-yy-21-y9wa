import type { UsageStatus } from "../types/UsageStatus";

export const USAGE_STATUS_LIST: UsageStatus[] = ["PENDING", "APPROVED", "RETURNED", "REJECTED"];

export const UsageStatusText: Record<UsageStatus, string> = {
  PENDING: "待审批",
  APPROVED: "已审批出库",
  RETURNED: "已退回",
  REJECTED: "数量不足"
};

export const usageStatusClass: Record<UsageStatus, string> = {
  PENDING: "badge-warn",
  APPROVED: "badge-ok",
  RETURNED: "badge-muted",
  REJECTED: "badge-danger"
};

export const formatUsageStatusText = (status: string): string =>
  UsageStatusText[status as UsageStatus] ?? status;
