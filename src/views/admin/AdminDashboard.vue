<template>
  <div class="admin-dashboard min-h-screen bg-[#f5f7f5] text-gray-800">
    <!-- 顶部导航栏 -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#4A7C59] text-white">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-base font-bold leading-tight">管理员后台</h1>
            <p class="text-xs text-gray-400">植迹 PlantTrace</p>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <span class="text-xs text-gray-400 hidden sm:inline">最后刷新：{{ lastRefresh }}</span>
          <button
            @click="refreshAll"
            :disabled="loading"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/></svg>
            刷新
          </button>
          <button
            @click="logout"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            退出
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <!-- 全局错误提示 -->
      <div v-if="globalError" class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
        <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ globalError }}
      </div>

      <!-- 第一行：4 个状态卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard v-if="system" :loading="loading" title="网站状态" :icon="'globe'">
          <div class="flex items-center gap-2">
            <span class="dot" :class="statusColor(system.vercel_status === 'online' ? 'ok' : 'err')"></span>
            <span class="text-lg font-bold">{{ system.vercel_status === 'online' ? '在线' : '离线' }}</span>
          </div>
          <p class="text-xs text-gray-400 mt-1">最后部署：{{ fmt(system.last_deploy) || '—' }}</p>
        </StatusCard>

        <StatusCard v-if="system" :loading="loading" title="数据库" :icon="'db'">
          <div class="flex items-center gap-2">
            <span class="dot" :class="statusColor(system.db_status === 'ok' ? 'ok' : 'err')"></span>
            <span class="text-lg font-bold">{{ system.db_status === 'ok' ? '正常' : '异常' }}</span>
          </div>
          <p class="text-xs text-gray-400 mt-1">已用 {{ dbData ? bytes(dbData.db_size) : '—' }} / 500MB</p>
        </StatusCard>

        <StatusCard v-if="storage" :loading="loading" title="存储" :icon="'hard-drive'">
          <div class="flex items-center gap-2">
            <span class="dot" :class="statusColor(storage.files_count >= 0 ? 'ok' : 'err')"></span>
            <span class="text-lg font-bold">{{ storage.files_count }} 文件</span>
          </div>
          <p class="text-xs text-gray-400 mt-1">已用 {{ bytes(storage.storage_used) }} / 1GB</p>
        </StatusCard>

        <StatusCard v-if="users" :loading="loading" title="用户" :icon="'users'">
          <div class="flex items-center gap-2">
            <span class="dot" :class="statusColor('ok')"></span>
            <span class="text-lg font-bold">{{ users.total_users }} 人</span>
          </div>
          <p class="text-xs text-gray-400 mt-1">今日活跃 {{ users.active_today }} 人</p>
        </StatusCard>
      </div>

      <!-- 第二行：数据量统计 + 存储用量 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- 数据量统计 -->
        <div class="card bg-white rounded-2xl p-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">数据量统计</h3>
          <div v-if="dbData" class="flex items-end gap-8 h-40">
            <div class="flex flex-col items-center flex-1">
              <span class="text-2xl font-bold text-[#4A7C59]">{{ dbData.plants_count }}</span>
              <div class="w-full max-w-[80px] rounded-t-lg mt-2" :style="barStyle(dbData.plants_count, dbData.records_count)"></div>
              <span class="text-xs text-gray-400 mt-2">植物</span>
            </div>
            <div class="flex flex-col items-center flex-1">
              <span class="text-2xl font-bold text-[#4A7C59]">{{ dbData.records_count }}</span>
              <div class="w-full max-w-[80px] rounded-t-lg mt-2" :style="barStyle(dbData.records_count, dbData.records_count)"></div>
              <span class="text-xs text-gray-400 mt-2">生长记录</span>
            </div>
            <div class="flex flex-col items-center flex-1">
              <span class="text-2xl font-bold text-[#4A7C59]">{{ dbData.users_count }}</span>
              <div class="w-full max-w-[80px] rounded-t-lg mt-2" :style="barStyle(dbData.users_count, Math.max(dbData.records_count, 1))"></div>
              <span class="text-xs text-gray-400 mt-2">用户</span>
            </div>
          </div>
          <Skeleton v-else :rows="3" />
        </div>

        <!-- 存储用量进度条 -->
        <div class="card bg-white rounded-2xl p-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">存储用量</h3>
          <div v-if="storage">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-500">已用 {{ bytes(storage.storage_used) }}</span>
              <span class="text-sm font-semibold" :class="progressTextClass(storagePercent)">
                {{ storagePercent.toFixed(2) }}%
              </span>
            </div>
            <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500" :class="progressBarClass(storagePercent)" :style="{ width: Math.min(storagePercent, 100) + '%' }"></div>
            </div>
            <p class="text-xs text-gray-400 mt-2">总量 {{ bytes(storage.storage_limit) }}（Vercel 免费版 1GB 上限）</p>

            <!-- 最大文件 -->
            <div class="mt-5">
              <p class="text-xs font-medium text-gray-500 mb-2">最大的 5 个文件</p>
              <ul class="space-y-1.5">
                <li v-for="(f, i) in storage.largest_files" :key="i" class="flex items-center justify-between text-xs text-gray-600">
                  <span class="truncate mr-3" :title="f.name">{{ f.name }}</span>
                  <span class="shrink-0 text-gray-400">{{ bytes(f.size) }}</span>
                </li>
                <li v-if="!storage.largest_files?.length" class="text-xs text-gray-400">暂无文件</li>
              </ul>
            </div>
          </div>
          <Skeleton v-else :rows="3" />
        </div>
      </div>

      <!-- 第三行：最近注册用户 + 最近活动 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- 最近注册用户 -->
        <div class="card bg-white rounded-2xl p-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">最近注册用户</h3>
          <div v-if="users">
            <ul class="divide-y divide-gray-100">
              <li v-for="(u, i) in users.recent_users" :key="i" class="py-3 flex items-center justify-between">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-8 h-8 rounded-full bg-[#E8F0EB] text-[#4A7C59] flex items-center justify-center text-xs font-semibold shrink-0">
                    {{ (u.email || '?').charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm text-gray-700 truncate">{{ u.email }}</p>
                    <p class="text-xs text-gray-400">{{ fmt(u.created_at) }}</p>
                  </div>
                </div>
                <span class="text-xs text-gray-500 shrink-0">{{ u.plants_count }} 株</span>
              </li>
              <li v-if="!users.recent_users?.length" class="py-3 text-xs text-gray-400">暂无用户</li>
            </ul>
          </div>
          <Skeleton v-else :rows="3" />
        </div>

        <!-- 最近活动 -->
        <div class="card bg-white rounded-2xl p-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">最近活动记录</h3>
          <div v-if="logs">
            <ul class="divide-y divide-gray-100">
              <li v-for="(a, i) in logs.recent_activities" :key="i" class="py-3 flex items-center gap-3">
                <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: eventColor(a.event_type) }"></span>
                <div class="min-w-0 flex-1">
                  <p class="text-sm text-gray-700 truncate">{{ a.plant_name }} · {{ eventLabel(a.event_type) }}</p>
                  <p class="text-xs text-gray-400">{{ fmt(a.record_date) }}</p>
                </div>
              </li>
              <li v-if="!logs.recent_activities?.length" class="py-3 text-xs text-gray-400">暂无活动</li>
            </ul>
          </div>
          <Skeleton v-else :rows="3" />
        </div>
      </div>

      <!-- 底部：系统信息 -->
      <div class="card bg-white rounded-2xl p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">系统信息</h3>
        <div v-if="system" class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p class="text-xs text-gray-400">项目名</p>
            <p class="text-gray-700 mt-0.5">{{ system.project_name || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">部署地区</p>
            <p class="text-gray-700 mt-0.5">{{ system.deploy_region || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">服务器时间</p>
            <p class="text-gray-700 mt-0.5">{{ fmt(system.current_time) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">数据库时间</p>
            <p class="text-gray-700 mt-0.5">{{ dbData ? fmt(dbData.last_record_time) : '—' }}</p>
          </div>
        </div>
        <Skeleton v-else :rows="2" />
        <p class="text-xs text-gray-400 mt-5 leading-relaxed">
          说明：本站运行于 Vercel Hobby 免费版（数据库 500MB / 存储 1GB 上限），数据存储于 Supabase 免费版。{{ logs?.note || '' }}
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

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

function barStyle(val, max) {
  const h = Math.max(8, (val / Math.max(max, 1)) * 120)
  return { height: h + 'px', background: '#4A7C59', opacity: val === 0 ? 0.25 : 1 }
}

function progressBarClass(p) {
  if (p >= 90) return 'bg-red-500'
  if (p >= 70) return 'bg-yellow-500'
  return 'bg-[#4A7C59]'
}

function progressTextClass(p) {
  if (p >= 90) return 'text-red-500'
  if (p >= 70) return 'text-yellow-600'
  return 'text-[#4A7C59]'
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
.dot-ok { background: #22c55e; box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15); }
.dot-warn { background: #eab308; box-shadow: 0 0 0 3px rgba(234, 179, 8, 0.15); }
.dot-err { background: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15); }
.card { box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
</style>
