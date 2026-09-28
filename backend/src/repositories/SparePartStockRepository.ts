import { seed } from "../seed";
import type { SparePartStock } from "../models/SparePartStock";

// In-memory warehouse stock table.
const rows: SparePartStock[] = seed.sparePartStock.map((row) => ({ ...row }));

export const sparePartStockRepository = {
  findAll: (): SparePartStock[] => rows,
  findByPartCode: (partCode: string): SparePartStock | undefined => rows.find((row) => row.part_code === partCode)
};
