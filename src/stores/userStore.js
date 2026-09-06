import { defineStore } from 'pinia'
import { supabase } from '../utils/supabase'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    loading: true
  }),
  getters: {
    isLoggedIn: (state) => !!state.user
  },
  actions: {
    /**
     * 恢复会话（应用启动时调用）
     */
    async restoreSession() {
      this.loading = true
      try {
        const { data } = await supabase.auth.getSession()
        this.user = data.session?.user || null
      } catch (e) {
        this.user = null
      } finally {
        this.loading = false
      }
    },

    /**
     * 邮箱注册（首次使用引导注册，自动登录）
     */
    async signUp(email, password) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      this.user = data.user || null
      return data
    },

    /**
     * 邮箱登录
     */
    async signIn(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      this.user = data.user || null
      return data
    },

    /**
     * 退出登录
     */
    async signOut() {
      await supabase.auth.signOut()
      this.user = null
    }
  }
})
