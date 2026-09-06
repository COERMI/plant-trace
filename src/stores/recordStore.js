import { defineStore } from 'pinia'
import { supabase, STORAGE_BUCKET } from '../utils/supabase'
import { compressRecordImages } from '../utils/image'

export const useRecordStore = defineStore('record', {
  state: () => ({
    // 以 plantId 为 key 缓存记录
    recordsByPlant: {},
    loading: false
  }),
  actions: {
    /**
     * 加载某株植物的所有记录（倒序，最新在前）
     */
    async fetchRecords(plantId) {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('records')
          .select('*')
          .eq('plant_id', plantId)
          .order('record_date', { ascending: false })
        if (error) throw error
        this.recordsByPlant[plantId] = data || []
        return this.recordsByPlant[plantId]
      } finally {
        this.loading = false
      }
    },

    /**
     * 新增记录
     */
    async addRecord(plantId, payload, onProgress) {
      // 上传照片（可选，最多 9 张）
      const imageUrls = await this._uploadImages(payload.files, onProgress)

      const { data, error } = await supabase
        .from('records')
        .insert({
          plant_id: plantId,
          record_date: payload.record_date,
          event_type: payload.event_type,
          images: imageUrls.length ? imageUrls : null,
          content: payload.content || null
        })
        .select()
        .single()
      if (error) throw error

      if (!this.recordsByPlant[plantId]) this.recordsByPlant[plantId] = []
      this.recordsByPlant[plantId].unshift(data)
      return data
    },

    /**
     * 更新记录
     */
    async updateRecord(recordId, payload, onProgress) {
      // 新增照片（保留原有照片 + 新上传的）
      let images = payload.images || []
      if (payload.files && payload.files.length) {
        const newUrls = await this._uploadImages(payload.files, onProgress)
        images = [...images, ...newUrls]
      }

      const { data, error } = await supabase
        .from('records')
        .update({
          record_date: payload.record_date,
          event_type: payload.event_type,
          images: images.length ? images : null,
          content: payload.content || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', recordId)
        .select()
        .single()
      if (error) throw error

      // 更新本地缓存
      const plantId = data.plant_id
      if (this.recordsByPlant[plantId]) {
        const idx = this.recordsByPlant[plantId].findIndex((r) => r.id === recordId)
        if (idx !== -1) this.recordsByPlant[plantId][idx] = data
      }
      return data
    },

    /**
     * 删除记录
     */
    async deleteRecord(recordId, plantId) {
      const { error } = await supabase.from('records').delete().eq('id', recordId)
      if (error) throw error
      if (this.recordsByPlant[plantId]) {
        this.recordsByPlant[plantId] = this.recordsByPlant[plantId].filter((r) => r.id !== recordId)
      }
    },

    /**
     * 上传照片到 records/ 目录，返回公开 URL 数组
     */
    async _uploadImages(files, onProgress) {
      if (!files || !files.length) return []
      // 压缩阶段占整体进度前 40%，上传阶段占后 60%
      const compressed = await compressRecordImages(files, (p) => {
        onProgress && onProgress(p * 0.4)
      })
      const urls = []
      for (let i = 0; i < compressed.length; i++) {
        const file = compressed[i]
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `records/${crypto.randomUUID()}.${ext}`
        const { error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, file, { cacheControl: '3600', upsert: false })
        if (error) throw error
        const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
        urls.push(urlData.publicUrl)
        // 上传进度
        const per = 1 / compressed.length
        onProgress && onProgress(0.4 + (i + 1) * per * 0.6)
      }
      return urls
    }
  }
})
