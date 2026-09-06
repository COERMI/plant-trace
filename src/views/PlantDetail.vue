<template>
  <div v-if="plant" class="min-h-screen bg-white pb-[80px]">
    <!-- 顶部封面区 -->
    <div class="relative h-[200px] w-full sm:h-[280px]">
      <LazyImage
        v-if="plant.cover_image"
        :src="plant.cover_image"
        :alt="plant.name"
        wrapper-class="absolute inset-0 h-full w-full"
      />
      <div v-else class="h-full w-full bg-neutral-bg"></div>
      <!-- 渐变遮罩 -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10"></div>

      <!-- 返回按钮 -->
      <button
        class="absolute left-base top-base flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/40 sm:left-lg sm:top-lg"
        @click="router.back()"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <!-- 编辑按钮 -->
      <button
        class="absolute right-base top-base flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/40 sm:right-lg sm:top-lg"
        @click="showEditPlant = true"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <!-- 封面叠加信息 -->
      <div class="absolute bottom-base left-base right-base sm:bottom-lg sm:left-lg sm:right-lg">
        <h1 class="text-h1 text-white">{{ plant.name }}</h1>
        <!-- 标签行 -->
        <p v-if="tagLine" class="mt-xs text-caption text-white/90">{{ tagLine }}</p>
        <p class="mt-xs text-caption text-white/80">
          入手于 {{ formatDate(plant.acquire_date) }} · 已入手 {{ daysSince(plant.acquire_date) }} 天
        </p>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="mx-auto max-w-[680px] px-base sm:px-lg">
      <!-- 基础信息卡 -->
      <div class="mt-lg rounded-lg bg-white p-base shadow-md">
        <div v-if="plant.acquire_source" class="flex items-center gap-sm text-body text-neutral-body">
          <span class="text-neutral-secondary">来源：</span>{{ plant.acquire_source }}
        </div>
        <div v-if="plant.current_status" class="mt-sm flex items-center gap-sm text-body">
          <span class="text-neutral-secondary">当前状态：</span>
          <span
            class="inline-flex h-7 items-center rounded-sm px-md text-caption font-semibold"
            :style="statusStyle"
          >
            {{ plant.current_status }}
          </span>
        </div>
        <p v-if="plant.notes" class="mt-sm whitespace-pre-wrap text-body text-neutral-body">{{ plant.notes }}</p>
      </div>

      <!-- 事件统计区 -->
      <div v-if="stats.length" class="mt-lg">
        <div class="no-scrollbar flex gap-sm overflow-x-auto">
          <div
            v-for="s in stats"
            :key="s.key"
            class="flex shrink-0 flex-col items-center rounded-md bg-white px-lg py-md shadow-md"
          >
            <span class="flex items-center gap-xs text-h3" :style="{ color: s.text }">
              <Icon :name="s.icon" :size="20" :color="s.text" />
              {{ s.count }}
            </span>
            <span class="mt-xs text-caption text-neutral-secondary">{{ s.label }}</span>
          </div>
        </div>
      </div>

      <!-- 时间线标题 -->
      <div class="mt-xl">
        <h2 class="text-h2 text-neutral-title">生长记录</h2>
      </div>

      <!-- 时间线 -->
      <div v-if="records.length" class="mt-base">
        <div class="relative pl-lg">
          <!-- 轴线 -->
          <div class="absolute left-[5px] top-0 bottom-0 w-[2px] bg-neutral-border"></div>

          <!-- 记录列表 -->
          <div class="flex flex-col gap-base sm:gap-xl">
            <div
              v-for="(record, i) in records"
              :key="record.id"
              class="relative"
            >
              <!-- 节点圆点 -->
              <span
                class="absolute -left-lg top-6 h-3 w-3 -translate-x-1/2 rounded-full border-2 bg-white"
                :style="{ borderColor: getEventType(record.event_type).color }"
              ></span>
              <!-- 记录卡片 -->
              <TimelineItem
                :record="record"
                :index="i"
                @edit="openEditRecord(record)"
                @delete="requestDeleteRecord(record)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!recordStore.loading" class="flex flex-col items-center py-xl text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-bg text-neutral-border">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </div>
        <p class="mt-base text-body-l text-neutral-secondary">还没有生长记录，点击右下角 + 记录第一条</p>
      </div>
    </div>

    <!-- 悬浮新增记录按钮（safe-area 避让手势条） -->
    <button
      class="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] right-base z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl active:scale-95 sm:right-lg"
      aria-label="新增记录"
      @click="showAddRecord = true"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>

    <!-- 编辑植物面板 -->
    <PlantForm
      v-if="showEditPlant"
      :plant="plant"
      @close="showEditPlant = false"
      @saved="onPlantSaved"
    />

    <!-- 新增记录面板 -->
    <RecordForm
      v-if="showAddRecord"
      :plant-id="plant.id"
      @close="showAddRecord = false"
      @saved="onRecordSaved"
    />

    <!-- 编辑记录面板 -->
    <RecordForm
      v-if="editingRecord"
      :plant-id="plant.id"
      :record="editingRecord"
      @close="editingRecord = null"
      @saved="onRecordSaved"
    />
  </div>

  <!-- 加载中 -->
  <div v-else class="flex min-h-screen items-center justify-center">
    <div class="h-8 w-8 animate-spin rounded-full border-2 border-neutral-border border-t-primary"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PlantForm from '../components/PlantForm.vue'
