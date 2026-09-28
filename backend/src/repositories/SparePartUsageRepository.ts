import { seed } from "../seed";
import type { SparePartUsage } from "../models/SparePartUsage";
import { createSparePartUsageDto } from "../constructors/SparePartUsageDtoFactory";

export const sparePartUsageRepository = {
  findAll: (): SparePartUsage[] => seed.sparePartUsage,
  findById: (id: number): SparePartUsage | undefined => seed.sparePartUsage.find((row) => row.id === id),
  findByTicket: (ticketId: number): SparePartUsage[] =>
    seed.sparePartUsage.filter((row) => row.ticket_id === ticketId),
  nextId: (): number => seed.sparePartUsage.reduce((max, row) => Math.max(max, row.id), 0) + 1,
  save: (row: Omit<SparePartUsage, "id"> & { id?: number }): SparePartUsage => {
    const created = createSparePartUsageDto({ ...row, id: row.id ?? sparePartUsageRepository.nextId() }) as SparePartUsage;
    seed.sparePartUsage.push(created);
    return created;
  },
  update: (id: number, patch: Partial<SparePartUsage>): SparePartUsage | undefined => {
    const row = sparePartUsageRepository.findById(id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  }
};
