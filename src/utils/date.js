/**
 * 日期格式化工具
 */

// 补零
const pad = (n) => String(n).padStart(2, '0')

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm
 */
export function formatDateTime(date) {
  if (!date) return ''
  const d = new Date(date)
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * 计算入手天数（从某日期到今天）
 */
export function daysSince(date) {
  if (!date) return 0
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24))
  return diff >= 0 ? diff : 0
}

/**
 * 相对时间（刚刚 / x分钟前 / x小时前 / x天前 / 具体日期）
 */
export function relativeTime(date) {
  if (!date) return ''
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`
  return formatDate(d)
}

/**
 * 获取今天日期字符串（YYYY-MM-DD，用于默认值）
 */
export function todayStr() {
  return formatDate(new Date())
}

/**
 * 获取当前本地日期时间（YYYY-MM-DDTHH:mm，用于 datetime-local 输入默认值）
 */
export function nowLocalInput() {
  const d = new Date()
  return `${formatDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
