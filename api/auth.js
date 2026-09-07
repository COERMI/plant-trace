// api/auth.js — 管理员登录校验（密码只在服务端，前端拿不到）
import { json } from './_shared.js'

export default {
  async fetch(req) {
    try {
      if (req.method !== 'POST') {
        return json(405, { error: 'Method not allowed' })
      }

      let body = {}
      try {
        body = await req.json()
      } catch (e) {
        return json(400, { error: '请求格式错误' })
      }

      const password = (body && body.password) || ''
      const adminPassword = process.env.ADMIN_PASSWORD || 'plantrace2026'

      if (!password) {
        return json(400, { error: '请输入密码' })
      }

      if (password === adminPassword) {
        return json(200, { success: true, token: 'admin-session-' + Date.now() })
      }

      return json(200, { success: false, error: '密码错误' })
    } catch (e) {
      return json(500, { error: (e && e.message) || String(e) })
    }
  }
}
