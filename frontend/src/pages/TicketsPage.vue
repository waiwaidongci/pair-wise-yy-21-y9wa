<script setup lang="ts">
import { computed, onMounted } from "vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import ApprovalPanel from "../components/common/ApprovalPanel.vue";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useSparePartUsageStore } from "../stores/SparePartUsageStore";
import { useSparePartStockStore } from "../stores/SparePartStockStore";
import { useSessionStore } from "../stores/SessionStore";
import { useSparePartActions } from "../hooks/useSparePartActions";
import { TicketStatusText } from "../constants/TicketStatus";

const ticketStore = useRepairTicketStore();
const usageStore = useSparePartUsageStore();
const stockStore = useSparePartStockStore();
const sessionStore = useSessionStore();

const canRestore = computed(() => sessionStore.role === "LEADER");
const canApprove = computed(() => sessionStore.role === "WAREHOUSE_KEEPER");

const { approve, returnUsage, refresh } = useSparePartActions();

const usagesOf = (ticketId: number) => usageStore.rows.filter((row) => row.ticket_id === ticketId);

const noticeFor = (ticketId: number) =>
  ticketStore.restoreNotice && ticketStore.restoreNotice.ticketId === ticketId ? ticketStore.restoreNotice : null;

const noticePendingCodes = (ticketId: number): string[] => noticeFor(ticketId)?.detail?.pending_approval_codes ?? [];
const noticeInsufficientCodes = (ticketId: number): string[] => noticeFor(ticketId)?.detail?.insufficient_codes ?? [];

const onRestore = async (ticketId: number) => {
  await ticketStore.restore(ticketId);
};

const onApprove = async (id: number, issuedQuantity: number) => {
  try {
    await approve(id, issuedQuantity);
  } catch {
    // Failure details stay in the usage store notice.
  }
};

const onReturn = async (id: number) => {
  await returnUsage(id);
};

onMounted(async () => {
  await Promise.all([ticketStore.load(), refresh()]);
});
</script>

<template>
  <section class="tickets-page">
    <header class="page-toolbar">
      <h2>抢修工单与复电确认</h2>
      <p v-if="!canRestore" class="role-hint">复电确认需切换到「抢修班组长」角色；备件审批需切换到「仓管」角色。</p>
    </header>

    <div v-if="usageStore.notice" class="notice" :class="`notice--${usageStore.notice.type}`">
      <span>{{ usageStore.notice.message }}</span>
      <button class="notice-close" @click="usageStore.clearNotice()">×</button>
    </div>

    <article v-for="ticket in ticketStore.rows" :key="ticket.id" class="panel ticket-card">
      <header class="ticket-head">
        <div>
          <h3>工单 #{{ ticket.id }}</h3>
          <p class="ticket-meta">抢修队 {{ ticket.team_id }} · 优先级 {{ ticket.priority }}</p>
        </div>
        <StatusBadge :value="TicketStatusText[ticket.status as keyof typeof TicketStatusText] ?? ticket.status" />
      </header>

      <ApprovalPanel
        :usages="usagesOf(ticket.id)"
        :can-approve="canApprove"
        @approve="onApprove"
        @return="onReturn"
      />

      <div v-if="noticeFor(ticket.id)" class="notice" :class="`notice--${noticeFor(ticket.id)?.type}`">
        <div>
          <strong>{{ noticeFor(ticket.id)?.message }}</strong>
          <ul v-if="noticeFor(ticket.id)?.detail" class="blocked-codes">
            <li v-if="noticePendingCodes(ticket.id).length">
              待审批编码：{{ noticePendingCodes(ticket.id).join("、") }}
            </li>
            <li v-if="noticeInsufficientCodes(ticket.id).length">
              数量不足编码：{{ noticeInsufficientCodes(ticket.id).join("、") }}
            </li>
          </ul>
        </div>
        <button class="notice-close" @click="ticketStore.clearNotice()">×</button>
      </div>

      <footer class="ticket-foot">
        <button
          class="btn btn--primary"
          :disabled="!canRestore || ticket.status === 'RESTORED'"
          @click="onRestore(ticket.id)"
        >
          {{ ticket.status === "RESTORED" ? "已恢复供电" : "班组长确认复电" }}
        </button>
        <span v-if="ticket.status === 'RESTORED'" class="restored-at">复电时间：{{ ticket.restored_at }}</span>
      </footer>
    </article>
  </section>
</template>
