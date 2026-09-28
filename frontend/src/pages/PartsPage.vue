<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import ApprovalPanel from "../components/common/ApprovalPanel.vue";
import EmptyState from "../components/common/EmptyState.vue";
import { useSparePartUsageStore } from "../stores/SparePartUsageStore";
import { useSparePartStockStore } from "../stores/SparePartStockStore";
import { useSessionStore } from "../stores/SessionStore";
import { useSparePartActions } from "../hooks/useSparePartActions";

const usageStore = useSparePartUsageStore();
const stockStore = useSparePartStockStore();
const sessionStore = useSessionStore();

// The parts page approves/returns usages grouped by ticket.
const selectedTicketId = ref<number | "">("");
const canApprove = computed(() => sessionStore.role === "WAREHOUSE_KEEPER");

const { approve, returnUsage, refresh } = useSparePartActions(
  selectedTicketId.value === "" ? undefined : Number(selectedTicketId.value)
);

const filteredUsages = computed(() =>
  selectedTicketId.value === ""
    ? usageStore.rows
    : usageStore.rows.filter((row) => row.ticket_id === Number(selectedTicketId.value))
);

const ticketIds = computed(() => [...new Set(usageStore.rows.map((row) => row.ticket_id))].sort((a, b) => a - b));

const groups = computed(() =>
  ticketIds.value
    .filter((id) => selectedTicketId.value === "" || id === Number(selectedTicketId.value))
    .map((id) => ({ ticketId: id, rows: usageStore.rows.filter((row) => row.ticket_id === id) }))
);

const onSelectTicket = async (event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  selectedTicketId.value = value === "" ? "" : Number(value);
};

const onApprove = async (id: number, issuedQuantity: number) => {
  try {
    await approve(id, issuedQuantity);
  } catch {
    // Failure notice is kept in the store; rows are already refreshed.
  }
};

const onReturn = async (id: number) => {
  await returnUsage(id);
};

onMounted(refresh);
</script>

<template>
  <section class="parts-page">
    <header class="page-toolbar">
      <h2>备件领用审批</h2>
      <label class="filter">
        按工单筛选
        <select :value="selectedTicketId" @change="onSelectTicket">
          <option value="">全部工单</option>
          <option v-for="id in ticketIds" :key="id" :value="id">工单 #{{ id }}</option>
        </select>
      </label>
    </header>

    <p v-if="!canApprove" class="role-hint">当前角色为只读，审批/退回请切换到「仓管」角色。</p>

    <div v-if="usageStore.notice" class="notice" :class="`notice--${usageStore.notice.type}`">
      <span>{{ usageStore.notice.message }}</span>
      <button class="notice-close" @click="usageStore.clearNotice()">×</button>
    </div>

    <section class="panel">
      <h3>仓库余量</h3>
      <div class="stock-grid">
        <div v-for="stock in stockStore.rows" :key="stock.part_code" class="stock-card">
          <span class="mono">{{ stock.part_code }}</span>
          <strong>{{ stock.part_name }}</strong>
          <em :class="{ 'stock-low': stock.remaining_quantity <= 0 }">余量 {{ stock.remaining_quantity }}</em>
        </div>
      </div>
    </section>

    <section v-for="group in groups" :key="group.ticketId" class="panel">
      <h3>工单 #{{ group.ticketId }} 的备件领用</h3>
      <ApprovalPanel
        :usages="group.rows"
        :can-approve="canApprove"
        @approve="onApprove"
        @return="onReturn"
      />
    </section>
    <EmptyState v-if="groups.length === 0 && !usageStore.loading" />
  </section>
</template>
