<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { SparePartStock, SparePartUsage } from "../../types/SparePartUsage";
import { UsageStatusText, usageStatusClass } from "../../constants/UsageStatus";
import { UsageStatus } from "../../types/UsageStatus";
import type { UsageStatus as UsageStatusType } from "../../types/UsageStatus";
import StatusBadge from "./StatusBadge.vue";

const props = defineProps<{
  usages: SparePartUsage[];
  stock: SparePartStock[];
  busyId?: number | null;
}>();

const emit = defineEmits<{
  (e: "approve", payload: { id: number; actual_quantity: number }): void;
  (e: "return", id: number): void;
}>();

const drafts = reactive<Record<number, number>>({});
watch(
  () => props.usages,
  (rows) => {
    rows.forEach((row) => {
      if (drafts[row.id] === undefined) drafts[row.id] = row.quantity;
    });
  },
  { immediate: true, deep: true }
);

const remainingMap = computed(() => {
  const map = new Map<string, number>();
  props.stock.forEach((row) => map.set(`${row.part_code}@${row.warehouse_name}`, row.remaining_quantity));
  return map;
});

const remainingOf = (usage: SparePartUsage): number =>
  remainingMap.value.get(`${usage.part_code}@${usage.warehouse_name}`) ?? 0;

const submitApprove = (usage: SparePartUsage) => {
  const actual = Number(drafts[usage.id]);
  emit("approve", { id: usage.id, actual_quantity: actual });
};

const canApprove = (usage: SparePartUsage) => usage.usage_status === UsageStatus.PENDING;
const canReturn = (usage: SparePartUsage) =>
  usage.usage_status === UsageStatus.APPROVED || usage.usage_status === UsageStatus.REJECTED;
</script>

<template>
  <div class="approval-panel">
    <table class="grid-table">
      <thead>
        <tr>
          <th>备件编码</th>
          <th>名称/仓库</th>
          <th>申请数量</th>
          <th>实发数量</th>
          <th>仓库余量</th>
          <th>状态</th>
          <th class="col-actions">逐项操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="usage in usages" :key="usage.id">
          <td class="mono">{{ usage.part_code }}</td>
          <td>
            {{ usage.part_name }}
            <span class="muted">（{{ usage.warehouse_name }}）</span>
          </td>
          <td>{{ usage.quantity }}</td>
          <td>
            <input
              v-if="canApprove(usage)"
              v-model.number="drafts[usage.id]"
              type="number"
              min="1"
              :max="usage.quantity"
              class="qty-input"
            />
            <span v-else>{{ usage.actual_quantity }}</span>
          </td>
          <td :class="{ 'text-danger': remainingOf(usage) < (drafts[usage.id] ?? usage.quantity) }">
            {{ remainingOf(usage) }}
          </td>
          <td>
            <StatusBadge
              :value="UsageStatusText[(usage.usage_status as UsageStatusType)] ?? usage.usage_status"
              :tone="usageStatusClass[(usage.usage_status as UsageStatusType)] ?? ''"
            />
          </td>
          <td class="col-actions">
            <button
              v-if="canApprove(usage)"
              class="btn btn-primary"
              :disabled="busyId === usage.id"
              @click="submitApprove(usage)"
            >
              审批通过
            </button>
            <button
              v-if="canReturn(usage)"
              class="btn btn-ghost"
              :disabled="busyId === usage.id"
              @click="emit('return', usage.id)"
            >
              退回
            </button>
            <span v-if="usage.usage_status === 'RETURNED'" class="muted">已闭环</span>
          </td>
        </tr>
        <tr v-if="usages.length === 0">
          <td colspan="7" class="muted empty-cell">该工单暂无备件领用记录</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
