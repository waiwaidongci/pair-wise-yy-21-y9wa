export const createSparePartUsageDto = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  ticket_id: 1,
  part_code: "part code 1",
  part_name: "part name 1",
  quantity: 2,
  warehouse_name: "中心仓库",
  approved_by: null,
  usage_status: "PENDING",
  issued_quantity: null,
  ...overrides
});
