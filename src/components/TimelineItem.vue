<template>
  <!-- 时间线单条记录卡片 -->
  <div
    class="fade-in-up"
    :style="{ animationDelay: `${index * 50}ms` }"
  >
    <div class="rounded-lg bg-white p-base shadow-md">
      <!-- 头部：事件标签 + 时间 -->
      <div class="flex items-center justify-between">
        <EventTag :type="record.event_type" />
        <span class="text-caption text-neutral-secondary">{{ formatDateTime(record.record_date) }}</span>
      </div>

      <!-- 照片区 -->
      <div v-if="record.images && record.images.length" class="mt-md">
        <!-- 单张：全宽 -->
        <div v-if="record.images.length === 1" class="overflow-hidden rounded-sm">
          <LazyImage
            :src="record.images[0]"
            alt="记录照片"
            wrapper-class="max-h-[400px] w-full"
            img-class="cursor-pointer"
            @click="openLightbox(record.images[0])"
          />
        </div>
        <!-- 2张：各半 -->
        <div v-else-if="record.images.length === 2" class="grid grid-cols-2 gap-xs">
          <LazyImage
            v-for="(img, i) in record.images"
            :key="i"
            :src="img"
            alt="记录照片"
            wrapper-class="aspect-square w-full rounded-sm"
            img-class="cursor-pointer"
            @click="openLightbox(img)"
          />
        </div>
        <!-- 3张以上：3列网格 -->
        <div v-else class="grid grid-cols-3 gap-xs">
          <LazyImage
            v-for="(img, i) in record.images"
            :key="i"
            :src="img"
            alt="记录照片"
            wrapper-class="aspect-square w-full rounded-sm"
            img-class="cursor-pointer"
            @click="openLightbox(img)"
          />
        </div>
      </div>

      <!-- 文字内容 -->
      <p v-if="record.content" class="mt-md whitespace-pre-wrap text-body text-neutral-body">
        {{ record.content }}
      </p>

      <!-- 操作区 -->
      <div class="mt-md flex justify-end gap-sm border-t border-neutral-border pt-md">
        <button
          class="flex h-9 items-center gap-xs rounded-sm px-md text-body font-semibold text-neutral-secondary transition-colors hover:bg-neutral-bg"
          @click="$emit('edit', record)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          编辑
        </button>
        <button
          class="flex h-9 items-center gap-xs rounded-sm px-md text-body font-semibold text-danger transition-colors hover:bg-red-50"
          @click="$emit('delete', record)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6h14z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          删除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import EventTag from './EventTag.vue'
import LazyImage from './LazyImage.vue'
import { formatDateTime } from '../utils/date'

defineProps({
  record: { type: Object, required: true },
  index: { type: Number, default: 0 }
})

defineEmits(['edit', 'delete'])

function openLightbox(url) {
  // 点击查看大图
  const win = window.open(url, '_blank')
  if (win) win.opener = null
}
</script>
