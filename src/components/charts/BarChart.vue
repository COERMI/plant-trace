<template>
  <!-- 纯 SVG 柱状图（横向条形，固定容器高度，数据多时不溢出） -->
  <div class="w-full overflow-hidden" :style="{ height: height + 'px' }">
    <svg
      :viewBox="`0 0 ${W} ${height}`"
      preserveAspectRatio="none"
      class="w-full"
      :style="{ height: height + 'px' }"
    >
      <g v-for="(d, i) in data" :key="d.key">
        <!-- 标签 -->
        <text
          :x="LABEL_W - 6"
          :y="barY(i) + barH / 2 + 4"
          text-anchor="end"
          fill="#5A5F5A"
          font-size="11"
        >
          {{ d.label }}
        </text>
        <!-- 条形背景 -->
        <rect
          :x="LABEL_W"
          :y="barY(i)"
          :width="BAR_MAX"
          :height="barH"
          rx="4"
          fill="#F7F8F7"
        />
        <!-- 条形 -->
        <rect
          :x="LABEL_W"
          :y="barY(i)"
          :width="barW(d.value)"
          :height="barH"
          rx="4"
          :fill="d.color"
        >
          <title>{{ d.label }}：{{ d.value }} 次</title>
        </rect>
        <!-- 数值 -->
        <text
          :x="LABEL_W + barW(d.value) + 6"
          :y="barY(i) + barH / 2 + 4"
          fill="#8A8F8A"
          font-size="10"
        >
          {{ d.value }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] }, // [{ key, label, color, value }]
  height: { type: Number, default: 250 }
})

const LABEL_W = 52
const W = 600
const BAR_MAX = W - LABEL_W - 50 // 右侧留白给数值

// 条高：在固定容器高度内，根据数据条数动态分配（最小 8px），保证不溢出
const barH = computed(() => {
  const n = props.data.length || 1
  const gap = 8 // 条间距
  const usable = props.height - 16 - (n - 1) * gap // 上下各留 8px padding
  return Math.max(8, Math.min(28, usable / n))
})

const maxVal = computed(() => Math.max(...props.data.map((d) => d.value), 1))

function barY(i) {
  return 8 + i * (barH.value + 8)
}

function barW(value) {
  return Math.max(2, (value / maxVal.value) * BAR_MAX)
}
</script>
