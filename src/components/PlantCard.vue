<template>
  <div
    class="group fade-in-up relative block overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all duration-200 ease-out hover:-translate-y-1.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
    :style="{ animationDelay: `${Math.min(index * 40, 400)}ms` }"
  >
    <router-link
      :to="`/plant/${plant.id}`"
      class="block active:scale-[0.98]"
    >
      <!-- 封面图 4:3 居中裁剪 -->
      <div class="relative aspect-[4/3] w-full overflow-hidden bg-neutral-bg">
        <LazyImage
          v-if="plant.cover_image"
          :src="plant.cover_image"
          :alt="plant.name"
          wrapper-class="absolute inset-0 h-full w-full"
          img-class="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
        />
        <!-- 默认植物图标 -->
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
      </div>

      <!-- 信息区 -->
      <div class="p-base">
        <!-- 第一行：名称 + 状态圆点 -->
        <div class="flex items-center justify-between gap-sm">
          <h3 class="ellipsis text-[16px] font-bold text-neutral-title">{{ plant.name }}</h3>
          <span
            class="h-2.5 w-2.5 shrink-0 rounded-full"
            :style="{ backgroundColor: statusColor }"
            :title="plant.current_status || '未设置状态'"
          ></span>
        </div>

        <!-- 第二行：品种标签 -->
        <div class="mt-xs">
          <span
            class="inline-block rounded-sm bg-neutral-bg px-sm py-[2px] text-[12px] text-neutral-body"
          >
            {{ plant.variety || plant.strain || plant.category || '未分类' }}
          </span>
        </div>

        <!-- 第三行：入手天数 + 状态文字 -->
        <div class="mt-sm flex items-center gap-sm">
          <span class="text-[12px] text-neutral-secondary">入手 {{ daysSince(plant.acquire_date) }} 天</span>
          <span
            v-if="plant.current_status"
            class="inline-flex items-center rounded-sm px-sm py-[1px] text-[12px] font-medium"
            :style="{ backgroundColor: statusBg, color: statusColor }"
          >
            {{ plant.current_status }}
          </span>
        </div>

        <!-- 第四行：最近记录时间 -->
        <div class="mt-xs flex items-center gap-xs text-[12px] text-neutral-placeholder">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
            <polyline points="12 7 12 12 15 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{{ lastRecordText }}</span>
        </div>
      </div>
    </router-link>

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

    <!-- 多选模式复选框 -->
    <button
      v-if="selectable"
      type="button"
      class="tap-target absolute left-xs top-xs z-10 flex items-center justify-center rounded-full bg-white/80 text-neutral-secondary shadow-sm transition-colors"
      :class="isSelected ? 'text-primary' : ''"
      aria-label="选择植物"
      @click.prevent.stop="$emit('toggle-select', plant)"
    >
      <svg v-if="isSelected" width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#4A7C59" stroke="none" />
        <polyline points="8 12 11 15 16 9" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      </svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" fill="white" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import LazyImage from './LazyImage.vue'
import { daysSince } from '../utils/date'

const props = defineProps({
  plant: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  },
  // 多选模式
  selectable: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  // 最近记录时间（ISO 字符串或 null）
  lastRecordAt: {
    type: String,
    default: null
  }
})

defineEmits(['delete', 'toggle-select'])

// 状态颜色（健康绿/缓苗黄/生病红/其他灰）
const statusColor = computed(() => {
  const s = props.plant.current_status
  if (s === '健康') return '#70AD47'
  if (s === '生病') return '#C0392B'
  if (s === '缓苗中') return '#F39C12'
  if (s === '开花中') return '#E6A800'
  return '#B0B5B0'
})

const statusBg = computed(() => {
  const s = props.plant.current_status
  if (s === '健康') return '#EDF7E8'
  if (s === '生病') return '#FBEAE8'
  if (s === '缓苗中') return '#FDF0E6'
  if (s === '开花中') return '#FFF8E6'
  return '#F0F0F0'
})

const lastRecordText = computed(() => {
  if (!props.lastRecordAt) return '暂无记录'
  const days = Math.floor((Date.now() - new Date(props.lastRecordAt).getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return '最近记录：今天'
  return `最近记录：${days} 天前`
})

// 判断是否触摸设备
const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
</script>
