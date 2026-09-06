<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from './stores/userStore'
import { useRouter, useRoute } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 应用启动时恢复会话，并根据登录状态决定是否跳转
onMounted(async () => {
  await userStore.restoreSession()
  if (route.meta.requiresAuth && !userStore.user) {
    router.replace('/login')
  } else if (route.name === 'login' && userStore.user) {
    router.replace('/')
  }
})
</script>
