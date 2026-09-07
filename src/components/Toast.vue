<template>
  <!-- 全局轻提示：顶部居中滑入，自动消失 -->
  <Teleport to="body">
    <transition-group
      name="toast"
      tag="div"
      class="pointer-events-none fixed left-1/2 top-[calc(16px+env(safe-area-inset-top))] z-[100] flex w-[calc(100%-32px)] max-w-[360px] -translate-x-1/2 flex-col items-center gap-sm"
    >
      <div
        v-for="t in toastState.toasts"
        :key="t.id"
        class="pointer-events-auto flex w-full items-center gap-sm rounded-lg px-base py-md text-body shadow-lg backdrop-blur"
        :class="t.type === 'error' ? 'bg-red-600 text-white' : t.type === 'success' ? 'bg-primary text-white' : 'bg-neutral-title text-white'"
      >
        <svg v-if="t.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" class="shrink-0">
          <path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else-if="t.type === 'error'" width="18" height="18" viewBox="0 0 24 24" fill="none" class="shrink-0">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
          <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" class="shrink-0">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
          <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
        </svg>
        <span class="flex-1">{{ t.message }}</span>
      </div>
    </transition-group>
  </Teleport>
</template>

<script setup>
import { toastState } from '../utils/toast'
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
