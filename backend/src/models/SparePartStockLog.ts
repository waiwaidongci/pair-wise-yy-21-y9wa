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
