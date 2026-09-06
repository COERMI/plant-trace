import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[植迹] 未检测到 Supabase 配置。请在项目根目录创建 .env 文件，填入 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY（参考 .env.example）。'
  )
}

// 创建 Supabase 客户端单例
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

// 存储桶名称
export const STORAGE_BUCKET = 'plant-images'
