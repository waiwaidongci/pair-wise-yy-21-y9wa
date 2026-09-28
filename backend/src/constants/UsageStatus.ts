import type { SparePartUsage } from "../models/SparePartUsage";

export const UsageStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  RETURNED: "RETURNED",
  REJECTED: "REJECTED"
} as const;

export type UsageStatus = (typeof UsageStatus)[keyof typeof UsageStatus];

export const UsageStatusList: string[] = [
  UsageStatus.PENDING,
  UsageStatus.APPROVED,
  UsageStatus.RETURNED,
  UsageStatus.REJECTED
];

export const UsageStatusText: Record<string, string> = {
  [UsageStatus.PENDING]: "待审批",
  [UsageStatus.APPROVED]: "已审批出库",
  [UsageStatus.RETURNED]: "已退回",
  [UsageStatus.REJECTED]: "数量不足"
};

export const formatUsageStatus = (usage: Pick<SparePartUsage, "usage_status">): string =>
  UsageStatusText[usage.usage_status] ?? usage.usage_status;
