<template>
  <!-- 事件标签（浅背景 + 深文字 + 线性图标） -->
  <span
    class="inline-flex h-7 items-center rounded-sm px-md text-caption font-semibold"
    :style="{ backgroundColor: type.bg, color: type.text }"
  >
    <Icon :name="type.icon" :size="14" :color="type.text" class="mr-xs" />
    {{ type.label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'
import { getEventType } from '../utils/constants'

const props = defineProps({
  type: {
    type: String,
    required: true
  }
})

const type = computed(() => getEventType(props.type))
</script>
