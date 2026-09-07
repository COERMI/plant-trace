<template>
  <!-- 植物卡片骨架屏 -->
  <div class="overflow-hidden rounded-lg bg-white shadow-md">
    <div class="skeleton aspect-[4/3] w-full"></div>
    <div class="p-base">
      <div class="skeleton h-5 w-3/4 rounded"></div>
      <div class="skeleton mt-sm h-3.5 w-1/2 rounded"></div>
      <div class="skeleton mt-sm h-3 w-2/5 rounded"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  background: linear-gradient(100deg, #f0f1f0 40%, #f7f8f7 50%, #f0f1f0 60%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
