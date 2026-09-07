<template>
  <!-- 时间线单条记录卡片 -->
  <div
    class="fade-in-up group relative overflow-hidden rounded-[16px] bg-white p-[16px] shadow-md transition-shadow hover:shadow-lg"
    :style="{ animationDelay: `${index * 50}ms` }"
  >
    <!-- hover 时左侧 3px 彩色竖线 -->
    <span
      class="absolute left-0 top-0 h-full w-[3px] opacity-0 transition-opacity group-hover:opacity-100"
      :style="{ backgroundColor: type.color }"
    ></span>

    <!-- 头部：事件标签（左上角） + 时间 -->
    <div class="flex items-center justify-between">
      <EventTag :type="record.event_type" />
      <span class="text-caption text-neutral-secondary">{{ formatDateTime(record.record_date) }}</span>
    </div>

    <!-- 照片区 -->
    <div v-if="record.images && record.images.length" class="mt-md">
      <!-- 单张：全宽 4:3 -->
      <div v-if="record.images.length === 1" class="overflow-hidden rounded-sm">
        <LazyImage
          :src="record.images[0]"
          alt="记录照片"
          wrapper-class="aspect-[4/3] w-full"
          img-class="h-full w-full cursor-pointer object-cover object-center"
          @click="openLightbox(0)"
        />
      </div>
      <!-- 2张：各半，4px 间距 -->
      <div v-else-if="record.images.length === 2" class="grid grid-cols-2 gap-xs">
        <LazyImage
          v-for="(img, i) in record.images"
          :key="i"
          :src="img"
          alt="记录照片"
          wrapper-class="aspect-[4/3] w-full overflow-hidden rounded-sm"
          img-class="h-full w-full cursor-pointer object-cover object-center"
          @click="openLightbox(i)"
        />
      </div>
      <!-- 3张及以上：3列网格，4px 间距，统一 4:3 -->
      <div v-else class="grid grid-cols-3 gap-xs">
        <LazyImage
          v-for="(img, i) in record.images"
          :key="i"
          :src="img"
          alt="记录照片"
          wrapper-class="aspect-[4/3] w-full overflow-hidden rounded-sm"
          img-class="h-full w-full cursor-pointer object-cover object-center"
          @click="openLightbox(i)"
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

    <!-- Lightbox 大图查看 -->
    <Teleport to="body">
      <div
        v-if="lightboxOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
        @click.self="closeLightbox"
      >
        <!-- 关闭按钮 -->
        <button
          class="absolute right-base top-base flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
          aria-label="关闭"
          @click="closeLightbox"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>

        <!-- 上一张 -->
        <button
          v-if="record.images.length > 1"
          class="absolute left-base top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
          aria-label="上一张"
          @click.stop="prevImage"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <polyline points="15 18 9 12 15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <!-- 图片 -->
        <img
          :src="record.images[currentIndex]"
          class="max-h-[85vh] max-w-[92vw] rounded-sm object-contain"
          alt="记录照片大图"
        />

        <!-- 下一张 -->
        <button
          v-if="record.images.length > 1"
          class="absolute right-base top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
          aria-label="下一张"
          @click.stop="nextImage"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <polyline points="9 18 15 12 9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <!-- 计数器 -->
        <span v-if="record.images.length > 1" class="absolute bottom-base left-1/2 -translate-x-1/2 text-caption text-white/80">
          {{ currentIndex + 1 }} / {{ record.images.length }}
        </span>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import EventTag from './EventTag.vue'
import LazyImage from './LazyImage.vue'
import { formatDateTime } from '../utils/date'
import { getEventType } from '../utils/constants'

const props = defineProps({
  record: { type: Object, required: true },
  index: { type: Number, default: 0 }
})

defineEmits(['edit', 'delete'])

const type = computed(() => getEventType(props.record.event_type))

// Lightbox 状态
const lightboxOpen = ref(false)
const currentIndex = ref(0)

function openLightbox(index) {
  currentIndex.value = index
  lightboxOpen.value = true
}

function closeLightbox() {
  lightboxOpen.value = false
}

function prevImage() {
  const len = props.record.images.length
  currentIndex.value = (currentIndex.value - 1 + len) % len
}

function nextImage() {
  const len = props.record.images.length
  currentIndex.value = (currentIndex.value + 1) % len
}

// 键盘左右切换 + ESC 关闭
function onKeydown(e) {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
}

import { onMounted } from 'vue'
onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>
