<template>
  <div class="admin-dashboard min-h-screen bg-neutral-bg text-neutral-body">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-10 border-b border-neutral-border bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-[1200px] items-center justify-between px-base py-base sm:px-lg">
        <div class="flex items-center gap-sm">
          <div class="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-h3 leading-tight text-neutral-title">管理员后台</h1>
            <p class="text-caption text-neutral-secondary">植迹 PlantTrace</p>
          </div>
        </div>

        <div class="flex items-center gap-sm sm:gap-md">
          <span class="hidden text-caption text-neutral-secondary sm:inline">最后刷新：{{ lastRefresh }}</span>
          <button
            @click="refreshAll"
            :disabled="loading"
            class="flex h-9 items-center gap-xs rounded-md border border-neutral-border bg-white px-md text-body font-semibold text-neutral-body transition-colors hover:bg-neutral-bg disabled:opacity-50"
          >
            <svg class="h-4 w-4" :class="{ 'animate-spin': loading }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/></svg>
            刷新
          </button>
          <button
            @click="logout"
            class="flex h-9 items-center gap-xs rounded-md border border-neutral-border bg-white px-md text-body font-semibold text-neutral-body transition-colors hover:bg-neutral-bg"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            退出
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-[1200px] space-y-lg px-base py-lg sm:px-lg">
      <!-- 全局错误提示 -->
      <div v-if="globalError" class="flex items-center gap-sm rounded-md border border-danger/20 bg-danger/5 px-base py-md text-body text-danger">
        <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ globalError }}
      </div>

      <!-- 第一行：4 个状态卡片 -->
      <div class="grid grid-cols-1 gap-base sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard v-if="system" :loading="loading" title="网站状态" :icon="'globe'">
          <div class="flex items-center gap-sm">
            <span class="dot" :class="statusColor(system.vercel_status === 'online' ? 'ok' : 'err')"></span>
            <span class="text-h2">{{ system.vercel_status === 'online' ? '在线' : '离线' }}</span>
          </div>
          <p class="mt-xs text-caption text-neutral-secondary">最后部署：{{ fmt(system.last_deploy) || '—' }}</p>
        </StatusCard>

        <StatusCard v-if="system" :loading="loading" title="数据库" :icon="'db'">
          <div class="flex items-center gap-sm">
            <span class="dot" :class="statusColor(system.db_status === 'ok' ? 'ok' : 'err')"></span>
            <span class="text-h2">{{ system.db_status === 'ok' ? '正常' : '异常' }}</span>
          </div>
          <p class="mt-xs text-caption text-neutral-secondary">已用 {{ dbData ? bytes(dbData.db_size) : '—' }} / 500MB</p>
        </StatusCard>

        <StatusCard v-if="storage" :loading="loading" title="存储" :icon="'hard-drive'">
          <div class="flex items-center gap-sm">
            <span class="dot" :class="statusColor('ok')"></span>
            <span class="text-h2">{{ storage.files_count }} 文件</span>
          </div>
          <p class="mt-xs text-caption text-neutral-secondary">已用 {{ bytes(storage.storage_used) }} / 1GB</p>
        </StatusCard>

        <StatusCard v-if="users" :loading="loading" title="用户" :icon="'users'">
          <div class="flex items-center gap-sm">
            <span class="dot" :class="statusColor('ok')"></span>
            <span class="text-h2">{{ users.total_users }} 人</span>
          </div>
          <p class="mt-xs text-caption text-neutral-secondary">今日活跃 {{ users.active_today }} 人</p>
        </StatusCard>
      </div>

      <!-- 第二行：数据量统计 + 存储用量 -->
      <div class="grid grid-cols-1 gap-base lg:grid-cols-2">
        <!-- 数据量统计（固定高度柱状图） -->
        <div class="rounded-lg bg-white p-base shadow-md">
          <h3 class="mb-md text-h3 text-neutral-title">数据量统计</h3>
          <div v-if="dbData" class="flex h-[250px] items-end justify-around gap-md overflow-hidden">
            <div
              v-for="item in dbChartData"
              :key="item.label"
              class="flex h-full flex-1 flex-col items-center justify-end"
            >
              <span class="mb-xs text-h2 text-primary">{{ item.value }}</span>
              <div
                class="w-full max-w-[80px] rounded-t-md transition-all duration-500"
                :style="{ height: item.height + '%', background: item.color }"
              ></div>
              <span class="mt-sm text-caption text-neutral-secondary">{{ item.label }}</span>
            </div>
          </div>
          <Skeleton v-else :rows="3" />
        </div>

        <!-- 存储用量进度条 -->
        <div class="rounded-lg bg-white p-base shadow-md">
          <h3 class="mb-md text-h3 text-neutral-title">存储用量</h3>
          <div v-if="storage">
            <div class="mb-sm flex items-center justify-between">
              <span class="text-body text-neutral-body">已用 {{ bytes(storage.storage_used) }}</span>
              <span class="text-body font-semibold" :class="progressTextClass(storagePercent)">
                {{ storagePercent.toFixed(2) }}%
              </span>
            </div>
            <div class="h-3 overflow-hidden rounded-full bg-neutral-bg">
              <div class="h-full rounded-full transition-all duration-500" :class="progressBarClass(storagePercent)" :style="{ width: Math.min(storagePercent, 100) + '%' }"></div>
            </div>
            <p class="mt-sm text-caption text-neutral-secondary">总量 {{ bytes(storage.storage_limit) }}（Vercel 免费版 1GB 上限）</p>

            <!-- 最大文件 -->
            <div class="mt-lg">
              <p class="mb-sm text-caption font-medium text-neutral-secondary">最大的 5 个文件</p>
              <ul class="space-y-xs">
                <li v-for="(f, i) in storage.largest_files" :key="i" class="flex items-center justify-between text-caption text-neutral-body">
                  <span class="truncate mr-md" :title="f.name">{{ f.name }}</span>
                  <span class="shrink-0 text-neutral-secondary">{{ bytes(f.size) }}</span>
                </li>
                <li v-if="!storage.largest_files?.length" class="text-caption text-neutral-placeholder">暂无文件</li>
              </ul>
            </div>
          </div>
          <Skeleton v-else :rows="3" />
        </div>
      </div>

      <!-- 第三行：最近注册用户 + 最近活动 -->
      <div class="grid grid-cols-1 gap-base lg:grid-cols-2">
        <!-- 最近注册用户 -->
        <div class="rounded-lg bg-white p-base shadow-md">
          <h3 class="mb-md text-h3 text-neutral-title">最近注册用户</h3>
          <div v-if="users">
            <ul class="divide-y divide-neutral-border">
              <li v-for="(u, i) in users.recent_users" :key="i" class="flex items-center justify-between py-md">
                <div class="flex min-w-0 items-center gap-md">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-caption font-semibold text-primary">
                    {{ (u.email || '?').charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-body text-neutral-title">{{ u.email }}</p>
                    <p class="text-caption text-neutral-secondary">{{ fmt(u.created_at) }}</p>
                  </div>
                </div>
                <span class="shrink-0 text-caption text-neutral-secondary">{{ u.plants_count }} 株</span>
              </li>
              <li v-if="!users.recent_users?.length" class="py-md text-caption text-neutral-placeholder">暂无用户</li>
            </ul>
          </div>
          <Skeleton v-else :rows="3" />
        </div>

        <!-- 最近活动 -->
        <div class="rounded-lg bg-white p-base shadow-md">
          <h3 class="mb-md text-h3 text-neutral-title">最近活动记录</h3>
          <div v-if="logs">
            <ul class="divide-y divide-neutral-border">
              <li v-for="(a, i) in logs.recent_activities" :key="i" class="flex items-center gap-md py-md">
                <span class="h-2 w-2 shrink-0 rounded-full" :style="{ background: eventColor(a.event_type) }"></span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-body text-neutral-title">{{ a.plant_name }} · {{ eventLabel(a.event_type) }}</p>
                  <p class="text-caption text-neutral-secondary">{{ fmt(a.record_date) }}</p>
                </div>
              </li>
              <li v-if="!logs.recent_activities?.length" class="py-md text-caption text-neutral-placeholder">暂无活动</li>
            </ul>
          </div>
          <Skeleton v-else :rows="3" />
        </div>
      </div>

      <!-- 底部：系统信息 -->
      <div class="rounded-lg bg-white p-base shadow-md">
        <h3 class="mb-md text-h3 text-neutral-title">系统信息</h3>
        <div v-if="system" class="grid grid-cols-2 gap-base text-body sm:grid-cols-4">
          <div>
            <p class="text-caption text-neutral-secondary">项目名</p>
            <p class="mt-xs text-neutral-title">{{ system.project_name || '—' }}</p>
          </div>
          <div>
            <p class="text-caption text-neutral-secondary">部署地区</p>
            <p class="mt-xs text-neutral-title">{{ system.deploy_region || '—' }}</p>
          </div>
          <div>
            <p class="text-caption text-neutral-secondary">服务器时间</p>
            <p class="mt-xs text-neutral-title">{{ fmt(system.current_time) }}</p>
          </div>
          <div>
            <p class="text-caption text-neutral-secondary">数据库时间</p>
            <p class="mt-xs text-neutral-title">{{ dbData ? fmt(dbData.last_record_time) : '—' }}</p>
          </div>
        </div>
        <Skeleton v-else :rows="2" />
        <p class="mt-lg text-caption leading-relaxed text-neutral-secondary">
          说明：本站运行于 Vercel Hobby 免费版（数据库 500MB / 存储 1GB 上限），数据存储于 Supabase 免费版。{{ logs?.note || '' }}
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import StatusCard from '../../components/admin/StatusCard.vue'
import Skeleton from '../../components/admin/Skeleton.vue'
import { setPageTitle } from '../../utils/title'

const router = useRouter()

const loading = ref(true)
const globalError = ref('')
const lastRefresh = ref('—')

const system = ref(null)
const dbData = ref(null)
const storage = ref(null)
const users = ref(null)
const logs = ref(null)

let timer = null

// 事件类型颜色/标签（与主应用 constants 保持一致）
const EVENT_MAP = {
  acquire: { label: '入手', color: '#4A7C59' },
  water: { label: '浇水', color: '#5B9BD5' },
  fertilize: { label: '施肥', color: '#ED7D31' },
  repot: { label: '换盆', color: '#7030A0' },
  prune: { label: '修剪', color: '#A5A5A5' },
  sprout: { label: '发芽', color: '#70AD47' },
  bloom: { label: '开花', color: '#FFC000' },
  pest: { label: '病虫害', color: '#C0392B' },
  other: { label: '其他', color: '#808080' }
}
function eventColor(t) { return EVENT_MAP[t]?.color || '#808080' }
function eventLabel(t) { return EVENT_MAP[t]?.label || t }

const storagePercent = computed(() => {
  if (!storage.value) return 0
  return (storage.value.storage_used / storage.value.storage_limit) * 100
})

// 数据量柱状图（固定容器 250px，柱子高度按比例，不超出）
const dbChartData = computed(() => {
  if (!dbData.value) return []
  const d = dbData.value
  const items = [
    { label: '植物', value: d.plants_count || 0, color: '#4A7C59' },
    { label: '生长记录', value: d.records_count || 0, color: '#5B9BD5' },
    { label: '用户', value: d.users_count || 0, color: '#ED7D31' }
  ]
  const max = Math.max(...items.map((i) => i.value), 1)
  return items.map((i) => ({
    ...i,
    // 柱体最大占 60% 高度，留出顶部数字空间
    height: Math.max(4, (i.value / max) * 60)
  }))
})

// 工具函数
function bytes(n) {
  if (n == null) return '—'
  const kb = 1024
  const mb = kb * 1024
  const gb = mb * 1024
  if (n >= gb) return (n / gb).toFixed(2) + ' GB'
  if (n >= mb) return (n / mb).toFixed(2) + ' MB'
  if (n >= kb) return (n / kb).toFixed(2) + ' KB'
  return n + ' B'
}

function fmt(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  const p = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function statusColor(s) {
  if (s === 'ok') return 'dot-ok'
  if (s === 'warn') return 'dot-warn'
  return 'dot-err'
}

function progressBarClass(p) {
  if (p >= 90) return 'bg-danger'
  if (p >= 70) return 'bg-warning'
  return 'bg-primary'
}

function progressTextClass(p) {
  if (p >= 90) return 'text-danger'
  if (p >= 70) return 'text-warning'
  return 'text-primary'
}

// 拉取数据
async function fetchData(url) {
  const res = await fetch(url)
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data
}

async function refreshAll() {
  loading.value = true
  globalError.value = ''
  try {
    const [sys, db, st, us, lg] = await Promise.allSettled([
      fetchData('/api/system'),
      fetchData('/api/database'),
      fetchData('/api/storage'),
      fetchData('/api/users'),
      fetchData('/api/logs')
    ])
    const errs = []
    if (sys.status === 'fulfilled') system.value = sys.value
    else errs.push('系统状态: ' + sys.reason?.message)
    if (db.status === 'fulfilled') dbData.value = db.value
    else errs.push('数据库: ' + db.reason?.message)
    if (st.status === 'fulfilled') storage.value = st.value
    else errs.push('存储: ' + st.reason?.message)
    if (us.status === 'fulfilled') users.value = us.value
    else errs.push('用户: ' + us.reason?.message)
    if (lg.status === 'fulfilled') logs.value = lg.value
    else errs.push('日志: ' + lg.reason?.message)

    if (errs.length) globalError.value = errs.join('；')
    lastRefresh.value = fmt(new Date().toISOString())
  } catch (e) {
    globalError.value = e.message
  } finally {
    loading.value = false
  }
}

function logout() {
  sessionStorage.removeItem('planttrace_admin')
  router.replace('/admin/login')
}

onMounted(() => {
  setPageTitle('管理员后台')
  refreshAll()
  timer = setInterval(refreshAll, 30000) // 30秒自动刷新
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot-ok { background: #27AE60; box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.15); }
.dot-warn { background: #F39C12; box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.15); }
.dot-err { background: #C0392B; box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.15); }
</style>
