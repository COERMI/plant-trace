<template>
  <!-- 纯 SVG 折线图 -->
  <div class="w-full overflow-hidden" :style="{ height: height + 'px' }">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="none"
      class="w-full"
      :style="{ height: height + 'px' }"
    >
      <!-- 网格线（水平） -->
      <g v-for="i in 4" :key="'h' + i">
        <line
          :x1="PAD_L" :x2="W - PAD_R"
          :y1="PAD_T + (i - 1) * (chartH / 3)"
          :y2="PAD_T + (i - 1) * (chartH / 3)"
          stroke="#E8EAE8" stroke-width="1"
        />
      </g>

      <!-- 折线 -->
      <polyline
        v-if="points.length > 1"
        :points="points.map((p) => `${p.x},${p.y}`).join(' ')"
        fill="none"
        stroke="#4A7C59"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- 数据点 -->
      <g v-for="(p, i) in points" :key="'p' + i">
        <circle :cx="p.x" :cy="p.y" r="3.5" fill="#4A7C59">
          <title>{{ labels[i] }}：{{ values[i] }} 条</title>
        </circle>
      </g>

      <!-- X 轴标签 -->
      <g v-for="(label, i) in labels" :key="'x' + i">
        <text
          :x="points[i].x"
          :y="H - 4"
          text-anchor="middle"
          fill="#8A8F8A"
          font-size="10"
        >
          {{ label.slice(2) }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
  height: { type: Number, default: 250 }
})

const W = 600
const H = computed(() => props.height)
const PAD_L = 20
const PAD_R = 20
const PAD_T = 16
const PAD_B = 30
const chartW = W - PAD_L - PAD_R
const chartH = computed(() => props.height - PAD_T - PAD_B)

const maxVal = computed(() => Math.max(...props.values, 1))

const points = computed(() => {
  const n = props.values.length
  if (!n) return []
  const step = n > 1 ? chartW / (n - 1) : 0
  const h = chartH.value
  return props.values.map((v, i) => ({
    x: PAD_L + i * step,
    y: PAD_T + h - (v / maxVal.value) * h
  }))
})
</script>
