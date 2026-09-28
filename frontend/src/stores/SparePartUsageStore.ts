import { defineStore } from "pinia";
import {
  approveSparePartUsage,
  listSparePartStock,
  listSparePartStockLogs,
  listSparePartUsage,
  returnSparePartUsage,
  saveSparePartUsage,
  type ApproveSparePartPayload,
  type CreateSparePartPayload
} from "../api/SparePartUsage";
import type { SparePartStock, SparePartStockLog, SparePartUsage } from "../types/SparePartUsage";

interface State {
  rows: SparePartUsage[];
  stock: SparePartStock[];
  stockLogs: SparePartStockLog[];
  loading: boolean;
  actionError: string;
}

export const useSparePartUsageStore = defineStore("sparePartUsage", {
  state: (): State => ({ rows: [], stock: [], stockLogs: [], loading: false, actionError: "" }),
  actions: {
    async load(ticketId?: number) {
      this.loading = true;
      try {
        const [rows, stock, stockLogs] = await Promise.all([
          listSparePartUsage(ticketId),
          listSparePartStock(),
          listSparePartStockLogs(ticketId)
        ]);
        this.rows = rows;
        this.stock = stock;
        this.stockLogs = stockLogs;
      } finally {
        this.loading = false;
      }
    },
    async approve(id: number, payload: ApproveSparePartPayload) {
      this.actionError = "";
      await approveSparePartUsage(id, payload);
      await this.load();
    },
    async return(id: number) {
      this.actionError = "";
      await returnSparePartUsage(id);
      await this.load();
    },
    async create(payload: CreateSparePartPayload) {
      this.actionError = "";
      await saveSparePartUsage(payload);
      await this.load();
    },
    byTicket(ticketId: number): SparePartUsage[] {
      return this.rows.filter((row) => row.ticket_id === ticketId);
    }
  }
});
