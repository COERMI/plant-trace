<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-neutral-bg px-lg">
    <!-- 品牌区 -->
    <div class="mb-xl flex flex-col items-center text-center">
      <div class="mb-base flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21c-4.5-1-7-4-7-8 0-3 2-5 5-5 1 0 1.5.5 2 1 0-1 .5-2 1.5-2.5C15 6 17 7 17 10c0 3.5-2.5 6-5 6-1.5 0-2.5-.5-3-1 .5 4-1.5 5-1.5 5"
            stroke="white"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h1 class="mt-base text-h1 text-neutral-title">植迹</h1>
      <p class="mt-xs text-body text-neutral-secondary">记录每一株植物的生长轨迹</p>
    </div>

    <!-- 登录卡片 -->
    <div class="w-full max-w-[400px] rounded-lg bg-white p-lg shadow-md">
      <!-- 切换 Tab -->
      <div class="mb-lg flex rounded-md bg-neutral-bg p-xs">
        <button
          class="h-10 flex-1 rounded-sm text-body font-semibold transition-colors"
          :class="mode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-neutral-secondary'"
          @click="mode = 'login'"
        >
          登录
        </button>
        <button
          class="h-10 flex-1 rounded-sm text-body font-semibold transition-colors"
          :class="mode === 'register' ? 'bg-white text-primary shadow-sm' : 'text-neutral-secondary'"
          @click="mode = 'register'"
        >
          注册
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-md">
          <input
            v-model="email"
            type="email"
            required
            placeholder="邮箱地址"
            class="h-12 w-full rounded-md border border-neutral-border bg-white px-base text-body-l text-neutral-title placeholder:text-neutral-placeholder focus:border-primary focus:shadow-focus-primary focus:outline-none"
          />
        </div>
        <div class="mb-lg">
          <input
            v-model="password"
            type="password"
            required
            placeholder="密码（至少 6 位）"
            class="h-12 w-full rounded-md border border-neutral-border bg-white px-base text-body-l text-neutral-title placeholder:text-neutral-placeholder focus:border-primary focus:shadow-focus-primary focus:outline-none"
          />
        </div>

        <p v-if="error" class="mb-md text-body text-danger">{{ error }}</p>

        <button
          type="submit"
          class="h-12 w-full rounded-md bg-primary text-body-l font-semibold text-white transition-all hover:bg-primary-hover active:scale-[0.98] disabled:bg-neutral-border disabled:text-neutral-placeholder"
          :disabled="loading"
        >
          {{ loading ? '处理中...' : mode === 'login' ? '登录' : '注册并登录' }}
        </button>
      </form>

      <p v-if="mode === 'register'" class="mt-md text-caption text-neutral-secondary">
        注册后即可开始记录你的植物。数据仅保存在你自己的账号中。
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const mode = ref('login')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    if (mode.value === 'login') {
      await userStore.signIn(email.value, password.value)
    } else {
      if (password.value.length < 6) {
        error.value = '密码至少需要 6 位'
        return
      }
      await userStore.signUp(email.value, password.value)
    }
    router.replace('/')
  } catch (e) {
    error.value = translateError(e.message)
  } finally {
    loading.value = false
  }
}

// 将 Supabase 错误信息翻译为友好中文
function translateError(msg) {
  if (!msg) return '操作失败，请稍后重试'
  if (msg.includes('Invalid login credentials')) return '邮箱或密码错误'
  if (msg.includes('already registered')) return '该邮箱已注册，请直接登录'
  if (msg.includes('Password should be')) return '密码至少需要 6 位'
  if (msg.includes('valid email')) return '请输入有效的邮箱地址'
  if (msg.includes('rate limit') || msg.includes('For security')) return '操作过于频繁，请稍后再试'
  return '操作失败：' + msg
}
</script>
