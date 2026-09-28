import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { sparePartUsageService } from "./SparePartUsageService";
import { sparePartStockService } from "./SparePartStockService";
import { serviceError } from "../utils/httpError";
import { auditLog } from "../utils/auditLog";
import type { RepairTicket } from "../models/RepairTicket";

export interface RestoreResult {
  ticket: RepairTicket;
  blocked: boolean;
  pendingApprovalCodes: string[];
  insufficientCodes: string[];
}

export const repairTicketService = {
  list: () => repairTicketRepository.findAll(),
  create: (row: unknown) => repairTicketRepository.save(row as RepairTicket),

  // Restoration is coupled with spare part write-off: every usage must be
  // approved (stock deducted by issued quantity) or returned (stock refunded).
  restore: (ticketId: number): RestoreResult => {
    const ticket = repairTicketRepository.findById(ticketId);
    if (!ticket) throw serviceError("TICKET_NOT_FOUND", 404, { ticket_id: ticketId });

    if (ticket.status === "RESTORED") {
      // Repeated confirmations are idempotent.
      return { ticket, blocked: false, pendingApprovalCodes: [], insufficientCodes: [] };
    }

    const usages = sparePartUsageService.listByTicket(ticketId);
    const pendingApprovalCodes = usages.filter((row) => row.usage_status === "PENDING").map((row) => row.part_code);

    // Issued quantities that can no longer be covered by warehouse remaining quantity.
    const stockByCode = new Map(sparePartStockService.list().map((stock) => [stock.part_code, stock]));
    const insufficientCodes = usages
      .filter((row) => row.usage_status === "STOCK_INSUFFICIENT")
      .filter((row) => (stockByCode.get(row.part_code)?.remaining_quantity ?? 0) < (row.issued_quantity ?? 0))
      .map((row) => row.part_code);

    if (pendingApprovalCodes.length > 0 || insufficientCodes.length > 0) {
      throw serviceError("RESTORE_PENDING_PARTS", 409, {
        ticket_id: ticketId,
        pending_approval_codes: pendingApprovalCodes,
        insufficient_codes: insufficientCodes,
        unresolved_codes: [...pendingApprovalCodes, ...insufficientCodes]
      });
    }

    ticket.status = "RESTORED";
    ticket.restored_at = new Date().toISOString();
    repairTicketRepository.save(ticket);
    auditLog.ticketRestore(ticketId, { status: ticket.status });
    return { ticket, blocked: false, pendingApprovalCodes: [], insufficientCodes: [] };
  }
};
