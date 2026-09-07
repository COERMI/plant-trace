<template>
  <div class="rounded-lg bg-white p-base shadow-md">
    <div class="mb-md flex items-center gap-sm text-caption text-neutral-secondary">
      <svg class="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path v-if="icon === 'globe'" d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9"/>
        <ellipse v-else-if="icon === 'db'" cx="12" cy="5" rx="9" ry="3"/><path v-if="icon === 'db'" d="M3 5v14a9 3 0 0 0 18 0V5"/><path v-if="icon === 'db'" d="M3 12a9 3 0 0 0 18 0"/>
        <g v-else-if="icon === 'hard-drive'"><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/></g>
        <g v-else-if="icon === 'users'"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></g>
      </svg>
      <span class="font-semibold">{{ title }}</span>
    </div>
    <div v-if="loading" class="animate-pulse space-y-sm">
      <div class="h-6 w-20 rounded bg-neutral-bg"></div>
      <div class="h-3 w-28 rounded bg-neutral-bg"></div>
    </div>
    <slot v-else />
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: 'globe' },
  loading: { type: Boolean, default: false }
})
</script>
