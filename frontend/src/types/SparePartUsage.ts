export interface SparePartUsage {
  id: number;
  ticket_id: number;
  part_code: string;
  part_name: string;
  quantity: number;
  actual_quantity: number;
  warehouse_name: string;
  approved_by: string;
  usage_status: string;
  created_at: string;
  approved_at: string;
  returned_at: string;
}

export interface SparePartStock {
  id: number;
  part_code: string;
  part_name: string;
  warehouse_name: string;
  remaining_quantity: number;
  updated_at: string;
}

export interface SparePartStockLog {
  id: number;
  part_code: string;
  warehouse_name: string;
  change_quantity: number;
  remaining_quantity: number;
  usage_id: number;
  ticket_id: number;
  action: string;
  created_at: string;
}

export interface ApprovalResult {
  reused: boolean;
  usage: SparePartUsage;
  remaining_quantity: number;
}
