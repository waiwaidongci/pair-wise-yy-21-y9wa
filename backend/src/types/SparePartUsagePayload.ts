export interface SparePartUsagePayload {
  ticket_id?: unknown;
  part_code?: unknown;
  part_name?: unknown;
  quantity?: unknown;
  warehouse_name?: unknown;
}

export interface ApproveUsagePayload {
  issued_quantity?: unknown;
  approved_by?: unknown;
}

export interface ReturnUsagePayload {
  returned_by?: unknown;
}
