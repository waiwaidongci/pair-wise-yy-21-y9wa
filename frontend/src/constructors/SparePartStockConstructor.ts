import type { SparePartStock } from "../types/SparePartStock";

export const createDefaultSparePartStock = (overrides: Partial<SparePartStock> = {}): SparePartStock => ({
  part_code: "SP-001",
  part_name: "低压熔断器",
  warehouse_name: "中心仓库",
  remaining_quantity: 0,
  ...overrides
});
