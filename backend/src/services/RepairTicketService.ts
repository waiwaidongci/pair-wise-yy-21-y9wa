import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { sparePartUsageRepository } from "../repositories/SparePartUsageRepository";
import { UsageStatus } from "../constants/UsageStatus";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { BusinessError } from "../utils/AppError";

export interface RestoreBlockers {
  pending_part_codes: string[];
  insufficient_part_codes: string[];
}

export interface RestorePowerResult {
  ticket_id: number;
  status: string;
  restored_at: string;
}

const nowIso = () => new Date().toISOString();

/**
 * 复电前备件核销校验：
 * - APPROVED 已按实发数量出库扣减，允许复电；
 * - RETURNED 已退回并补回余量，不阻塞复电；
 * - PENDING 尚未逐项审批，拒绝复电；
 * - REJECTED 审批时仓库余量不足，拒绝复电。
 */
const collectBlockers = (ticketId: number): RestoreBlockers => {
  const usages = sparePartUsageRepository.findByTicket(ticketId);
  return {
    pending_part_codes: usages
      .filter((row) => row.usage_status === UsageStatus.PENDING)
      .map((row) => row.part_code),
    insufficient_part_codes: usages
      .filter((row) => row.usage_status === UsageStatus.REJECTED)
      .map((row) => row.part_code)
  };
};

export const repairTicketService = {
  list: () => repairTicketRepository.findAll(),
  create: (row: unknown) => repairTicketRepository.save(row),

  /** 班组长确认复电：备件未逐项审批完成或存在数量不足时拒绝复电，并列出未处理编码。 */
  restorePower: (id: number): RestorePowerResult => {
    const ticket = repairTicketRepository.findById(id);
    if (!ticket) {
      throw new BusinessError(ERROR_CODES.REPAIR_TICKET_NOT_FOUND, ERROR_MESSAGES.REPAIR_TICKET_NOT_FOUND, 404);
    }

    const blockers = collectBlockers(id);
    const pendingCount = blockers.pending_part_codes.length;
    const insufficientCount = blockers.insufficient_part_codes.length;
    if (pendingCount > 0 || insufficientCount > 0) {
      const code =
        pendingCount > 0 ? ERROR_CODES.SPARE_PART_PENDING : ERROR_CODES.SPARE_PART_STOCK_INSUFFICIENT;
      throw new BusinessError(code, ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES], 409, {
        ticket_id: id,
        ...blockers,
        unresolved_part_codes: [...blockers.pending_part_codes, ...blockers.insufficient_part_codes]
      });
    }

    const timestamp = nowIso();
    const updated = repairTicketRepository.update(id, { status: "RESTORED", restored_at: timestamp });
    console.info(LOG_TEMPLATES.RepairTicket[4], id, timestamp);
    return { ticket_id: id, status: (updated as { status: string }).status, restored_at: timestamp };
  }
};
