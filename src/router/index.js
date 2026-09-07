import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/plant/:id',
    name: 'plant-detail',
    component: () => import('../views/PlantDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stats',
    name: 'stats',
    component: () => import('../views/Stats.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../views/admin/AdminLogin.vue')
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('../views/admin/AdminDashboard.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin',
    redirect: '/admin/login'
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

// 后台路由守卫：基于 sessionStorage 的独立登录态
router.beforeEach((to) => {
  if (to.meta.requiresAdmin && !sessionStorage.getItem('planttrace_admin')) {
    return { name: 'admin-login' }
  }
  return true
})

export default router
