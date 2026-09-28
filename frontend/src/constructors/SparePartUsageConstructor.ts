import type { SparePartUsage } from "../types/SparePartUsage";

export const createDefaultSparePartUsage = (overrides: Partial<SparePartUsage> = {}): SparePartUsage => ({
  id: 1,
  ticket_id: 1,
  part_code: "SP-001",
  part_name: "低压熔断器",
  quantity: 1,
  warehouse_name: "中心仓库",
  approved_by: null,
  usage_status: "PENDING",
  issued_quantity: null,
  ...overrides
});

export const createSparePartUsageForm = createDefaultSparePartUsage;
export const createSparePartUsageResponse = createDefaultSparePartUsage;
