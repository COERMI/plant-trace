// api/users.js — 用户管理
import { ok, fail, supabaseRpc } from './lib/_shared.cjs'

export default async function handler(req) {
  try {
    let total_users = 0
    let active_today = 0
    let recent_users = []

    try {
      const stats = await supabaseRpc('admin_users_stats')
      if (stats) {
        total_users = stats.total_users || 0
        active_today = stats.active_today || 0
        recent_users = stats.recent_users || []
      }
    } catch (e) {
      return fail(new Error('请先在 Supabase SQL Editor 执行 supabase/admin_stats.sql 创建统计函数'))
    }

    const safeRecent = recent_users.map((u) => ({
      email: maskEmail(u.email),
      created_at: u.created_at,
      plants_count: u.plants_count || 0
    }))

    return ok({
      total_users,
      active_today,
      recent_users: safeRecent
    })
  } catch (e) {
    return fail(e)
  }
}

function maskEmail(email) {
  if (!email) return '未知'
  const at = email.indexOf('@')
  if (at < 0) return email
  const name = email.slice(0, at)
  const domain = email.slice(at)
  const visible = name.slice(0, Math.min(2, name.length))
  return visible + '***' + domain
}
