// api/_shared.js — 服务端共享工具（CommonJS，仅供 api/*.js 使用）
// 密钥从 process.env 读取，绝不暴露给浏览器

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://lnlryoqmurfgxhjamndy.supabase.co'

// 优先 service_role（绕过 RLS），否则回退 anon key（配合 RPC 统计函数）
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  ''

// 未配置密钥时抛出清晰错误，便于部署后快速定位（缺环境变量 vs 缺 SQL 函数）
if (!SUPABASE_KEY) {
  console.warn('[plant-trace] 警告：未检测到 SUPABASE_SERVICE_ROLE_KEY 或 VITE_SUPABASE_ANON_KEY 环境变量，Supabase 查询将失败。请在 Vercel Settings → Environment Variables 配置。')
}

// 极简 fetch 版 Supabase REST 调用
async function supabaseRest(path, opts = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    },
    ...(opts.body ? { body: JSON.stringify(opts.body) } : {})
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Supabase REST ${res.status}: ${text.slice(0, 200)}`)
  }
  return res.json()
}

// 调用 PostgREST RPC（绕过 RLS 的统计函数）
async function supabaseRpc(fnName, args = {}) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/${fnName}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Supabase RPC ${res.status}: ${text.slice(0, 200)}`)
  }
  return res.json()
}

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  })
}

function ok(data) {
  return json(200, data)
}

function fail(err) {
  return json(200, { error: err && err.message ? err.message : String(err) })
}

module.exports = { SUPABASE_URL, SUPABASE_KEY, supabaseRest, supabaseRpc, json, ok, fail }
