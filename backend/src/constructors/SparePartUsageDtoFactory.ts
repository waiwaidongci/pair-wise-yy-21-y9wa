export const createSparePartUsageDto = (overrides = {}) => ({
  id: 1,
  ticket_id: 1,
  part_code: "DLQ-10kV-001",
  part_name: "10kV柱上断路器",
  quantity: 2,
  actual_quantity: 2,
  warehouse_name: "中心仓库",
  approved_by: "",
  usage_status: "PENDING",
  created_at: "2026-09-28T06:10:00Z",
  approved_at: "",
  returned_at: "",
  ...overrides
});

export const createSparePartStockDto = (overrides = {}) => ({
  id: 1,
  part_code: "DLQ-10kV-001",
  part_name: "10kV柱上断路器",
  warehouse_name: "中心仓库",
  remaining_quantity: 2,
  updated_at: "2026-09-28T08:00:00Z",
  ...overrides
});
