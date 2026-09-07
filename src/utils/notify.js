/**
 * 浏览器推送通知工具（Web Notification API）
 *
 * 用于"浇水/换盆提醒"。依赖浏览器 Notification API，
 * 首次使用需用户授权。仅在 PWA 或 HTTPS 环境有效。
 */

/**
 * 检查浏览器是否支持 Notification
 */
export function notifySupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

/**
 * 获取当前通知权限状态：granted / denied / default
 */
export function notifyPermission() {
  if (!notifySupported()) return 'denied'
  return Notification.permission
}

/**
 * 请求通知权限
 * @returns {Promise<boolean>} 是否已授权
 */
export async function requestNotifyPermission() {
  if (!notifySupported()) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  try {
    const result = await Notification.requestPermission()
    return result === 'granted'
  } catch (e) {
    return false
  }
}

/**
 * 发送一条浏览器通知
 * @param {string} title 标题
 * @param {object} opts { body, icon, tag, data }
 */
export function sendNotify(title, opts = {}) {
  if (!notifySupported() || Notification.permission !== 'granted') return
  try {
    const icon = opts.icon || '/pwa-192x192.png'
    const n = new Notification(title, { ...opts, icon })
    // 点击通知跳转到指定 URL
    if (opts.url) {
      n.onclick = () => {
        window.focus()
        if (opts.url) window.location.href = opts.url
        n.close()
      }
    }
  } catch (e) {
    // 某些环境（如 iOS 非 PWA）不支持，静默失败
  }
}

/**
 * 根据上次浇水时间判断是否该浇水了
 * @param {Date|string|null} lastWaterAt 上次浇水时间
 * @param {number} intervalDays 建议浇水间隔天数（默认 7 天）
 * @returns {{ due: boolean, days: number }} 是否到期 + 距上次天数
 */
export function checkWaterDue(lastWaterAt, intervalDays = 7) {
  if (!lastWaterAt) return { due: false, days: null }
  const last = new Date(lastWaterAt)
  const days = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24))
  return { due: days >= intervalDays, days }
}
