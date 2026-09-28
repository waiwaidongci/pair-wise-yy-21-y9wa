<script setup lang="ts">
import { computed, ref } from "vue";
import { routes } from "./router/routes";
import StatusBadge from "./components/common/StatusBadge.vue";
import DashboardPage from "./pages/DashboardPage.vue";
import AssetsPage from "./pages/AssetsPage.vue";
import FaultsPage from "./pages/FaultsPage.vue";
import TicketsPage from "./pages/TicketsPage.vue";
import PartsPage from "./pages/PartsPage.vue";

const pages = {
  "/dashboard": DashboardPage,
  "/assets": AssetsPage,
  "/faults": FaultsPage,
  "/tickets": TicketsPage,
  "/parts": PartsPage
} as const;

const active = ref<string>(routes[0]?.route ?? "/dashboard");
const current = computed(() => routes.find((route) => route.route === active.value) ?? routes[0]);
const currentPage = computed(() => pages[active.value as keyof typeof pages] ?? DashboardPage);
</script>

<template>
  <div class="shell">
    <aside>
      <div class="brand">电力配网抢修工单系统</div>
      <nav>
        <button v-for="route in routes" :key="route.route" :class="{ active: active === route.route }" @click="active = route.route">{{ route.name }}</button>
      </nav>
    </aside>
    <main class="page">
      <section class="page-head">
        <div>
          <p class="eyebrow">grid-repair</p>
          <h1>{{ current?.name }}</h1>
        </div>
        <StatusBadge value="REPAIR_GUARD" tone="badge-ok" />
      </section>
      <component :is="currentPage" />
    </main>
  </div>
</template>
