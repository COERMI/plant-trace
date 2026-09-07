<template>
  <!-- 统一确认弹窗（替换原生 confirm） -->
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-base"
      @click.self="onCancel"
    >
      <div class="modal-in w-full max-w-[320px] rounded-lg bg-white shadow-xl">
        <!-- 标题 + 说明 -->
        <div class="px-lg pt-lg pb-base text-center">
          <div class="mx-auto mb-base flex h-12 w-12 items-center justify-center rounded-full" :class="danger ? 'bg-red-50 text-danger' : 'bg-neutral-bg text-neutral-secondary'">
            <svg v-if="danger" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6h14z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8" />
              <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
          <h3 class="text-h3 font-semibold text-neutral-title">{{ title }}</h3>
          <p v-if="message" class="mt-sm whitespace-pre-wrap text-body text-neutral-secondary">{{ message }}</p>
        </div>

        <!-- 按钮 -->
        <div class="flex gap-md border-t border-neutral-border px-lg py-base">
          <button
            class="h-11 flex-1 rounded-md border border-neutral-border bg-white text-body-l font-semibold text-neutral-body transition-colors hover:bg-neutral-bg"
            @click="onCancel"
          >
            {{ cancelText }}
          </button>
          <button
            class="h-11 flex-1 rounded-md text-body-l font-semibold text-white transition-all active:scale-[0.98]"
            :class="danger ? 'bg-danger hover:bg-red-600' : 'bg-primary hover:bg-primary-hover'"
            @click="onConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  title: { type: String, default: '确认操作' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' },
  danger: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'cancel'])

function onConfirm() {
  emit('confirm')
}
function onCancel() {
  emit('cancel')
}
</script>
