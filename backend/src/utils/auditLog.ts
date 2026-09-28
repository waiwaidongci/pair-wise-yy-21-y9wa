import { LOG_TEMPLATES } from "../constants/logTemplates";
import { formatAuditTarget } from "./formatters";

type LogEntity = keyof typeof LOG_TEMPLATES;

const resolveTemplate = (entity: LogEntity, index: number): string => LOG_TEMPLATES[entity][index] ?? LOG_TEMPLATES[entity][0];

// SparePartUsage: create 0, update 1, status 2, export 3, approve 4, return 5
// RepairTicket: create 0, update 1, status 2, export 3, restore 4
// SparePartStock: deduct 0, refund 1, list 2
const writeAuditLog = (entity: LogEntity, templateIndex: number, targetId: number | string, detail?: Record<string, unknown>) => {
  const record = {
    at: new Date().toISOString(),
    action: resolveTemplate(entity, templateIndex),
    target: formatAuditTarget(entity, targetId),
    detail
  };
  console.info("audit-log", JSON.stringify(record));
  return record;
};

export const auditLog = {
  sparePartApprove: (usageId: number, detail: Record<string, unknown>) => writeAuditLog("SparePartUsage", 4, usageId, detail),
  sparePartReturn: (usageId: number, detail: Record<string, unknown>) => writeAuditLog("SparePartUsage", 5, usageId, detail),
  stockDeduct: (partCode: string, detail: Record<string, unknown>) => writeAuditLog("SparePartStock", 0, partCode, detail),
  stockRefund: (partCode: string, detail: Record<string, unknown>) => writeAuditLog("SparePartStock", 1, partCode, detail),
  ticketRestore: (ticketId: number, detail?: Record<string, unknown>) => writeAuditLog("RepairTicket", 4, ticketId, detail)
};
