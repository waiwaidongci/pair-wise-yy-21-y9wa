import { sparePartUsageRepository } from "../repositories/SparePartUsageRepository";
import { sparePartStockService } from "./SparePartStockService";
import { createSparePartUsageDto } from "../constructors/SparePartUsageDtoFactory";
import { serviceError } from "../utils/httpError";
import { auditLog } from "../utils/auditLog";
import type { ApproveUsagePayload, SparePartUsagePayload } from "../types/SparePartUsagePayload";
import type { SparePartUsage } from "../models/SparePartUsage";

const toPositiveInt = (value: unknown, field: string): number => {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    throw serviceError("VALIDATION_FAILED", 400, { field, value });
  }
  return num;
};

export const sparePartUsageService = {
  list: () => sparePartUsageRepository.findAll(),
  listByTicket: (ticketId: number) => sparePartUsageRepository.findByTicketId(ticketId),

  create: (payload: SparePartUsagePayload): SparePartUsage => {
    const ticketId = toPositiveInt(payload.ticket_id, "ticket_id");
    const quantity = toPositiveInt(payload.quantity, "quantity");
    const partCode = String(payload.part_code ?? "");
    if (!partCode) throw serviceError("VALIDATION_FAILED", 400, { field: "part_code" });
    const row = createSparePartUsageDto({
      id: sparePartUsageRepository.nextId(),
      ticket_id: ticketId,
      part_code: partCode,
      part_name: String(payload.part_name ?? ""),
      quantity,
      warehouse_name: String(payload.warehouse_name ?? "中心仓库")
    }) as SparePartUsage;
    return sparePartUsageRepository.save(row);
  },

  // Item-by-item approval: deduct warehouse stock by the issued quantity.
  // Re-submitting the same usage keeps the first result (no second deduction).
  approve: (id: number, payload: ApproveUsagePayload = {}): SparePartUsage => {
    const usage = sparePartUsageRepository.findById(id);
    if (!usage) throw serviceError("USAGE_NOT_FOUND", 404, { usage_id: id });

    if (usage.usage_status === "APPROVED") {
      // Idempotent replay of the first successful result.
      return usage;
    }
    if (usage.usage_status === "RETURNED") {
      throw serviceError("USAGE_STATUS_CONFLICT", 409, { usage_id: id, usage_status: usage.usage_status });
    }
    if (usage.usage_status === "STOCK_INSUFFICIENT") {
      // The first submission failed against stock; a repeat submission keeps that result.
      const stock = sparePartStockService.list().find((row) => row.part_code === usage.part_code);
      throw serviceError("PART_STOCK_INSUFFICIENT", 409, {
        usage_id: id,
        part_code: usage.part_code,
        required_quantity: usage.issued_quantity,
        remaining_quantity: stock?.remaining_quantity ?? 0,
        reused_first_result: true
      });
    }

    const issuedQuantity = toPositiveInt(payload.issued_quantity ?? usage.quantity, "issued_quantity");
    usage.issued_quantity = issuedQuantity;
    usage.approved_by = String(payload.approved_by ?? "仓管");

    try {
      sparePartStockService.deduct(usage.part_code, issuedQuantity, usage.id);
    } catch (error) {
      // First result of this usage is "stock insufficient"; persist it for later replays.
      usage.usage_status = "STOCK_INSUFFICIENT";
      sparePartUsageRepository.save(usage);
      auditLog.sparePartApprove(usage.id, { ticket_id: usage.ticket_id, part_code: usage.part_code, result: "STOCK_INSUFFICIENT" });
      throw error;
    }

    usage.usage_status = "APPROVED";
    sparePartUsageRepository.save(usage);
    auditLog.sparePartApprove(usage.id, {
      ticket_id: usage.ticket_id,
      part_code: usage.part_code,
      issued_quantity: issuedQuantity
    });
    return usage;
  },

  // Return a usage: refund issued quantity to the warehouse. Pending/insufficient rows are cancelled.
  return: (id: number, payload: { returned_by?: unknown } = {}): SparePartUsage => {
    const usage = sparePartUsageRepository.findById(id);
    if (!usage) throw serviceError("USAGE_NOT_FOUND", 404, { usage_id: id });

    if (usage.usage_status === "RETURNED") {
      // Idempotent replay: never refund twice.
      return usage;
    }

    if (usage.usage_status === "APPROVED" && typeof usage.issued_quantity === "number") {
      sparePartStockService.refund(usage.part_code, usage.issued_quantity, usage.id);
    }
    usage.usage_status = "RETURNED";
    sparePartUsageRepository.save(usage);
    auditLog.sparePartReturn(usage.id, {
      ticket_id: usage.ticket_id,
      part_code: usage.part_code,
      returned_by: String(payload.returned_by ?? usage.approved_by ?? "仓管")
    });
    return usage;
  }
};
