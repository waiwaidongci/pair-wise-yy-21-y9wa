import { defineStore } from "pinia";
import {
  approveSparePartUsage,
  listSparePartUsage,
  returnSparePartUsage
} from "../api/SparePartUsage";
import { ApiError, type ApiErrorDetail } from "../api/http";

export interface ActionNotice {
  type: "success" | "error";
  message: string;
  detail?: ApiErrorDetail;
}

export const useSparePartUsageStore = defineStore("sparePartUsage", {
  state: () => ({
    rows: [] as Awaited<ReturnType<typeof listSparePartUsage>>,
    loading: false,
    notice: null as ActionNotice | null
  }),
  actions: {
    async load(ticketId?: number) {
      this.loading = true;
      this.rows = await listSparePartUsage(ticketId);
      this.loading = false;
    },
    async approve(id: number, issuedQuantity: number) {
      try {
        await approveSparePartUsage(id, issuedQuantity);
        this.notice = { type: "success", message: `领用单 #${id} 已审批通过，按实发数量扣减仓库余量` };
      } catch (error) {
        if (error instanceof ApiError) {
          this.notice = {
            type: "error",
            message: error.detail?.reused_first_result
              ? `领用单 #${id} 沿用首次审批结果：仓库余量不足`
              : `领用单 #${id} 审批失败：${error.message}`,
            detail: error.detail
          };
        }
        throw error;
      }
    },
    async returnUsage(id: number) {
      await returnSparePartUsage(id);
      this.notice = { type: "success", message: `领用单 #${id} 已退回，实发数量已补回仓库余量` };
    },
    clearNotice() {
      this.notice = null;
    }
  }
});
