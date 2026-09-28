<script setup lang="ts">
defineProps<{ value: string; tone?: string }>();
</script>

<template><span class="badge" :class="tone ?? ''">{{ value.replace(/_/g, " ") }}</span></template>
