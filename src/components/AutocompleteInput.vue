<template>
  <!-- 带联想提示的文本输入框 -->
  <div class="relative">
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="h-12 w-full rounded-md border border-neutral-border bg-white px-base text-body-l text-neutral-title placeholder:text-neutral-placeholder focus:border-primary focus:shadow-focus-primary focus:outline-none"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="showList = true"
      @blur="hideList"
    />
    <!-- 联想下拉 -->
    <ul
      v-if="showList && filtered.length"
      class="absolute left-0 right-0 top-full z-10 mt-xs max-h-40 overflow-y-auto rounded-md border border-neutral-border bg-white py-xs shadow-lg"
    >
      <li
        v-for="s in filtered"
        :key="s"
        class="cursor-pointer px-base py-sm text-body text-neutral-body hover:bg-neutral-bg"
        @mousedown.prevent="select(s)"
      >
        {{ s }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  suggestions: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const showList = ref(false)

// 过滤：包含输入内容、且不同于当前已输入的完整值
const filtered = computed(() => {
  const kw = (props.modelValue || '').trim()
  if (!kw) return props.suggestions.slice(0, 6)
  return props.suggestions.filter((s) => s.includes(kw) && s !== kw).slice(0, 6)
})

function select(value) {
  showList.value = false
  emit('update:modelValue', value)
}

function hideList() {
  // 延迟隐藏，让 mousedown 事件先触发
  setTimeout(() => {
    showList.value = false
  }, 150)
}
</script>