import RecordForm from '../components/RecordForm.vue'
import TimelineItem from '../components/TimelineItem.vue'
import LazyImage from '../components/LazyImage.vue'
import Icon from '../components/Icon.vue'
import { usePlantStore } from '../stores/plantStore'
import { useRecordStore } from '../stores/recordStore'
import { getEventType } from '../utils/constants'
import { formatDate, daysSince } from '../utils/date'

const route = useRoute()
const router = useRouter()
const plantStore = usePlantStore()
const recordStore = useRecordStore()

const plantId = route.params.id
const showEditPlant = ref(false)
const showAddRecord = ref(false)
const editingRecord = ref(null)

const plant = computed(() => plantStore.plants.find((p) => p.id === plantId) || null)
const records = computed(() => recordStore.recordsByPlant[plantId] || [])

onMounted(async () => {
  if (!plantStore.loaded) await plantStore.fetchPlants()
  await recordStore.fetchRecords(plantId)
})

// 标签行：品类 / 品系 / 品种
const tagLine = computed(() => {
  if (!plant.value) return ''
  return [plant.value.category, plant.value.strain, plant.value.variety]
    .filter(Boolean)
    .join(' · ')
})

// 当前状态标签颜色
const statusStyle = computed(() => {
  const s = plant.value?.current_status
  if (s === '健康') return { backgroundColor: '#EDF7E8', color: '#70AD47' }
  if (s === '生病') return { backgroundColor: '#FBEAE8', color: '#C0392B' }
  if (s === '开花中') return { backgroundColor: '#FFF8E6', color: '#E6A800' }
  if (s === '缓苗中') return { backgroundColor: '#E8F2F9', color: '#5B9BD5' }
  return { backgroundColor: '#F0F0F0', color: '#808080' }
})

// 事件统计（仅显示有记录的）
const stats = computed(() => {
  const map = {}
  records.value.forEach((r) => {
    map[r.event_type] = (map[r.event_type] || 0) + 1
  })
  return Object.entries(map)
    .map(([key, count]) => ({ key, count, ...getEventType(key) }))
    .sort((a, b) => b.count - a.count)
})

async function onPlantSaved() {
  // 若植物被删除，返回首页
  if (!plantStore.plants.find((p) => p.id === plantId)) {
    router.replace('/')
  }
}

async function onRecordSaved() {
  await recordStore.fetchRecords(plantId)
}

function openEditRecord(record) {
  editingRecord.value = record
}

function requestDeleteRecord(record) {
  if (confirm('确定要删除这条记录吗？此操作不可恢复。')) {
    deleteRecord(record)
  }
}

async function deleteRecord(record) {
  try {
    await recordStore.deleteRecord(record.id, plantId)
  } catch (e) {
    alert('删除失败：' + (e.message || '未知错误'))
  }
}
</script>
