<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useSparePartUsageStore } from "../stores/SparePartUsageStore";
import { describeApiError } from "../utils/errors";
import ApprovalPanel from "../components/common/ApprovalPanel.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import { UsageStatusText } from "../constants/UsageStatus";
import type { UsageStatus } from "../types/UsageStatus";
import type { SparePartStockLog } from "../types/SparePartUsage";

const ticketStore = useRepairTicketStore();
const partStore = useSparePartUsageStore();
const { rows: tickets } = storeToRefs(ticketStore);
const { rows: allUsages, stock, stockLogs } = storeToRefs(partStore);

const filterTicketId = ref<number | "">("");
const busyId = ref<number | null>(null);
const feedback = ref<{ type: "ok" | "error"; text: string; codes: string[] } | null>(null);

const form = ref({ ticket_id: 1, part_code: "", part_name: "", quantity: 1, warehouse_name: "中心仓库" });

const visibleUsages = computed(() =>
  filterTicketId.value === "" ? allUsages.value : allUsages.value.filter((row) => row.ticket_id === filterTicketId.value)
);
const visibleLogs = computed(() =>
  filterTicketId.value === "" ? stockLogs.value : stockLogs.value.filter((row) => row.ticket_id === filterTicketId.value)
);

const logText = (log: SparePartStockLog) =>
  `${UsageStatusText[log.action as UsageStatus] ?? log.action} · 编码 ${log.part_code} · ${
    log.change_quantity > 0 ? "+" : ""
  }${log.change_quantity} → 余量 ${log.remaining_quantity}`;

const onApprove = async ({ id, actual_quantity }: { id: number; actual_quantity: number }) => {
  busyId.value = id;
  feedback.value = null;
  try {
    await partStore.approve(id, { actual_quantity, approved_by: "仓管" });
    feedback.value = { type: "ok", text: `领用单 #${id} 已审批出库，仓库余量按实发数量扣减`, codes: [] };
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
    feedback.value = { type: "ok", text: `领用单 #${id} 已退回，余量已补回`, codes: [] };
  } catch (err) {
    const result = describeApiError(err);
    feedback.value = { type: "error", text: result.message, codes: result.codes };
  } finally {
    busyId.value = null;
  }
};

const onCreate = async () => {
  feedback.value = null;
  try {
    await partStore.create({
      ticket_id: Number(form.value.ticket_id),
      part_code: form.value.part_code.trim(),
      part_name: form.value.part_name.trim() || form.value.part_code.trim(),
      quantity: Number(form.value.quantity),
      warehouse_name: form.value.warehouse_name.trim() || "中心仓库"
    });
    feedback.value = { type: "ok", text: "备件领用申请已创建，等待逐项审批", codes: [] };
    form.value.part_code = "";
    form.value.part_name = "";
    form.value.quantity = 1;
  } catch (err) {
    const result = describeApiError(err);
    feedback.value = { type: "error", text: result.message, codes: result.codes };
  }
};

onMounted(async () => {
  await Promise.all([ticketStore.load(), partStore.load()]);
});
</script>

<template>
  <section class="parts-page">
    <div class="panel">
      <div class="detail-head">
        <h2>备件领用审批</h2>
        <label class="filter-line">
          按工单筛选：
          <select v-model="filterTicketId">
            <option :value="''">全部工单</option>
            <option v-for="ticket in tickets" :key="ticket.id" :value="ticket.id">#{{ ticket.id }}</option>
          </select>
        </label>
      </div>

      <div v-if="feedback" :class="['feedback', feedback.type === 'ok' ? 'feedback-ok' : 'feedback-error']">
        <span>{{ feedback.text }}</span>
        <span v-if="feedback.codes.length" class="code-block">
          编码：<strong v-for="code in feedback.codes" :key="code" class="mono">{{ code }} </strong>
        </span>
      </div>

      <ApprovalPanel
        :usages="visibleUsages"
        :stock="stock"
        :busy-id="busyId"
        @approve="onApprove"
        @return="onReturn"
      />
    </div>

    <div class="side-column">
      <div class="panel">
        <h2>仓库余量</h2>
        <ul class="stock-list">
          <li v-for="row in stock" :key="`${row.part_code}@${row.warehouse_name}`">
            <div>
              <strong class="mono">{{ row.part_code }}</strong>
              <span class="muted"> {{ row.part_name }}（{{ row.warehouse_name }}）</span>
            </div>
            <StatusBadge :value="`余量 ${row.remaining_quantity}`" :tone="row.remaining_quantity > 0 ? 'badge-ok' : 'badge-danger'" />
          </li>
        </ul>
      </div>

      <div class="panel">
        <h2>新建领用申请</h2>
        <div class="form-grid">
          <label>工单
            <select v-model="form.ticket_id">
              <option v-for="ticket in tickets" :key="ticket.id" :value="ticket.id">#{{ ticket.id }}</option>
            </select>
          </label>
          <label>备件编码<input v-model="form.part_code" placeholder="如 DLQ-10kV-001" /></label>
          <label>备件名称<input v-model="form.part_name" placeholder="如 10kV柱上断路器" /></label>
          <label>申请数量<input v-model.number="form.quantity" type="number" min="1" /></label>
          <label>仓库<input v-model="form.warehouse_name" /></label>
          <button class="btn btn-primary" @click="onCreate">提交领用</button>
        </div>
      </div>

      <div class="panel">
        <h2>备件库存流水</h2>
        <ul class="log-list">
          <li v-for="log in visibleLogs" :key="log.id">
            <span class="mono small">{{ log.created_at }}</span>
            <span>{{ logText(log) }}</span>
          </li>
          <li v-if="visibleLogs.length === 0" class="muted">暂无流水</li>
        </ul>
      </div>
    </div>
  </section>
</template>
