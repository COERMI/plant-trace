/**
 * 浏览器端图片压缩 + 裁剪工具
 *
 * 提供两个入口：
 * - compressCoverImage：封面图，4:3 裁剪，宽 800px，质量 75%
 * - compressRecordImage：记录照片，宽 1200px，质量 75%
 * 均支持进度回调（用于展示上传进度条）。
 */

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 单张 5MB

/**
 * 检查文件是否超过大小限制
 * @returns {boolean} 是否超限
 */
export function isImageTooLarge(file) {
  return file && file.size > MAX_IMAGE_SIZE
}

/**
 * 核心压缩函数
 * @param {File} file 原图文件
 * @param {Object} options
 * @param {number} options.maxWidth 最大宽度
 * @param {number} options.quality 压缩质量 0-1
 * @param {number|null} options.aspectRatio 目标宽高比（如 4/3），null 表示不裁剪
 * @param {Function} options.onProgress 进度回调 (0-1)
 */
export async function compressImage(file, options = {}) {
  const { maxWidth = 1200, quality = 0.75, aspectRatio = null, onProgress } = options

  if (!file || !file.type.startsWith('image/')) return file
  onProgress && onProgress(0.1)

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      onProgress && onProgress(0.3)

      let srcW = img.naturalWidth || img.width
      let srcH = img.naturalHeight || img.height
      if (!srcW || !srcH) {
        resolve(file)
        return
      }

      // 1. 先按比例裁剪（如 4:3）
      let cropW = srcW
      let cropH = srcH
      let cropX = 0
      let cropY = 0
      if (aspectRatio) {
        const targetRatio = aspectRatio
        const currentRatio = srcW / srcH
        if (currentRatio > targetRatio) {
          // 图太宽，裁左右
          cropW = srcH * targetRatio
          cropX = (srcW - cropW) / 2
        } else {
          // 图太高，裁上下
          cropH = srcW / targetRatio
          cropY = (srcH - cropH) / 2
        }
      }

      // 2. 再按最大宽度缩放
      let outW = cropW
      let outH = cropH
      if (outW > maxWidth) {
        const scale = maxWidth / outW
        outW = Math.round(outW * scale)
        outH = Math.round(outH * scale)
      }

      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')
      // 白色背景（避免透明 PNG 转 JPEG 后变黑）
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, outW, outH)
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH)

      onProgress && onProgress(0.7)

      // 统一输出 JPEG（体积小、兼容性好）；原图是 webp 则保留
      let mimeType = 'image/jpeg'
      if (file.type === 'image/webp') mimeType = 'image/webp'

      canvas.toBlob(
        (blob) => {
          onProgress && onProgress(1)
          if (!blob) {
            resolve(file)
            return
          }
          // 扩展名跟随输出类型
          const ext = mimeType === 'image/webp' ? 'webp' : 'jpg'
          const name = file.name.replace(/\.[^.]+$/, '') + '.' + ext
          const compressed = new File([blob], name, { type: mimeType })
          resolve(compressed)
        },
        mimeType,
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      onProgress && onProgress(1)
      resolve(file)
    }

    img.src = url
  })
}

/**
 * 压缩封面图：4:3 裁剪，宽 800px，质量 75%
 */
export function compressCoverImage(file, onProgress) {
  return compressImage(file, {
    maxWidth: 800,
    quality: 0.75,
    aspectRatio: 4 / 3,
    onProgress
  })
}

/**
 * 压缩记录照片：宽 1200px，质量 75%（不裁剪）
 */
export function compressRecordImage(file, onProgress) {
  return compressImage(file, {
    maxWidth: 1200,
    quality: 0.75,
    aspectRatio: null,
    onProgress
  })
}

/**
 * 批量压缩记录照片
 */
export async function compressRecordImages(files, onProgress) {
  const list = Array.from(files)
  const results = []
  for (let i = 0; i < list.length; i++) {
    // 单张进度 0-1，映射到整体进度区间
    const per = 1 / list.length
    const base = i * per
    const compressed = await compressRecordImage(list[i], (p) => {
      onProgress && onProgress(base + p * per)
    })
    results.push(compressed)
  }
  return results
}
