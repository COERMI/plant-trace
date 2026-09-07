<template>
  <div class="admin-login min-h-screen flex items-center justify-center bg-[#f5f7f5] px-4">
    <div class="w-full max-w-sm">
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <!-- 标题 -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#4A7C59] text-white mb-4">
            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 class="text-xl font-bold text-gray-800">管理员后台</h1>
          <p class="text-sm text-gray-400 mt-1">植迹 PlantTrace · 系统监控</p>
        </div>

        <!-- 密码输入 -->
        <form @submit.prevent="handleLogin">
          <label class="block text-sm font-medium text-gray-600 mb-2">管理员密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 transition text-gray-800"
          />

          <p v-if="error" class="text-sm text-red-500 mt-3 flex items-center gap-1">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ error }}
          </p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full mt-5 py-3 rounded-xl bg-[#4A7C59] text-white font-medium hover:bg-[#3f6b4c] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>
      </div>

      <p class="text-center text-xs text-gray-400 mt-6">
        仅供管理员使用 · 密码验证在服务端完成
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const password = ref('')
const error = ref('')
const loading = ref(false)

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
