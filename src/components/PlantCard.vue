<template>
  <router-link
    :to="`/plant/${plant.id}`"
    class="group fade-in-up relative block overflow-hidden rounded-lg bg-white shadow-md transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]"
    :style="{ animationDelay: `${Math.min(index * 40, 400)}ms` }"
  >
    <!-- 封面图 4:3 -->
    <div class="relative aspect-[4/3] w-full overflow-hidden bg-neutral-bg">
      <LazyImage
        v-if="plant.cover_image"
        :src="plant.cover_image"
        :alt="plant.name"
        wrapper-class="absolute inset-0"
        img-class="transition-transform duration-200 group-hover:scale-105"
      />
      <!-- 占位图 -->
      <div v-else class="flex h-full w-full items-center justify-center">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" class="text-neutral-border">
          <path
            d="M12 21c-4.5-1-7-4-7-8 0-3 2-5 5-5 1 0 1.5.5 2 1 0-1 .5-2 1.5-2.5C15 6 17 7 17 10c0 3.5-2.5 6-5 6-1.5 0-2.5-.5-3-1 .5 4-1.5 5-1.5 5"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- 删除按钮（悬浮于封面右上角） -->
      <button
        type="button"
        class="tap-target absolute right-xs top-xs z-10 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-red-500/80 group-hover:opacity-100 group-focus-within:opacity-100"
        :class="isTouch ? 'opacity-100' : ''"
        aria-label="删除植物"
        @click.prevent.stop="$emit('delete', plant)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6h14z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <!-- 信息区 -->
    <div class="p-base">
      <h3 class="ellipsis text-h3 font-semibold text-neutral-title">{{ plant.name }}</h3>
      <p class="ellipsis mt-xs text-caption text-primary">
        {{ plant.variety || plant.strain || plant.category || '未分类' }}
      </p>
      <p class="mt-xs text-caption text-neutral-secondary">已入手 {{ daysSince(plant.acquire_date) }} 天</p>
    </div>
  </router-link>
</template>

<script setup>
import LazyImage from './LazyImage.vue'
import { daysSince } from '../utils/date'

defineProps({
  plant: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  }
})

defineEmits(['delete'])

// 判断是否触摸设备（触摸设备始终显示删除按钮，避免 hover 不可用）
const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
</script>
