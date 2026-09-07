<template>
  <div class="min-h-screen bg-white">
    <!-- 顶部栏 -->
    <header class="sticky top-0 z-30 border-b border-neutral-border bg-white/95 backdrop-blur">
      <div class="mx-auto max-w-[1200px] px-base sm:px-lg">
        <div class="flex items-center justify-between py-base">
          <!-- 品牌 -->
          <div class="flex items-center gap-sm">
            <div class="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21c-4.5-1-7-4-7-8 0-3 2-5 5-5 1 0 1.5.5 2 1 0-1 .5-2 1.5-2.5C15 6 17 7 17 10c0 3.5-2.5 6-5 6-1.5 0-2.5-.5-3-1 .5 4-1.5 5-1.5 5"
                  stroke="white"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span class="text-h3 text-neutral-title">植迹</span>
          </div>

          <!-- 提醒 + 退出登录 -->
          <div class="flex items-center gap-xs">
            <button
              class="relative flex h-9 w-9 items-center justify-center rounded-sm text-neutral-secondary transition-colors hover:bg-neutral-bg"
              aria-label="浇水提醒"
              @click="handleRemind"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <!-- 有待提醒的红点 -->
              <span
                v-if="duePlants.length"
                class="absolute right-xs top-xs h-2 w-2 rounded-full bg-red-500"
              ></span>
            </button>
            <button
              class="flex h-9 items-center gap-xs rounded-sm px-md text-body font-semibold text-neutral-secondary transition-colors hover:bg-neutral-bg"
              @click="handleSignOut"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              退出
            </button>
          </div>
        </div>

        <!-- 搜索栏 -->
        <div class="group relative pb-base">
          <span
            class="pointer-events-none absolute left-md top-1/2 flex -translate-y-1/2 items-center justify-center text-neutral-placeholder transition-colors group-focus-within:text-primary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.8" />
              <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索植物名称、品种..."
            class="h-11 w-full rounded-md border border-transparent bg-neutral-bg pl-10 pr-10 text-body text-neutral-title placeholder:text-neutral-placeholder transition-all duration-200 focus:border-primary focus:bg-white focus:shadow-sm focus:outline-none"
          />
          <!-- 清空按钮 -->
          <button
            v-if="searchQuery"
            type="button"
            aria-label="清空搜索"
            class="absolute right-xs top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-placeholder transition-colors hover:bg-neutral-bg hover:text-neutral-body"
            @click="searchQuery = ''"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <!-- 筛选标签栏 -->
        <div class="no-scrollbar -mx-base flex gap-sm overflow-x-auto px-base pb-base">
          <button
            class="h-7 shrink-0 whitespace-nowrap rounded-sm px-md text-caption font-semibold transition-colors"
            :class="activeCategory === '' ? 'bg-primary text-white' : 'bg-neutral-bg text-neutral-body'"
            @click="activeCategory = ''"
          >
            全部
          </button>
          <button
            v-for="cat in plantStore.categories"
            :key="cat"
            class="h-7 shrink-0 whitespace-nowrap rounded-sm px-md text-caption font-semibold transition-colors"
            :class="activeCategory === cat ? 'bg-primary text-white' : 'bg-neutral-bg text-neutral-body'"
            @click="activeCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>
    </header>

    <!-- 主体 -->
    <main class="mx-auto max-w-[1200px] px-base pb-[80px] sm:px-lg">
      <!-- 加载中（骨架屏） -->
      <div v-if="plantStore.loading" class="grid grid-cols-2 gap-md sm:grid-cols-3 sm:gap-base lg:grid-cols-4">
        <PlantCardSkeleton v-for="n in 8" :key="n" />
      </div>

      <!-- 空状态 -->
      <div v-else-if="!plantStore.plants.length" class="fade-in flex flex-col items-center py-xxl text-center">
        <div class="relative flex h-28 w-28 items-center justify-center">
          <div class="absolute inset-0 rounded-full bg-neutral-bg"></div>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" class="relative text-neutral-border">
            <path
              d="M12 21c-4.5-1-7-4-7-8 0-3 2-5 5-5 1 0 1.5.5 2 1 0-1 .5-2 1.5-2.5C15 6 17 7 17 10c0 3.5-2.5 6-5 6-1.5 0-2.5-.5-3-1 .5 4-1.5 5-1.5 5"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <p class="mt-lg text-body-l text-neutral-title">种下第一株植物吧</p>
        <p class="mt-xs text-body text-neutral-secondary">点击右下角 + 添加，开始记录它的成长</p>
      </div>

      <!-- 搜索无结果 -->
      <div v-else-if="!filteredPlants.length" class="flex flex-col items-center py-xxl text-center">
        <p class="text-body-l text-neutral-secondary">没有找到匹配的植物</p>
      </div>

      <!-- 卡片网格 -->
      <div v-else class="grid grid-cols-2 gap-md sm:grid-cols-3 sm:gap-base lg:grid-cols-4">
        <PlantCard
          v-for="(plant, i) in visiblePlants"
          :key="plant.id"
          :plant="plant"
          :index="i"
          @delete="requestDeletePlant(plant)"
        />
      </div>

      <!-- 加载更多提示 -->
      <div
        ref="loadMoreRef"
        class="flex justify-center py-base text-caption text-neutral-secondary"
      >
        <span v-if="visiblePlants.length < filteredPlants.length">
          上滑加载更多（{{ visiblePlants.length }}/{{ filteredPlants.length }}）
        </span>
        <span v-else-if="filteredPlants.length > PAGE_SIZE" class="text-neutral-placeholder">已全部加载</span>
      </div>
    </main>

    <!-- 悬浮新增按钮（safe-area 避让手势条） -->
    <button
      class="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] right-base z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl active:scale-95 sm:right-lg"
      aria-label="新增植物"
      @click="showPlantForm = true"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>

    <!-- 新增植物面板 -->
    <PlantForm v-if="showPlantForm" @close="showPlantForm = false" @saved="onSaved" />

    <!-- 删除确认弹窗 -->
    <ConfirmDialog
      v-if="pendingDelete"
      title="删除植物"
      :message="`确定要删除「${pendingDelete.name}」吗？\n其所有生长记录也会一并删除，此操作不可恢复。`"
      confirm-text="删除"
      danger
      @confirm="confirmDeletePlant"
      @cancel="pendingDelete = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import PlantCard from '../components/PlantCard.vue'
