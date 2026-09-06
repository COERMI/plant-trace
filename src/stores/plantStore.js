import { defineStore } from 'pinia'
import { supabase, STORAGE_BUCKET } from '../utils/supabase'
import { compressCoverImage } from '../utils/image'

export const usePlantStore = defineStore('plant', {
  state: () => ({
    plants: [],
    loading: false,
    loaded: false
  }),
  getters: {
    /**
     * 所有已使用的品类标签（去重、非空）
     */
    categories: (state) => {
      const set = new Set()
      state.plants.forEach((p) => {
        if (p.category && p.category.trim()) set.add(p.category.trim())
      })
      return [...set]
    }
  },
  actions: {
    /**
     * 加载当前用户所有植物（按入手时间倒序）
     */
    async fetchPlants() {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('plants')
          .select('*')
          .order('acquire_date', { ascending: false })
          .order('created_at', { ascending: false })
        if (error) throw error
        this.plants = data || []
        this.loaded = true
        return this.plants
      } finally {
        this.loading = false
      }
    },

    /**
     * 新增植物
     * @param {Object} payload 表单数据（含 coverFile 图片文件）
     */
    async addPlant(payload, onProgress) {
      // 1. 上传封面图
      const coverUrl = await this._uploadCover(payload.coverFile, onProgress)

      // 2. 写入数据库
      const { data, error } = await supabase
        .from('plants')
        .insert({
          name: payload.name,
          cover_image: coverUrl,
          category: payload.category || null,
          strain: payload.strain || null,
          variety: payload.variety || null,
          acquire_date: payload.acquire_date,
          acquire_source: payload.acquire_source || null,
          current_status: payload.current_status || null,
          notes: payload.notes || null
        })
        .select()
        .single()
      if (error) throw error

      this.plants.unshift(data)
      return data
    },

    /**
     * 更新植物
     */
    async updatePlant(id, payload, onProgress) {
      let coverUrl = payload.cover_image

      // 若选择了新封面图则重新上传
      if (payload.coverFile) {
        coverUrl = await this._uploadCover(payload.coverFile, onProgress)
      }

      const { data, error } = await supabase
        .from('plants')
        .update({
          name: payload.name,
          cover_image: coverUrl,
          category: payload.category || null,
          strain: payload.strain || null,
          variety: payload.variety || null,
          acquire_date: payload.acquire_date,
          acquire_source: payload.acquire_source || null,
          current_status: payload.current_status || null,
          notes: payload.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error

      // 更新本地缓存
      const idx = this.plants.findIndex((p) => p.id === id)
      if (idx !== -1) this.plants[idx] = data
      return data
    },

    /**
     * 删除植物（级联删除记录由数据库 RLS 处理）
     */
    async deletePlant(id) {
      const { error } = await supabase.from('plants').delete().eq('id', id)
      if (error) throw error
      this.plants = this.plants.filter((p) => p.id !== id)
    },

    /**
     * 上传封面图到 covers/ 目录，返回公开 URL
     */
    async _uploadCover(file, onProgress) {
      // 压缩（4:3 裁剪，宽 800px，质量 75%）占前 50% 进度
      const compressed = await compressCoverImage(file, (p) => {
        onProgress && onProgress(p * 0.5)
      })
      const ext = compressed.name.split('.').pop() || 'jpg'
      const path = `covers/${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, compressed, { cacheControl: '3600', upsert: false })
      if (error) throw error
      onProgress && onProgress(1)

      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
      return urlData.publicUrl
    }
  }
})
