import { sparePartStockRepository } from "../repositories/SparePartStockRepository";
import { serviceError } from "../utils/httpError";
import { auditLog } from "../utils/auditLog";

export const sparePartStockService = {
  list: () => sparePartStockRepository.findAll(),

  // Deduct warehouse remaining quantity by the issued quantity of an approved usage.
  deduct: (partCode: string, issuedQuantity: number, usageId: number) => {
    const stock = sparePartStockRepository.findByPartCode(partCode);
    if (!stock || stock.remaining_quantity < issuedQuantity) {
      throw serviceError("PART_STOCK_INSUFFICIENT", 409, {
        part_code: partCode,
        remaining_quantity: stock?.remaining_quantity ?? 0,
        issued_quantity: issuedQuantity
      });
    }
    stock.remaining_quantity -= issuedQuantity;
    auditLog.stockDeduct(partCode, { usage_id: usageId, issued_quantity: issuedQuantity, remaining_quantity: stock.remaining_quantity });
    return stock;
  },

  // Refund the issued quantity back to the warehouse after a usage is returned.
  refund: (partCode: string, issuedQuantity: number, usageId: number) => {
    const stock = sparePartStockRepository.findByPartCode(partCode);
    if (!stock) {
      throw serviceError("USAGE_NOT_FOUND", 404, { part_code: partCode });
    }
    stock.remaining_quantity += issuedQuantity;
    auditLog.stockRefund(partCode, { usage_id: usageId, refunded_quantity: issuedQuantity, remaining_quantity: stock.remaining_quantity });
    return stock;
  }
};
