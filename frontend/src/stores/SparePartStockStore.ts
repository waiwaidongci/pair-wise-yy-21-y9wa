import { defineStore } from "pinia";
import { listSparePartStock } from "../api/SparePartStock";

export const useSparePartStockStore = defineStore("sparePartStock", {
  state: () => ({ rows: [] as Awaited<ReturnType<typeof listSparePartStock>>, loading: false }),
  actions: {
    async load() {
      this.loading = true;
      this.rows = await listSparePartStock();
      this.loading = false;
    },
    remainingOf(partCode: string): number {
      return this.rows.find((row) => row.part_code === partCode)?.remaining_quantity ?? 0;
    }
  }
});
