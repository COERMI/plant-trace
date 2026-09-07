<template>
  <div class="admin-login flex min-h-screen items-center justify-center bg-neutral-bg px-base">
    <div class="w-full max-w-sm">
      <div class="rounded-lg bg-white p-lg shadow-md">
        <!-- 标题 -->
        <div class="mb-lg text-center">
          <div class="mb-base inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-white">
            <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 class="text-h2 text-neutral-title">管理员后台</h1>
          <p class="mt-xs text-caption text-neutral-secondary">植迹 PlantTrace · 系统监控</p>
        </div>

        <!-- 密码输入 -->
        <form @submit.prevent="handleLogin">
          <label class="mb-sm block text-body font-medium text-neutral-body">管理员密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
            class="h-12 w-full rounded-md border border-neutral-border bg-white px-base text-body-l text-neutral-title placeholder:text-neutral-placeholder focus:border-primary focus:shadow-focus-primary focus:outline-none"
          />

          <p v-if="error" class="mt-md flex items-center gap-xs text-body text-danger">
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ error }}
          </p>

          <button
            type="submit"
            :disabled="loading"
            class="mt-lg flex h-12 w-full items-center justify-center gap-sm rounded-md bg-primary text-body-l font-semibold text-white transition-all hover:bg-primary-hover active:scale-[0.98] disabled:bg-neutral-border disabled:text-neutral-placeholder disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>
      </div>

      <p class="mt-base text-center text-caption text-neutral-secondary">
        仅供管理员使用 · 密码验证在服务端完成
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { setPageTitle } from '../../utils/title'

const router = useRouter()
const password = ref('')
const error = ref('')
const loading = ref(false)

onMounted(() => setPageTitle('管理员登录'))

async function handleLogin() {
  error.value = ''
  if (!password.value) {
    error.value = '请输入密码'
    return
  }
  loading.value = true
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value })
    })
    const data = await res.json()
    if (data.success) {
      // 登录成功，用 sessionStorage 保存登录态（关闭浏览器失效）
      sessionStorage.setItem('planttrace_admin', data.token)
      router.replace('/admin/dashboard')
    } else {
      error.value = data.error || '密码错误'
    }
  } catch (e) {
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>