import PlantForm from '../components/PlantForm.vue'
import PlantCardSkeleton from '../components/PlantCardSkeleton.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { usePlantStore } from '../stores/plantStore'
import { useUserStore } from '../stores/userStore'
import { useRecordStore } from '../stores/recordStore'
import { supabase } from '../utils/supabase'
import { toast } from '../utils/toast'
import { notifySupported, notifyPermission, requestNotifyPermission, sendNotify } from '../utils/notify'

const router = useRouter()
const plantStore = usePlantStore()
const userStore = useUserStore()
const recordStore = useRecordStore()

const searchQuery = ref('')
const activeCategory = ref('')
const showPlantForm = ref(false)
const pendingDelete = ref(null)

// 搜索防抖：输入停止 200ms 后才真正更新过滤关键词
const debouncedQuery = ref('')
let searchTimer = null
watch(searchQuery, (val) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedQuery.value = val
  }, 200)
})

// 分页：一次最多加载 20 张卡片
const PAGE_SIZE = 20
const visibleCount = ref(PAGE_SIZE)
const loadMoreRef = ref(null)
let loadMoreObserver = null

onMounted(async () => {
  if (!plantStore.loaded) {
    await plantStore.fetchPlants()
  }
  setupLoadMore()
  // 加载提醒数据（各植物最近浇水时间）
  await loadReminders()
})

onBeforeUnmount(() => {
  loadMoreObserver && loadMoreObserver.disconnect()
})

// ===== 浇水提醒 =====
const lastWaterMap = ref({}) // plantId -> 上次浇水日期
const duePlants = computed(() => {
  const list = []
  plantStore.plants.forEach((p) => {
    const last = lastWaterMap.value[p.id]
    if (last) {
      const days = Math.floor((Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24))
      if (days >= 7) list.push({ plant: p, days })
    }
  })
  return list
})

async function loadReminders() {
  if (!plantStore.plants.length) return
  try {
    const { data, error } = await supabase
      .from('records')
      .select('plant_id, record_date')
      .eq('event_type', 'water')
      .order('record_date', { ascending: false })
    if (error) return
    const map = {}
    ;(data || []).forEach((r) => {
      if (!map[r.plant_id]) map[r.plant_id] = r.record_date
    })
    lastWaterMap.value = map
  } catch (e) {
    // 静默失败，不影响主流程
  }
}

async function handleRemind() {
  if (!notifySupported()) {
    toast.info('当前浏览器不支持系统通知，请使用 Chrome/Safari 的 PWA')
    return
  }
  // 请求权限
  const granted = await requestNotifyPermission()
  if (!granted) {
    toast.info('通知权限未开启，请在浏览器设置中允许通知')
    return
  }
  // 发送提醒
  if (duePlants.value.length) {
    const names = duePlants.value.map((d) => d.plant.name).join('、')
    sendNotify('该给植物浇水啦 💧', {
      body: `${names} 已经超过 7 天没浇水了`,
      url: '/'
    })
    toast.success(`已提醒 ${duePlants.value.length} 株植物`)
  } else {
    toast.success('所有植物都照顾得很好，暂无提醒')
  }
}

// 搜索 + 筛选联动
const filteredPlants = computed(() => {
  let list = plantStore.plants
  // 品类筛选
  if (activeCategory.value) {
    list = list.filter((p) => p.category === activeCategory.value)
  }
  // 关键词搜索（名称、品类、品系、品种）
  const kw = debouncedQuery.value.trim().toLowerCase()
  if (kw) {
    list = list.filter((p) =>
      [p.name, p.category, p.strain, p.variety].some((v) => v && v.toLowerCase().includes(kw))
    )
  }
  return list
})

// 分页后的可见列表
const visiblePlants = computed(() => filteredPlants.value.slice(0, visibleCount.value))

// 搜索/筛选变化时重置分页
watch([debouncedQuery, activeCategory], () => {
  visibleCount.value = PAGE_SIZE
})

// 滚动到底部加载更多（IntersectionObserver 监听"加载更多"提示）
function setupLoadMore() {
  if (!('IntersectionObserver' in window)) return
  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && visibleCount.value < filteredPlants.value.length) {
          visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, filteredPlants.value.length)
        }
      })
    },
    { rootMargin: '200px' }
  )
  // 观察底部哨兵节点
  watch(loadMoreRef, (el) => {
    if (el) loadMoreObserver.observe(el)
  }, { immediate: true })
}

function onSaved() {
  // 保存后无需额外操作，store 已更新
  toast.success('已保存')
}

function requestDeletePlant(plant) {
  pendingDelete.value = plant
}

async function confirmDeletePlant() {
  const plant = pendingDelete.value
  pendingDelete.value = null
  if (!plant) return
  try {
    await plantStore.deletePlant(plant.id)
    toast.success('已删除')
  } catch (e) {
    toast.error('删除失败：' + (e.message || '未知错误'))
  }
}

async function handleSignOut() {
  await userStore.signOut()
  router.replace('/login')
}
</script>
