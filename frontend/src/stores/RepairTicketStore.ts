import { defineStore } from "pinia";
import { listRepairTicket, restoreRepairTicket, type RestoreResult } from "../api/RepairTicket";
import { ApiError, type ApiErrorDetail } from "../api/http";

export interface RestoreNotice {
  type: "success" | "error";
  ticketId: number;
  message: string;
  detail?: ApiErrorDetail;
}

export const useRepairTicketStore = defineStore("repairTicket", {
  state: () => ({
    rows: [] as Awaited<ReturnType<typeof listRepairTicket>>,
    loading: false,
    restoreNotice: null as RestoreNotice | null
  }),
  actions: {
    async load() {
      this.loading = true;
      this.rows = await listRepairTicket();
      this.loading = false;
    },
    async restore(id: number): Promise<RestoreResult | null> {
      try {
        const result = await restoreRepairTicket(id);
        this.restoreNotice = { type: "success", ticketId: id, message: `工单 #${id} 备件已全部核销，恢复供电成功` };
        return result;
      } catch (error) {
        if (error instanceof ApiError && error.code === "RESTORE_PENDING_PARTS") {
          this.restoreNotice = {
            type: "error",
            ticketId: id,
            message: `工单 #${id} 复电被拒绝，存在未处理备件`,
            detail: error.detail
          };
        } else if (error instanceof ApiError) {
          this.restoreNotice = { type: "error", ticketId: id, message: `工单 #${id} ${error.message}`, detail: error.detail };
        }
        return null;
      }
    },
    clearNotice() {
      this.restoreNotice = null;
    }
  }
});
