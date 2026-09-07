// api/logs.js — 系统日志
import { ok, fail, supabaseRpc } from './_shared.js'

export default async function handler(req) {
  try {
    // 尝试从 Vercel Log Drains 获取（Vercel 官方 Log Drains API 需要额外配置，这里做探测）
    const vercelToken = process.env.VERCEL_TOKEN
    let logs = []
    let logSource = 'builtin'
    let logMessage = null

    if (vercelToken) {
      // 注：Vercel 没有公开的通用日志检索 API（Log Drains 是推送式，需自建接收端）。
      // 因此这里直接走内置统计，不调用不存在的接口。
      logSource = 'builtin'
      logMessage = '日志功能需要配置 Vercel Log Drain（推送式日志，需自建接收端点）'
    }

    // 内置统计：最近 10 条活动（作为「最近事件」）+ API 调用次数（用活动记录数近似）
    let recent_activities = []
    let api_calls_24h = 0

    try {
      recent_activities = (await supabaseRpc('admin_recent_activities', { lim: 10 })) || []
      // 近24小时记录数近似作为活动量
      api_calls_24h = recent_activities.length
    } catch (e) {
      // 函数未创建时静默降级
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
