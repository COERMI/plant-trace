/**
 * 页面标题工具
 * 用法：在组件 onMounted 中调用 setPageTitle('我的植物')
 */
export function setPageTitle(title) {
  document.title = title ? `植迹 - ${title}` : '植迹 PlantTrace'
}
