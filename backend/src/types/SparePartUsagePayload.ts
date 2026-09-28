export interface ApproveSparePartUsagePayload {
  actual_quantity?: number;
  approved_by?: string;
}

export interface CreateSparePartUsagePayload {
  ticket_id?: number;
  part_code?: string;
  part_name?: string;
  quantity?: number;
  actual_quantity?: number;
  warehouse_name?: string;
}

export type SparePartUsagePayload = Record<string, unknown>;
