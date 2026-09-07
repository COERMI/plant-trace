<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <!-- 全局 Toast 提示 -->
  <Toast />
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from './stores/userStore'
import { useRouter, useRoute } from 'vue-router'
import Toast from './components/Toast.vue'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 应用启动时恢复会话，并根据登录状态决定是否跳转
onMounted(async () => {
  // 后台路由使用独立 sessionStorage 登录态，不走 Supabase 会话逻辑
  const isAdminRoute = route.path.startsWith('/admin')
  if (isAdminRoute) {
    if (route.meta.requiresAdmin && !sessionStorage.getItem('planttrace_admin')) {
      router.replace('/admin/login')
    }
    return
  }

  await userStore.restoreSession()
  if (route.meta.requiresAuth && !userStore.user) {
    router.replace('/login')
  } else if (route.name === 'login' && userStore.user) {
    router.replace('/')
  }
})
</script>
