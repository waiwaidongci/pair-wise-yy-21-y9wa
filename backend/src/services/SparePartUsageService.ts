import { sparePartUsageRepository } from "../repositories/SparePartUsageRepository";
import { sparePartStockRepository } from "../repositories/SparePartStockRepository";
import { sparePartStockLogRepository } from "../repositories/SparePartStockLogRepository";
import { UsageStatus } from "../constants/UsageStatus";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { BusinessError } from "../utils/AppError";
import type { SparePartUsage } from "../models/SparePartUsage";
import type { ApproveSparePartUsagePayload, CreateSparePartUsagePayload } from "../types/SparePartUsagePayload";

export interface ApprovalResult {
  reused: boolean;
  usage: SparePartUsage;
  remaining_quantity: number;
}

const nowIso = () => new Date().toISOString();

const toPositiveInt = (value: unknown, field: string): number => {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    throw new BusinessError(ERROR_CODES.VALIDATION_FAILED, `${ERROR_MESSAGES.VALIDATION_FAILED}: ${field}`, 400);
  }
  return num;
};

export const sparePartUsageService = {
  list: (ticketId?: number) =>
    typeof ticketId === "number"
      ? sparePartUsageRepository.findByTicket(ticketId)
      : sparePartUsageRepository.findAll(),

  listStock: () => sparePartStockRepository.findAll(),
  listStockLogs: (ticketId?: number) =>
    typeof ticketId === "number"
      ? sparePartStockLogRepository.findByTicket(ticketId)
      : sparePartStockLogRepository.findAll(),

  create: (row: CreateSparePartUsagePayload) => {
    const ticket_id = toPositiveInt(row.ticket_id, "ticket_id");
    const quantity = toPositiveInt(row.quantity, "quantity");
    const part_code = String(row.part_code ?? "").trim();
    if (!part_code) {
      throw new BusinessError(ERROR_CODES.VALIDATION_FAILED, `${ERROR_MESSAGES.VALIDATION_FAILED}: part_code`, 400);
    }
    const timestamp = nowIso();
    const created = sparePartUsageRepository.save({
      ticket_id,
      part_code,
      part_name: String(row.part_name ?? part_code),
      quantity,
      actual_quantity: 0,
      warehouse_name: String(row.warehouse_name ?? "中心仓库"),
      approved_by: "",
      usage_status: UsageStatus.PENDING,
      created_at: timestamp,
      approved_at: "",
      returned_at: ""
    });
    console.info(LOG_TEMPLATES.SparePartUsage[0], created.id, created.ticket_id, created.part_code);
    return created;
  },

  /**
   * 逐项审批：审批通过时按实发数量扣减仓库余量。
   * 同一领用单重复提交沿用第一次结果：已审批直接返回首次结果，不再重复扣减；
   * 首次审批因数量不足被拒（REJECTED）后重复提交，仍返回首次的拒绝结果。
   */
  approve: (id: number, payload: ApproveSparePartUsagePayload = {}): ApprovalResult => {
    const usage = sparePartUsageRepository.findById(id);
    if (!usage) {
      throw new BusinessError(
        ERROR_CODES.SPARE_PART_USAGE_NOT_FOUND,
        ERROR_MESSAGES.SPARE_PART_USAGE_NOT_FOUND,
        404
      );
    }

    if (usage.usage_status === UsageStatus.APPROVED) {
      const stock = sparePartStockRepository.findOne(usage.part_code, usage.warehouse_name);
      console.info(LOG_TEMPLATES.SparePartUsage[4], usage.id, "reused");
      return { reused: true, usage, remaining_quantity: stock?.remaining_quantity ?? 0 };
    }

    if (usage.usage_status === UsageStatus.REJECTED) {
      const stock = sparePartStockRepository.findOne(usage.part_code, usage.warehouse_name);
      throw new BusinessError(
        ERROR_CODES.SPARE_PART_STOCK_INSUFFICIENT,
        ERROR_MESSAGES.SPARE_PART_STOCK_INSUFFICIENT,
        409,
        {
          reused: true,
          usage_id: usage.id,
          part_code: usage.part_code,
          required: usage.actual_quantity || usage.quantity,
          remaining: stock?.remaining_quantity ?? 0
        }
      );
    }

    if (usage.usage_status !== UsageStatus.PENDING) {
      throw new BusinessError(
        ERROR_CODES.SPARE_PART_USAGE_STATUS_CONFLICT,
        ERROR_MESSAGES.SPARE_PART_USAGE_STATUS_CONFLICT,
        409,
        { usage_id: usage.id, usage_status: usage.usage_status }
      );
    }

    const actualQuantity = payload.actual_quantity === undefined ? usage.quantity : toPositiveInt(payload.actual_quantity, "actual_quantity");
    if (actualQuantity > usage.quantity) {
      throw new BusinessError(
        ERROR_CODES.VALIDATION_FAILED,
        `${ERROR_MESSAGES.VALIDATION_FAILED}: actual_quantity exceeds quantity`,
        400,
        { usage_id: usage.id, quantity: usage.quantity, actual_quantity: actualQuantity }
      );
    }

    const timestamp = nowIso();
    const stock = sparePartStockRepository.deduct(usage.part_code, usage.warehouse_name, actualQuantity, timestamp);
    if (!stock) {
      const latest = sparePartStockRepository.findOne(usage.part_code, usage.warehouse_name);
      sparePartUsageRepository.update(usage.id, {
        usage_status: UsageStatus.REJECTED,
        actual_quantity: actualQuantity
      });
      throw new BusinessError(
        ERROR_CODES.SPARE_PART_STOCK_INSUFFICIENT,
        ERROR_MESSAGES.SPARE_PART_STOCK_INSUFFICIENT,
        409,
        {
          reused: false,
          usage_id: usage.id,
          ticket_id: usage.ticket_id,
          part_code: usage.part_code,
          required: actualQuantity,
          remaining: latest?.remaining_quantity ?? 0
        }
      );
    }

    const updated = sparePartUsageRepository.update(usage.id, {
      actual_quantity: actualQuantity,
      approved_by: String(payload.approved_by ?? "仓管"),
      usage_status: UsageStatus.APPROVED,
      approved_at: timestamp
    });
    sparePartStockLogRepository.append({
      part_code: usage.part_code,
      warehouse_name: usage.warehouse_name,
      change_quantity: -actualQuantity,
      remaining_quantity: stock.remaining_quantity,
      usage_id: usage.id,
      ticket_id: usage.ticket_id,
      action: UsageStatus.APPROVED,
      created_at: timestamp
    });
    console.info(LOG_TEMPLATES.SparePartUsage[4], usage.id, usage.part_code, actualQuantity, stock.remaining_quantity);
    return { reused: false, usage: updated as SparePartUsage, remaining_quantity: stock.remaining_quantity };
  },

  /** 退回已审批领用：按实发数量补回仓库余量；重复退回沿用第一次结果，不重复补回。 */
  return: (id: number) => {
    const usage = sparePartUsageRepository.findById(id);
    if (!usage) {
      throw new BusinessError(
        ERROR_CODES.SPARE_PART_USAGE_NOT_FOUND,
        ERROR_MESSAGES.SPARE_PART_USAGE_NOT_FOUND,
        404
      );
    }

    if (usage.usage_status === UsageStatus.RETURNED) {
      const stock = sparePartStockRepository.findOne(usage.part_code, usage.warehouse_name);
      console.info(LOG_TEMPLATES.SparePartUsage[5], usage.id, "reused");
      return { reused: true, usage, remaining_quantity: stock?.remaining_quantity ?? 0 };
    }

    if (usage.usage_status !== UsageStatus.APPROVED && usage.usage_status !== UsageStatus.REJECTED) {
      throw new BusinessError(
        ERROR_CODES.SPARE_PART_USAGE_STATUS_CONFLICT,
        ERROR_MESSAGES.SPARE_PART_USAGE_STATUS_CONFLICT,
        409,
        { usage_id: usage.id, usage_status: usage.usage_status }
      );
    }

    const timestamp = nowIso();
    // REJECTED 从未实发出库，退回只关闭申请单，不产生库存补回；APPROVED 按实发数量补回余量。
    const refundQuantity = usage.usage_status === UsageStatus.APPROVED ? usage.actual_quantity : 0;
    const stock = sparePartStockRepository.refund(
      usage.part_code,
      usage.warehouse_name,
      refundQuantity,
      timestamp
    );
    const updated = sparePartUsageRepository.update(usage.id, {
      usage_status: UsageStatus.RETURNED,
      returned_at: timestamp
    });
    sparePartStockLogRepository.append({
      part_code: usage.part_code,
      warehouse_name: usage.warehouse_name,
      change_quantity: refundQuantity,
      remaining_quantity: stock.remaining_quantity,
      usage_id: usage.id,
      ticket_id: usage.ticket_id,
      action: UsageStatus.RETURNED,
      created_at: timestamp
    });
    console.info(LOG_TEMPLATES.SparePartUsage[5], usage.id, usage.part_code, refundQuantity, stock.remaining_quantity);
    return { reused: false, usage: updated as SparePartUsage, remaining_quantity: stock.remaining_quantity };
  }
};
