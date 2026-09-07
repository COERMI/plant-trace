<template>
  <!-- 纯 SVG 饼图 -->
  <div class="flex items-center justify-center">
    <svg :width="height" :height="height" viewBox="0 0 100 100">
      <!-- 无数据时画一个灰色圆环 -->
      <circle
        v-if="!data.length"
        cx="50" cy="50" r="40"
        fill="none" stroke="#E8EAE8" stroke-width="16"
      />
      <!-- 各扇区 -->
      <g v-for="(seg, i) in segments" :key="i">
        <path
          :d="seg.path"
          :fill="seg.color"
          :transform="`rotate(${seg.rotate} 50 50)`"
        >
          <title>{{ seg.label }}：{{ seg.value }}</title>
        </path>
      </g>
      <!-- 中心圆（甜甜圈效果） -->
      <circle cx="50" cy="50" r="24" fill="#fff" />
      <text x="50" y="47" text-anchor="middle" fill="#2A2F2A" font-size="11" font-weight="700">{{ total }}</text>
      <text x="50" y="58" text-anchor="middle" fill="#8A8F8A" font-size="6">株植物</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] }, // [{ label, value, color }]
  height: { type: Number, default: 220 }
})

const total = computed(() => props.data.reduce((s, d) => s + d.value, 0))

// 计算每个扇区的路径（从 12 点方向开始）
const segments = computed(() => {
  if (!total.value) return []
  let angle = 0
  return props.data.map((d) => {
    const sweep = (d.value / total.value) * 360
    const seg = {
      ...d,
      rotate: angle,
      path: describeArc(50, 50, 40, 0, sweep)
    }
    angle += sweep
    return seg
  })
})

// 生成扇形路径（从 0 度到 sweep 度，以圆心为原点）
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  return [
    'M', cx, cy,
    'L', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    'Z'
  ].join(' ')
}

function polarToCartesian(cx, cy, r, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians)
  }
}
</script>
