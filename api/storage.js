// api/storage.js — 存储监控
import { ok, fail, supabaseRpc } from './_shared.js'

const STORAGE_LIMIT = 1073741824 // 1GB 免费版上限

export default {
  async fetch(req) {
  try {
    let bucket_name = 'plant-images'
    let files_count = 0
    let storage_used = 0
    let largest_files = []

    try {
      const stats = await supabaseRpc('admin_storage_stats')
      if (stats) {
        bucket_name = stats.bucket_name || bucket_name
        files_count = stats.files_count || 0
        storage_used = stats.storage_used || 0
        largest_files = stats.largest_files || []
      }
    } catch (e) {
      return fail(new Error('请先在 Supabase SQL Editor 执行 supabase/admin_stats.sql 创建统计函数'))
    }

    return ok({
      bucket_name,
      files_count,
      storage_used,
      storage_limit: STORAGE_LIMIT,
      largest_files
    })
  } catch (e) {
    return fail(e)
  }
}
}
