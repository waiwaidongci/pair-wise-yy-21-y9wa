import type { SparePartStock } from "../models/SparePartStock";

export const createSparePartStockDto = (overrides: Partial<SparePartStock> = {}): SparePartStock => ({
  part_code: "SP-001",
  part_name: "低压熔断器",
  warehouse_name: "中心仓库",
  remaining_quantity: 20,
  ...overrides
});
