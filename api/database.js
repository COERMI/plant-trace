// api/database.js — 数据库监控
import { ok, fail, supabaseRpc, supabaseRest, SUPABASE_KEY, SUPABASE_URL } from './_shared.js'

export default async function handler(req) {
  try {
    let plants_count = 0
    let records_count = 0
    let users_count = 0
    let last_record_time = null

    // 优先走 RPC 统计函数（SECURITY DEFINER 绕过 RLS）
    try {
      const stats = await supabaseRpc('admin_database_stats')
      if (stats) {
        plants_count = stats.plants_count || 0
        records_count = stats.records_count || 0
        users_count = stats.users_count || 0
        last_record_time = stats.last_record_time || null
      }
    } catch (e) {
      // RPC 函数未创建时回退：尝试用 service_role 直接查（仅当配置了 service_role）
      if (!SUPABASE_KEY || SUPABASE_KEY === process.env.VITE_SUPABASE_ANON_KEY) {
        return fail(new Error('请先在 Supabase SQL Editor 执行 supabase/admin_stats.sql 创建统计函数'))
      }
      // service_role 回退查询
      try {
        const [plants, records, users] = await Promise.all([
          supabaseRest('plants?select=id'),
          supabaseRest('records?select=record_date'),
          fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1`, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
          }).then((r) => r.json())
        ])
        plants_count = plants.length
        records_count = records.length
        users_count = users.length
      } catch (e2) {
        return fail(new Error('请先在 Supabase SQL Editor 执行 supabase/admin_stats.sql 创建统计函数'))
      }
    }

    // 数据库大小（字节）
    let db_size = 0
    try {
      const sz = await supabaseRpc('admin_database_stats')
      db_size = sz?.db_size || 0
    } catch (e) {
      db_size = 0
    }

    return ok({
      tables_count: 2,
      plants_count,
      records_count,
      users_count,
      db_size,
      db_size_limit: 500 * 1024 * 1024, // 500MB
      last_record_time
    })
  } catch (e) {
    return fail(e)
  }
}
