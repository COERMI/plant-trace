<template>
  <!--
    懒加载图片组件：
    - 使用 IntersectionObserver，滚动到可视区域才真正加载 src
    - 加载前显示骨架屏（shimmer），加载完成后淡入
  -->
  <div ref="root" class="relative overflow-hidden" :class="wrapperClass">
    <!-- 骨架屏 -->
    <div v-if="!loaded" class="skeleton absolute inset-0"></div>
    <!-- 真实图片 -->
    <img
      v-if="loaded"
      :src="src"
      :alt="alt"
      loading="lazy"
      class="lazy-img h-full w-full object-cover"
      :class="imgClass"
      @click="$emit('click', $event)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  wrapperClass: { type: String, default: '' },
  imgClass: { type: String, default: '' }
})

defineEmits(['click'])

const root = ref(null)
const loaded = ref(false)
let observer = null

onMounted(() => {
  if (!root.value) return

  if (!('IntersectionObserver' in window)) {
    // 降级：直接加载
    loaded.value = true
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loaded.value = true
          observer && observer.disconnect()
        }
      })
    },
    { rootMargin: '200px' } // 提前 200px 预加载，避免滚动时白屏
  )
  observer.observe(root.value)
})

onBeforeUnmount(() => {
  observer && observer.disconnect()
})
</script>

<style scoped>
/* 骨架屏微光动画 */
.skeleton {
  background: linear-gradient(100deg, #f0f1f0 40%, #f7f8f7 50%, #f0f1f0 60%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 图片淡入 */
.lazy-img {
  opacity: 0;
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
