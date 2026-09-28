import { request } from "./request";
import { mockData } from "../mocks/seedData";
import type { ApprovalResult, SparePartStock, SparePartStockLog, SparePartUsage } from "../types/SparePartUsage";

const endpoint = "/api/spare-part-usage";

export interface ApproveSparePartPayload {
  actual_quantity?: number;
  approved_by?: string;
}

export interface CreateSparePartPayload {
  ticket_id: number;
  part_code: string;
  part_name: string;
  quantity: number;
  warehouse_name: string;
}

export async function listSparePartUsage(ticketId?: number): Promise<SparePartUsage[]> {
  try {
    const query = typeof ticketId === "number" ? `?ticket_id=${ticketId}` : "";
    return await request<SparePartUsage[]>(`${endpoint}/${query}`);
  } catch {
    // Local mock fallback keeps the UI available during offline review.
    const rows = mockData.sparePartUsage as unknown as SparePartUsage[];
    return typeof ticketId === "number" ? rows.filter((row) => row.ticket_id === ticketId) : [...rows];
  }
}

export async function listSparePartStock(): Promise<SparePartStock[]> {
  try {
    return await request<SparePartStock[]>(`${endpoint}/stock`);
  } catch {
    return [...(mockData.sparePartStock as unknown as SparePartStock[])];
  }
}

export async function listSparePartStockLogs(ticketId?: number): Promise<SparePartStockLog[]> {
  try {
    const query = typeof ticketId === "number" ? `?ticket_id=${ticketId}` : "";
    return await request<SparePartStockLog[]>(`${endpoint}/stock-logs${query}`);
  } catch {
    const rows = mockData.sparePartStockLog as unknown as SparePartStockLog[];
    return typeof ticketId === "number" ? rows.filter((row) => row.ticket_id === ticketId) : [...rows];
  }
}

export async function approveSparePartUsage(id: number, payload: ApproveSparePartPayload): Promise<ApprovalResult> {
  return request<ApprovalResult>(`${endpoint}/${id}/approve`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function returnSparePartUsage(id: number): Promise<ApprovalResult> {
  return request<ApprovalResult>(`${endpoint}/${id}/return`, { method: "POST" });
}

export async function saveSparePartUsage(payload: CreateSparePartPayload): Promise<SparePartUsage> {
  return request<SparePartUsage>(endpoint, { method: "POST", body: JSON.stringify(payload) });
}
