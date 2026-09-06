/**
 * 预设事件类型定义（固定 9 种，不开放自定义）
 * color 用于时间线节点圆点边框
 * bg / text 用于事件标签的浅背景 + 深文字配色
 */
export const EVENT_TYPES = {
  acquire: { label: '入手', icon: 'gift', color: '#4A7C59', bg: '#E8F0EB', text: '#4A7C59', key: true },
  water: { label: '浇水', icon: 'droplets', color: '#5B9BD5', bg: '#E8F2F9', text: '#5B9BD5', key: false },
  fertilize: { label: '施肥', icon: 'sprout', color: '#ED7D31', bg: '#FDF0E6', text: '#ED7D31', key: false },
  repot: { label: '换盆', icon: 'shovel', color: '#7030A0', bg: '#F3EAF8', text: '#7030A0', key: true },
  prune: { label: '修剪', icon: 'scissors', color: '#A5A5A5', bg: '#F0F0F0', text: '#666666', key: false },
  sprout: { label: '发芽', icon: 'leaf', color: '#70AD47', bg: '#EDF7E8', text: '#70AD47', key: true },
  bloom: { label: '开花', icon: 'flower-2', color: '#FFC000', bg: '#FFF8E6', text: '#E6A800', key: true },
  pest: { label: '病虫害', icon: 'bug', color: '#C0392B', bg: '#FBEAE8', text: '#C0392B', key: true },
  other: { label: '其他', icon: 'file-text', color: '#808080', bg: '#F0F0F0', text: '#808080', key: false }
}

export const EVENT_TYPE_KEYS = Object.keys(EVENT_TYPES)

/**
 * 获取事件类型定义（含兜底）
 */
export function getEventType(type) {
  return EVENT_TYPES[type] || EVENT_TYPES.other
}

/**
 * 植物当前状态选项
 */
export const PLANT_STATUS = ['健康', '缓苗中', '开花中', '生病', '其他']
