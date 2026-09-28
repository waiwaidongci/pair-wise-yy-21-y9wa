import { seed } from "../seed";
import type { SparePartUsage } from "../models/SparePartUsage";

// In-memory table: cloned once per process so write actions mutate runtime state only.
const rows: SparePartUsage[] = seed.sparePartUsage.map((row) => ({ ...row }));

export const sparePartUsageRepository = {
  findAll: (): SparePartUsage[] => rows,
  findByTicketId: (ticketId: number): SparePartUsage[] => rows.filter((row) => row.ticket_id === ticketId),
  findById: (id: number): SparePartUsage | undefined => rows.find((row) => row.id === id),
  save: (row: SparePartUsage): SparePartUsage => {
    const index = rows.findIndex((item) => item.id === row.id);
    if (index >= 0) rows[index] = row;
    else rows.push(row);
    return row;
  },
  nextId: (): number => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1
};
