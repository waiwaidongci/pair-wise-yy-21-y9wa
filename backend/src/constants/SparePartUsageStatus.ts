export const SparePartUsageStatus = ["PENDING", "APPROVED", "RETURNED", "STOCK_INSUFFICIENT"] as const;
export type SparePartUsageStatus = (typeof SparePartUsageStatus)[number];
