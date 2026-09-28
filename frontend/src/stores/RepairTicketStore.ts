import { defineStore } from "pinia";
import { listRepairTicket, restoreRepairTicket } from "../api/RepairTicket";
import type { RepairTicket } from "../types/RepairTicket";

export const useRepairTicketStore = defineStore("repairTicket", {
  state: () => ({ rows: [] as RepairTicket[], loading: false }),
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listRepairTicket();
      } finally {
        this.loading = false;
      }
    },
    async restore(id: number) {
      await restoreRepairTicket(id);
      await this.load();
    }
  }
});
