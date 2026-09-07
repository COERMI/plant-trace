<template>
  <div class="animate-pulse space-y-3">
    <div v-for="i in rows" :key="i" class="h-4 bg-gray-100 rounded" :style="{ width: i === rows ? '60%' : '100%' }"></div>
  </div>
</template>

<script setup>
defineProps({
  rows: { type: Number, default: 3 }
})
</script>
