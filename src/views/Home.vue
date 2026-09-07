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

          <!-- 退出登录 -->
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

        <!-- 搜索栏 -->
        <div class="relative pb-base">
          <svg
            class="pointer-events-none absolute left-md top-1/2 -translate-y-1/2 text-neutral-placeholder"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.8" />
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索植物名称、品种..."
            class="h-11 w-full rounded-md bg-neutral-bg pl-10 pr-base text-body text-neutral-title placeholder:text-neutral-placeholder focus:border focus:border-primary focus:bg-white focus:outline-none"
          />
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
      <div v-else-if="!plantStore.plants.length" class="flex flex-col items-center py-xxl text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-bg text-neutral-border">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21c-4.5-1-7-4-7-8 0-3 2-5 5-5 1 0 1.5.5 2 1 0-1 .5-2 1.5-2.5C15 6 17 7 17 10c0 3.5-2.5 6-5 6-1.5 0-2.5-.5-3-1 .5 4-1.5 5-1.5 5"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <p class="mt-base text-body-l text-neutral-secondary">还没有植物，点击右下角 + 添加第一株</p>
      </div>

      <!-- 搜索无结果 -->
      <div v-else-if="!filteredPlants.length" class="flex flex-col items-center py-xxl text-center">
        <p class="text-body-l text-neutral-secondary">没有找到匹配的植物</p>
      </div>

      <!-- 卡片网格 -->
      <div v-else class="grid grid-cols-2 gap-md sm:grid-cols-3 sm:gap-base lg:grid-cols-4">
        <PlantCard
          v-for="plant in visiblePlants"
          :key="plant.id"
          :plant="plant"
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
import { toast } from '../utils/toast'

const router = useRouter()
const plantStore = usePlantStore()
const userStore = useUserStore()

const searchQuery = ref('')
const activeCategory = ref('')
const showPlantForm = ref(false)
const pendingDelete = ref(null)

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
})

onBeforeUnmount(() => {
  loadMoreObserver && loadMoreObserver.disconnect()
})

// 搜索 + 筛选联动
const filteredPlants = computed(() => {
  let list = plantStore.plants
  // 品类筛选
  if (activeCategory.value) {
    list = list.filter((p) => p.category === activeCategory.value)
  }
  // 关键词搜索（名称、品类、品系、品种）
  const kw = searchQuery.value.trim().toLowerCase()
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
watch([searchQuery, activeCategory], () => {
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
