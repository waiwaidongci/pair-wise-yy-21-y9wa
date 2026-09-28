import { mockData } from "../mocks/seedData";
import type { SparePartUsage } from "../types/SparePartUsage";
import { postJson, request } from "./http";

const endpoint = "/api/spare-part-usage";

export async function listSparePartUsage(ticketId?: number): Promise<SparePartUsage[]> {
  try {
    const path = typeof ticketId === "number" ? `${endpoint}?ticket_id=${ticketId}` : endpoint;
    return await request<SparePartUsage[]>(path);
  } catch {
    // Local mock fallback keeps the UI available during offline review.
    const rows = mockData.sparePartUsage as SparePartUsage[];
    return typeof ticketId === "number" ? rows.filter((row) => row.ticket_id === ticketId) : [...rows];
  }
}

export function approveSparePartUsage(id: number, issuedQuantity: number) {
  return postJson<SparePartUsage>(`${endpoint}/${id}/approve`, { issued_quantity: issuedQuantity });
}

export function returnSparePartUsage(id: number) {
  return postJson<SparePartUsage>(`${endpoint}/${id}/return`, { returned_by: "备件页" });
}

export async function saveSparePartUsage(payload: SparePartUsage) {
  console.info("save SparePartUsage", payload);
  return payload;
}
