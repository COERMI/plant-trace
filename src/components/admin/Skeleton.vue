<template>
  <div class="animate-pulse space-y-md">
    <div v-for="i in rows" :key="i" class="h-4 rounded bg-neutral-bg" :style="{ width: i === rows ? '60%' : '100%' }"></div>
  </div>
</template>

<script setup>
defineProps({
  rows: { type: Number, default: 3 }
})
</script>
