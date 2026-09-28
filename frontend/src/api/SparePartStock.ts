import { mockData } from "../mocks/seedData";
import type { SparePartStock } from "../types/SparePartStock";
import { request } from "./http";

const endpoint = "/api/spare-part-stock";

export async function listSparePartStock(): Promise<SparePartStock[]> {
  try {
    return await request<SparePartStock[]>(endpoint);
  } catch {
    return [...(mockData.sparePartStock as SparePartStock[])];
  }
}
