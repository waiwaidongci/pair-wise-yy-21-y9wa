import { seed } from "../seed";
import type { SparePartStockLog } from "../models/SparePartStockLog";

export const sparePartStockLogRepository = {
  findAll: (): SparePartStockLog[] => seed.sparePartStockLog,
  findByTicket: (ticketId: number): SparePartStockLog[] =>
    seed.sparePartStockLog.filter((row) => row.ticket_id === ticketId),
  nextId: (): number => seed.sparePartStockLog.reduce((max, row) => Math.max(max, row.id), 0) + 1,
  append: (log: Omit<SparePartStockLog, "id">): SparePartStockLog => {
    const created = { ...log, id: sparePartStockLogRepository.nextId() };
    seed.sparePartStockLog.push(created);
    return created;
  }
};
