// api/logs.js — 系统日志
import { ok, fail, supabaseRpc } from '../lib/_shared.cjs'

export default async function handler(req) {
  try {
    const logSource = 'builtin'
    const logMessage = '日志功能需要配置 Vercel Log Drain（推送式日志，需自建接收端点）'

    let recent_activities = []
    let api_calls_24h = 0

    try {
      recent_activities = (await supabaseRpc('admin_recent_activities', { lim: 10 })) || []
      api_calls_24h = recent_activities.length
    } catch (e) {
      recent_activities = []
    }

    return ok({
      source: logSource,
      message: logMessage,
      recent_activities,
      api_calls_24h,
      note: '日志功能需要配置 Vercel Log Drain'
    })
  } catch (e) {
    return fail(e)
  }
}
