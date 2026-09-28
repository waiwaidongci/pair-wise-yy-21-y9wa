<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useSparePartUsageStore } from "../stores/SparePartUsageStore";
import { describeApiError } from "../utils/errors";
import ApprovalPanel from "../components/common/ApprovalPanel.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import EmptyState from "../components/common/EmptyState.vue";
import { UsageStatusText } from "../constants/UsageStatus";
import type { UsageStatus } from "../types/UsageStatus";
const ticketStore = useRepairTicketStore();
const partStore = useSparePartUsageStore();
const { rows: tickets, loading } = storeToRefs(ticketStore);
const { rows: allUsages, stock } = storeToRefs(partStore);

const selectedId = ref<number>(1);
const busyId = ref<number | null>(null);
const feedback = ref<{ type: "ok" | "error"; text: string; codes: string[] } | null>(null);

const selectedTicket = computed(() => tickets.value.find((row) => row.id === selectedId.value));
const ticketUsages = computed(() => allUsages.value.filter((row) => row.ticket_id === selectedId.value));

const ticketStatusText = (status: string) =>
  ({
    WAIT_DISPATCH: "待派工",
    ASSIGNED: "已派工",
    ARRIVED: "已到场",
    REPAIRING: "抢修中",
    RESTORED: "已复电",
    CLOSED: "已归档"
  }[status] ?? status);

const ticketStatusTone = (status: string) =>
  ({ RESTORED: "badge-ok", CLOSED: "badge-muted", WAIT_DISPATCH: "badge-warn" }[status] ?? "");

const usageSummary = (ticketId: number) => {
  const list = allUsages.value.filter((row) => row.ticket_id === ticketId);
  const counters: Record<string, number> = {};
  list.forEach((row) => {
    counters[row.usage_status] = (counters[row.usage_status] ?? 0) + 1;
  });
  return {
    total: list.length,
    text: Object.entries(counters)
      .map(([status, count]) => `${UsageStatusText[status as UsageStatus] ?? status} ${count}`)
      .join("，")
  };
};

const selectTicket = (id: number) => {
  selectedId.value = id;
  feedback.value = null;
};

const onApprove = async ({ id, actual_quantity }: { id: number; actual_quantity: number }) => {
  busyId.value = id;
  feedback.value = null;
  try {
    await partStore.approve(id, { actual_quantity, approved_by: "仓管" });
    feedback.value = { type: "ok", text: `领用单 #${id} 审批通过，已按实发数量扣减仓库余量`, codes: [] };
  } catch (err) {
    const result = describeApiError(err);
    feedback.value = { type: "error", text: result.message, codes: result.codes };
  } finally {
    busyId.value = null;
  }
};

const onReturn = async (id: number) => {
  busyId.value = id;
  feedback.value = null;
  try {
    await partStore.return(id);
    feedback.value = { type: "ok", text: `领用单 #${id} 已退回，实发数量已补回仓库余量`, codes: [] };
  } catch (err) {
    const result = describeApiError(err);
    feedback.value = { type: "error", text: result.message, codes: result.codes };
  } finally {
    busyId.value = null;
  }
};

const onRestore = async () => {
  if (!selectedTicket.value) return;
  feedback.value = null;
  try {
    await ticketStore.restore(selectedTicket.value.id);
    feedback.value = { type: "ok", text: `工单 #${selectedTicket.value.id} 备件已全部核销，复电成功`, codes: [] };
  } catch (err) {
    const result = describeApiError(err);
    feedback.value = { type: "error", text: `复电被拒绝：${result.message}`, codes: result.codes };
  }
};

onMounted(async () => {
  await Promise.all([ticketStore.load(), partStore.load()]);
});
</script>

<template>
  <section class="page-grid">
    <div class="panel">
      <h2>抢修工单</h2>
      <div v-if="loading" class="muted">加载中…</div>
      <ul class="ticket-list">
        <li
          v-for="ticket in tickets"
          :key="ticket.id"
          :class="{ active: ticket.id === selectedId }"
          @click="selectTicket(ticket.id)"
        >
          <div class="ticket-line">
            <strong>#{{ ticket.id }} 抢修工单</strong>
            <StatusBadge :value="ticketStatusText(ticket.status)" :tone="ticketStatusTone(ticket.status)" />
          </div>
          <div class="muted small">班组 {{ ticket.team_id }} · {{ usageSummary(ticket.id).text || "无备件领用" }}</div>
        </li>
      </ul>
    </div>

    <div class="panel wide">
      <template v-if="selectedTicket">
        <div class="detail-head">
          <div>
            <h2>工单 #{{ selectedTicket.id }} 备件核销</h2>
            <p class="muted">
              状态：{{ ticketStatusText(selectedTicket.status) }} ·
              领用 {{ usageSummary(selectedTicket.id).total }} 项
            </p>
          </div>
          <button
            class="btn btn-primary"
            :disabled="selectedTicket.status === 'RESTORED' || selectedTicket.status === 'CLOSED'"
            @click="onRestore"
          >
            班组长确认复电
          </button>
        </div>

        <div v-if="feedback" :class="['feedback', feedback.type === 'ok' ? 'feedback-ok' : 'feedback-error']">
          <span>{{ feedback.text }}</span>
          <span v-if="feedback.codes.length" class="code-block">
            未处理编码：<strong v-for="code in feedback.codes" :key="code" class="mono">{{ code }} </strong>
          </span>
        </div>

        <ApprovalPanel
          :usages="ticketUsages"
          :stock="stock"
          :busy-id="busyId"
          @approve="onApprove"
          @return="onReturn"
        />
      </template>
      <EmptyState v-else title="请选择左侧工单" />
    </div>
  </section>
</template>
