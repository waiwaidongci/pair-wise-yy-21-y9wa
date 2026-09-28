<script setup lang="ts">
import { ref, watch } from "vue";
import type { SparePartUsage } from "../../types/SparePartUsage";
import { SparePartUsageStatusText } from "../../constants/SparePartUsageStatus";
import { useSparePartStockStore } from "../../stores/SparePartStockStore";

const props = defineProps<{
  usages: SparePartUsage[];
  canApprove: boolean;
}>();

const emit = defineEmits<{
  (e: "approve", id: number, issuedQuantity: number): void;
  (e: "return", id: number): void;
}>();

const stockStore = useSparePartStockStore();

// Issued quantity is edited item by item before approval.
const issuedInputs = ref<Record<number, number>>({});
watch(
  () => props.usages,
  (rows) => {
    rows.forEach((row) => {
      if (issuedInputs.value[row.id] === undefined) {
        issuedInputs.value[row.id] = row.issued_quantity ?? row.quantity;
      }
    });
  },
  { immediate: true, deep: true }
);

const badgeClass = (status: SparePartUsage["usage_status"]) => `part-badge part-badge--${status.toLowerCase()}`;
</script>

<template>
  <div class="approval-panel">
    <table class="part-table">
      <thead>
        <tr>
          <th>编码</th>
          <th>备件名称</th>
          <th>申请数量</th>
          <th>实发数量</th>
          <th>仓库余量</th>
          <th>审批人</th>
          <th>状态</th>
          <th v-if="canApprove">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in usages" :key="row.id">
          <td class="mono">{{ row.part_code }}</td>
          <td>{{ row.part_name }}</td>
          <td>{{ row.quantity }}</td>
          <td>
            <input
              v-if="canApprove && row.usage_status === 'PENDING'"
              v-model.number="issuedInputs[row.id]"
              class="qty-input"
              type="number"
              min="1"
            />
            <span v-else>{{ row.issued_quantity ?? "—" }}</span>
          </td>
          <td :class="{ 'stock-low': stockStore.remainingOf(row.part_code) < issuedInputs[row.id] }">
            {{ stockStore.remainingOf(row.part_code) }}
          </td>
          <td>{{ row.approved_by ?? "—" }}</td>
          <td><span :class="badgeClass(row.usage_status)">{{ SparePartUsageStatusText[row.usage_status] }}</span></td>
          <td v-if="canApprove" class="part-actions">
            <button
              class="btn btn--primary"
              :disabled="row.usage_status === 'APPROVED' || row.usage_status === 'RETURNED'"
              @click="emit('approve', row.id, issuedInputs[row.id])"
            >
              通过
            </button>
            <button
              class="btn btn--ghost"
              :disabled="row.usage_status === 'RETURNED'"
              @click="emit('return', row.id)"
            >
              退回
            </button>
          </td>
        </tr>
        <tr v-if="usages.length === 0">
          <td :colspan="canApprove ? 8 : 7" class="empty-cell">该工单暂无备件领用</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
