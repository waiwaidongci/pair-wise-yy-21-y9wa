import { seed } from "../seed";
import type { SparePartStock } from "../models/SparePartStock";

export const sparePartStockRepository = {
  findAll: (): SparePartStock[] => seed.sparePartStock,
  findOne: (partCode: string, warehouseName: string): SparePartStock | undefined =>
    seed.sparePartStock.find((row) => row.part_code === partCode && row.warehouse_name === warehouseName),
  nextId: (): number => seed.sparePartStock.reduce((max, row) => Math.max(max, row.id), 0) + 1,
  /** 按实发数量扣减仓库余量；返回最新余量。余量不足时返回 null，不产生任何变更。 */
  deduct: (partCode: string, warehouseName: string, quantity: number, at: string): SparePartStock | null => {
    let row = sparePartStockRepository.findOne(partCode, warehouseName);
    if (!row) {
      row = {
        id: sparePartStockRepository.nextId(),
        part_code: partCode,
        part_name: partCode,
        warehouse_name: warehouseName,
        remaining_quantity: 0,
        updated_at: at
      };
      seed.sparePartStock.push(row);
    }
    if (row.remaining_quantity < quantity) return null;
    row.remaining_quantity -= quantity;
    row.updated_at = at;
    return row;
  },
  /** 退回时补回余量。 */
  refund: (partCode: string, warehouseName: string, quantity: number, at: string): SparePartStock => {
    let row = sparePartStockRepository.findOne(partCode, warehouseName);
    if (!row) {
      row = {
        id: sparePartStockRepository.nextId(),
        part_code: partCode,
        part_name: partCode,
        warehouse_name: warehouseName,
        remaining_quantity: 0,
        updated_at: at
      };
      seed.sparePartStock.push(row);
    }
    row.remaining_quantity += quantity;
    row.updated_at = at;
    return row;
  }
};
