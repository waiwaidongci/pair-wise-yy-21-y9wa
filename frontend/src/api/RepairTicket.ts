import { request } from "./request";
import { mockData } from "../mocks/seedData";
import type { RepairTicket } from "../types/RepairTicket";

const endpoint = "/api/repair-ticket";

export async function listRepairTicket(): Promise<RepairTicket[]> {
  try {
    return await request<RepairTicket[]>(endpoint);
  } catch {
    // Local mock fallback keeps the UI available during offline review.
    return [...(mockData.repairTicket as unknown as RepairTicket[])];
  }
}

export async function saveRepairTicket(payload: Partial<RepairTicket>) {
  return request<RepairTicket>(endpoint, { method: "POST", body: JSON.stringify(payload) });
}

export interface RestorePowerResult {
  ticket_id: number;
  status: string;
  restored_at: string;
}

export async function restoreRepairTicket(id: number): Promise<RestorePowerResult> {
  return request<RestorePowerResult>(`${endpoint}/${id}/restore`, { method: "POST" });
}
