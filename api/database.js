// api/database.js — 数据库监控
const { ok, fail, supabaseRpc, supabaseRest, SUPABASE_KEY } = require('./lib/_shared.cjs')

module.exports = async function handler(req) {
  try {
    let plants_count = 0
    let records_count = 0
    let users_count = 0
    let last_record_time = null
    let db_size = 0

    try {
      const stats = await supabaseRpc('admin_database_stats')
      if (stats) {
        plants_count = stats.plants_count || 0
        records_count = stats.records_count || 0
        users_count = stats.users_count || 0
        last_record_time = stats.last_record_time || null
        db_size = stats.db_size || 0
      }
    } catch (e) {
      if (!SUPABASE_KEY) {
        return fail(new Error('请先在 Supabase SQL Editor 执行 supabase/admin_stats.sql 创建统计函数'))
      }
      try {
        const [plants, records] = await Promise.all([
          supabaseRest('plants?select=id'),
          supabaseRest('records?select=record_date')
        ])
        plants_count = plants.length
        records_count = records.length
        users_count = 0
      } catch (e2) {
        return fail(new Error('请先在 Supabase SQL Editor 执行 supabase/admin_stats.sql 创建统计函数'))
      }
    }

    return ok({
      tables_count: 2,
      plants_count,
      records_count,
      users_count,
      db_size,
      db_size_limit: 500 * 1024 * 1024,
      last_record_time
    })
  } catch (e) {
    return fail(e)
  }
}
