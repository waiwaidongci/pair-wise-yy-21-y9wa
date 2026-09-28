export const UsageStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  RETURNED: "RETURNED",
  REJECTED: "REJECTED"
} as const;

export type UsageStatus = (typeof UsageStatus)[keyof typeof UsageStatus];
