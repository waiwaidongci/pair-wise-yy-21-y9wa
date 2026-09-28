export const SparePartUsageStatus = ["PENDING", "APPROVED", "RETURNED", "STOCK_INSUFFICIENT"] as const;
export type SparePartUsageStatus = (typeof SparePartUsageStatus)[number];

export const SparePartUsageStatusText: Record<SparePartUsageStatus, string> = {
  PENDING: "待审批",
  APPROVED: "已通过",
  RETURNED: "已退回",
  STOCK_INSUFFICIENT: "数量不足"
};
