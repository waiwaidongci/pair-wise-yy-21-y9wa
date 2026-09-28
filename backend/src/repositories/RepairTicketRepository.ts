import { seed } from "../seed";

export const repairTicketRepository = {
  findAll: () => seed.repairTicket,
  findById: (id: number) => seed.repairTicket.find((row) => row.id === id),
  save: (row: unknown) => row,
  update: (id: number, patch: Record<string, unknown>) => {
    const row = repairTicketRepository.findById(id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  }
};
