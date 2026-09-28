import type { RepairTicket } from "../types/RepairTicket";
import { postJson, request } from "./http";
import { mockData } from "../mocks/seedData";

const endpoint = "/api/repair-ticket";

export interface RestoreResult {
  ticket: RepairTicket;
  blocked: boolean;
  pendingApprovalCodes: string[];
  insufficientCodes: string[];
}

export async function listRepairTicket(): Promise<RepairTicket[]> {
  try {
    return await request<RepairTicket[]>(endpoint);
  } catch {
    return [...(mockData.repairTicket as RepairTicket[])];
  }
}

export function restoreRepairTicket(id: number) {
  return postJson<RestoreResult>(`${endpoint}/${id}/restore`, { restored_by: "班组长" });
}

export async function saveRepairTicket(payload: RepairTicket) {
  console.info("save RepairTicket", payload);
  return payload;
}
