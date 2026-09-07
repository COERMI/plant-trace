// api/users.js — 用户管理
import { ok, fail, supabaseRpc } from './_shared.js'

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

    // 邮箱脱敏：仅返回前段，避免泄露完整邮箱
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
  const [name, domain] = email.split('@')
  if (!domain) return email
  const visible = name.slice(0, Math.min(2, name.length))
  return `${visible}***@${domain}`
}
