<template>
  <div class="min-h-screen bg-neutral-bg">
    <!-- 顶部栏 -->
    <header class="sticky top-0 z-30 border-b border-neutral-border bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-[1200px] items-center justify-between px-base py-base sm:px-lg">
        <div class="flex items-center gap-sm">
          <div class="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <line x1="18" x2="18" y1="20" y2="10" stroke="white" stroke-width="1.8" stroke-linecap="round" />
              <line x1="12" x2="12" y1="20" y2="4" stroke="white" stroke-width="1.8" stroke-linecap="round" />
              <line x1="6" x2="6" y1="20" y2="14" stroke="white" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </div>
          <h1 class="text-h3 text-neutral-title">数据统计</h1>
        </div>
        <!-- 导出数据 -->
        <button
          class="flex h-9 items-center gap-xs rounded-sm px-md text-body font-semibold text-neutral-secondary transition-colors hover:bg-neutral-bg"
          @click="exportData"
        >
          <Icon name="download" :size="16" />
          导出数据
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-[1200px] px-base pb-[120px] sm:px-lg sm:pb-[80px]">
      <!-- 加载中 -->
      <div v-if="loading" class="flex justify-center py-xxl">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-neutral-border border-t-primary"></div>
      </div>

      <template v-else>
        <!-- 空状态 -->
        <div v-if="!plantStore.plants.length" class="flex flex-col items-center py-xxl text-center">
          <div class="flex h-28 w-28 items-center justify-center rounded-full bg-neutral-bg">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" class="text-neutral-border">
              <line x1="18" x2="18" y1="20" y2="10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <line x1="12" x2="12" y1="20" y2="4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <line x1="6" x2="6" y1="20" y2="14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
          </div>
          <p class="mt-lg text-body-l text-neutral-title">还没有数据</p>
          <p class="mt-xs text-body text-neutral-secondary">添加植物和生长记录后，这里会展示统计图表</p>
        </div>

        <template v-else>
          <!-- 顶部 4 个数据卡片（2x2） -->
          <div class="grid grid-cols-2 gap-md">
            <div class="rounded-lg bg-white p-base shadow-md">
              <div class="flex items-center gap-sm text-neutral-secondary">
                <Icon name="leaf" :size="18" />
                <span class="text-caption">总植物数</span>
              </div>
              <p class="mt-sm text-h2 text-neutral-title">{{ plantStore.plants.length }}</p>
            </div>
            <div class="rounded-lg bg-white p-base shadow-md">
              <div class="flex items-center gap-sm text-neutral-secondary">
                <Icon name="file-text" :size="18" />
                <span class="text-caption">总记录数</span>
              </div>
              <p class="mt-sm text-h2 text-neutral-title">{{ allRecords.length }}</p>
            </div>
            <div class="rounded-lg bg-white p-base shadow-md">
              <div class="flex items-center gap-sm text-neutral-secondary">
                <Icon name="calendar" :size="18" />
                <span class="text-caption">总入手天数</span>
              </div>
              <p class="mt-sm text-h2 text-neutral-title">{{ totalDays }}</p>
            </div>
            <div class="rounded-lg bg-white p-base shadow-md">
              <div class="flex items-center gap-sm text-neutral-secondary">
                <Icon name="flower-2" :size="18" />
                <span class="text-caption">今年开花次数</span>
              </div>
              <p class="mt-sm text-h2 text-neutral-title">{{ thisYearBloom }}</p>
            </div>
          </div>

          <!-- 饼图：品类占比 -->
          <div class="mt-lg rounded-lg bg-white p-base shadow-md">
            <h2 class="text-h3 text-neutral-title">品类占比</h2>
            <div v-if="categoryData.length" class="mt-md flex flex-col items-center gap-lg sm:flex-row sm:items-center">
              <PieChart :data="categoryData" :height="220" />
              <!-- 图例 -->
              <div class="flex flex-wrap justify-center gap-sm sm:flex-col sm:items-start">
                <div v-for="d in categoryData" :key="d.label" class="flex items-center gap-sm">
                  <span class="h-3 w-3 rounded-sm" :style="{ backgroundColor: d.color }"></span>
                  <span class="text-caption text-neutral-body">{{ d.label }}（{{ d.value }}）</span>
                </div>
              </div>
            </div>
            <div v-else class="flex h-[220px] items-center justify-center text-body text-neutral-secondary">暂无品类数据</div>
          </div>

          <!-- 折线图：近6个月记录趋势 -->
          <div class="mt-lg rounded-lg bg-white p-base shadow-md">
            <h2 class="text-h3 text-neutral-title">近 6 个月记录趋势</h2>
            <div v-if="hasMonthlyData" class="mt-md">
              <LineChart :labels="monthlyLabels" :values="monthlyValues" :height="250" />
            </div>
            <div v-else class="flex h-[250px] items-center justify-center text-body text-neutral-secondary">暂无记录数据</div>
          </div>

          <!-- 柱状图：事件类型统计 -->
          <div class="mt-lg rounded-lg bg-white p-base shadow-md">
            <h2 class="text-h3 text-neutral-title">事件类型统计</h2>
            <div v-if="eventStats.length" class="mt-md">
              <BarChart :data="eventStats" :height="250" />
            </div>
            <div v-else class="flex h-[250px] items-center justify-center text-body text-neutral-secondary">暂无事件数据</div>
          </div>

          <!-- 最近活动列表 -->
          <div class="mt-lg rounded-lg bg-white p-base shadow-md">
            <h2 class="text-h3 text-neutral-title">最近活动</h2>
            <div v-if="recentActivities.length" class="mt-md flex flex-col divide-y divide-neutral-border">
              <div
                v-for="act in recentActivities"
                :key="act.id"
                class="flex items-center gap-md py-md"
              >
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" :style="{ backgroundColor: act.bg }">
                  <Icon :name="act.icon" :size="16" :color="act.color" />
                </span>
                <div class="min-w-0 flex-1">
                  <p class="ellipsis text-body font-medium text-neutral-title">{{ act.plantName }}</p>
                  <p class="text-caption text-neutral-secondary">{{ act.label }}</p>
                </div>
                <span class="shrink-0 text-caption text-neutral-placeholder">{{ act.timeText }}</span>
              </div>
            </div>
            <div v-else class="flex flex-col items-center py-xl text-center text-body text-neutral-secondary">
              暂无生长记录
            </div>
          </div>
        </template>
      </template>
    </main>

    <!-- 底部导航栏（手机端） -->
    <nav
      class="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-border bg-white/95 backdrop-blur sm:hidden"
      style="padding-bottom: env(safe-area-inset-bottom)"
    >
      <div class="flex h-14 items-center">
        <router-link
          to="/"
          class="flex flex-1 flex-col items-center justify-center gap-[2px] text-neutral-secondary"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="text-[11px] font-semibold">首页</span>
        </router-link>
        <router-link
          to="/stats"
          class="flex flex-1 flex-col items-center justify-center gap-[2px] text-primary"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <line x1="18" x2="18" y1="20" y2="10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            <line x1="12" x2="12" y1="20" y2="4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            <line x1="6" x2="6" y1="20" y2="14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <span class="text-[11px] font-semibold">统计</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '../components/Icon.vue'
