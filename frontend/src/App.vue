<script setup lang="ts">
import { computed, ref } from "vue";
import { routes } from "./router/routes";
import { mockData } from "./mocks/seedData";
import StatusBadge from "./components/common/StatusBadge.vue";
import StatCard from "./components/common/StatCard.vue";
import DashboardPage from "./pages/DashboardPage.vue";
import AssetsPage from "./pages/AssetsPage.vue";
import FaultsPage from "./pages/FaultsPage.vue";
import TicketsPage from "./pages/TicketsPage.vue";
import PartsPage from "./pages/PartsPage.vue";
import { useSessionStore } from "./stores/SessionStore";
import { Role, RoleText } from "./constants/Role";

const sessionStore = useSessionStore();
const active = ref<string>(routes[0]?.route ?? "/dashboard");
const current = computed(() => routes.find((route) => route.route === active.value) ?? routes[0]);
const entries = Object.entries(mockData);

const pageMap: Record<string, unknown> = {
  "/dashboard": DashboardPage,
  "/assets": AssetsPage,
  "/faults": FaultsPage,
  "/tickets": TicketsPage,
  "/parts": PartsPage
};
const activePage = computed(() => pageMap[active.value] ?? DashboardPage);
</script>

<template>
  <div class="shell">
    <aside>
      <div class="brand">电力配网抢修工单系统</div>
      <nav>
        <button v-for="route in routes" :key="route.route" :class="{ active: active === route.route }" @click="active = route.route">{{ route.name }}</button>
      </nav>
      <div class="role-switch">
        <label for="role-select">当前角色（RBAC）</label>
        <select id="role-select" :value="sessionStore.role" @change="sessionStore.setRole(($event.target as HTMLSelectElement).value as typeof Role[number])">
          <option v-for="role in Role" :key="role" :value="role">{{ RoleText[role] }}</option>
        </select>
      </div>
    </aside>
    <main class="page">
      <section class="page-head"><div><p class="eyebrow">grid-repair</p><h1>{{ current?.name }}</h1></div><StatusBadge value="LOCAL_DATA" /></section>

      <!-- 抢修态势页保留原有概览，其余路由切换到对应业务页面 -->
      <template v-if="active === '/dashboard'">
        <section class="metrics"><StatCard label="核心模型" :value="entries.length" /><StatCard label="共享枚举" :value="3" /><StatCard label="本地记录" :value="entries.reduce((s, [, rows]) => s + rows.length, 0)" /></section>
        <section class="workbench"><div class="panel wide"><h2>业务数据</h2><article class="row" v-for="[key, rows] in entries" :key="key"><strong>{{ key }}</strong><span>{{ rows.length }} 条</span><StatusBadge value="READY" /></article></div><div class="panel"><h2>联动检查</h2><p>复电确认已与备件逐项审批、库存扣减与退回补回联动：存在待审批或数量不足的编码时拒绝复电并列出编码。</p></div></section>
      </template>
      <component :is="activePage" v-else />
    </main>
  </div>
</template>
