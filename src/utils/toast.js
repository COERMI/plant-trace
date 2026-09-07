import { reactive } from 'vue'

/**
 * 全局 Toast 轻提示（模块级单例）
 * 用法：
 *   import { toast } from '../utils/toast'
 *   toast.success('保存成功')
 *   toast.error('删除失败')
 *   toast.info('提示内容')
 */
const state = reactive({
  toasts: []
})

let seed = 0

function push(message, type, duration) {
  const id = ++seed
  state.toasts.push({ id, message, type })
  setTimeout(() => {
    const idx = state.toasts.findIndex((t) => t.id === id)
    if (idx !== -1) state.toasts.splice(idx, 1)
  }, duration)
}

export const toast = {
  success: (msg) => push(msg, 'success', 2200),
  error: (msg) => push(msg, 'error', 3200),
  info: (msg) => push(msg, 'info', 2200)
}

// 供 ToastHost 组件读取的响应式状态
export const toastState = state
