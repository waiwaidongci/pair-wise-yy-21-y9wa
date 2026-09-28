import type { SparePartUsage } from "../types/SparePartUsage";

export const createDefaultSparePartUsage = (overrides: Partial<SparePartUsage> = {}): SparePartUsage => ({
  id: 1 as never,
  ticket_id: 1 as never,
  part_code: "DLQ-10kV-001" as never,
  part_name: "10kV柱上断路器" as never,
  quantity: 2 as never,
  actual_quantity: 0 as never,
  warehouse_name: "中心仓库" as never,
  approved_by: "" as never,
  usage_status: "PENDING" as never,
  created_at: "2026-09-28T06:10:00Z" as never,
  approved_at: "" as never,
  returned_at: "" as never,
  ...overrides
});

export const createSparePartUsageForm = (ticketId: number): SparePartUsage =>
  createDefaultSparePartUsage({ id: 0 as never, ticket_id: ticketId, part_code: "", part_name: "", quantity: 1 });

export const createSparePartUsageResponse = createDefaultSparePartUsage;