import PieChart from '../components/charts/PieChart.vue'
import LineChart from '../components/charts/LineChart.vue'
import BarChart from '../components/charts/BarChart.vue'
import { usePlantStore } from '../stores/plantStore'
import { useUserStore } from '../stores/userStore'
import { supabase } from '../utils/supabase'
import { getEventType } from '../utils/constants'
import { formatDateTime, daysSince } from '../utils/date'
import { toast } from '../utils/toast'

const router = useRouter()
const plantStore = usePlantStore()
const userStore = useUserStore()

const loading = ref(true)
const allRecords = ref([])

onMounted(async () => {
  try {
    if (!plantStore.loaded) await plantStore.fetchPlants()
    // 拉取当前用户所有记录
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .order('record_date', { ascending: false })
    if (error) throw error
    allRecords.value = data || []
  } catch (e) {
    toast.error('加载统计失败：' + (e.message || '未知错误'))
  } finally {
    loading.value = false
  }
})

// ===== 顶部数据卡片 =====
const totalDays = computed(() => {
  return plantStore.plants.reduce((sum, p) => sum + daysSince(p.acquire_date), 0)
})

const thisYearBloom = computed(() => {
  const year = new Date().getFullYear()
  return allRecords.value.filter((r) => {
    return r.event_type === 'bloom' && new Date(r.record_date).getFullYear() === year
  }).length
})

// ===== 饼图数据（品类占比）=====
const CATEGORY_COLORS = ['#4A7C59', '#5B9BD5', '#ED7D31', '#7030A0', '#FFC000', '#C0392B', '#70AD47', '#A5A5A5', '#E6A800', '#5A8F6A']
const categoryData = computed(() => {
  const map = {}
  plantStore.plants.forEach((p) => {
    const cat = (p.category && p.category.trim()) || '未分类'
    map[cat] = (map[cat] || 0) + 1
  })
  return Object.entries(map)
    .map(([label, value], i) => ({ label, value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))
    .sort((a, b) => b.value - a.value)
})

// ===== 折线图数据（近6个月）=====
const monthlyLabels = computed(() => {
  const labels = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return labels
})

const monthlyValues = computed(() => {
  const now = new Date()
  const values = new Array(6).fill(0)
  allRecords.value.forEach((r) => {
    const d = new Date(r.record_date)
    const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
    if (diff >= 0 && diff < 6) {
      values[5 - diff]++
    }
  })
  return values
})

const hasMonthlyData = computed(() => monthlyValues.value.some((v) => v > 0))

// ===== 柱状图数据（事件类型）=====
const eventStats = computed(() => {
  const map = {}
  allRecords.value.forEach((r) => {
    map[r.event_type] = (map[r.event_type] || 0) + 1
  })
  return Object.entries(map)
    .map(([key, count]) => ({ key, label: getEventType(key).label, color: getEventType(key).color, value: count }))
    .sort((a, b) => b.value - a.value)
})

// ===== 最近活动 =====
const recentActivities = computed(() => {
  const plantMap = {}
  plantStore.plants.forEach((p) => (plantMap[p.id] = p))
  return allRecords.value.slice(0, 10).map((r) => {
    const et = getEventType(r.event_type)
    return {
      id: r.id,
      plantName: plantMap[r.plant_id]?.name || '未知植物',
      label: et.label,
      icon: et.icon,
      color: et.color,
      bg: et.bg,
      timeText: formatDateTime(r.record_date)
    }
  })
})

// ===== 导出数据 =====
function exportData() {
  try {
    const data = {
      exported_at: new Date().toISOString(),
      plants: plantStore.plants,
      records: allRecords.value
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `植迹数据导出-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('数据已导出')
  } catch (e) {
    toast.error('导出失败：' + (e.message || '未知错误'))
  }
}
</script>
