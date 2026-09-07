// api/system.js — 系统状态总览
import { ok, fail, supabaseRest } from './_shared.js'

export default async function handler(req) {
  try {
    // 1. Vercel 部署状态
    let vercel_status = 'unknown'
    let last_deploy = null
    let deploy_region = null
    let project_name = 'plant-trace'
    let vercel_error = null

    const vercelToken = process.env.VERCEL_TOKEN
    const vercelProject = process.env.VERCEL_PROJECT_NAME || 'plant-trace'

    if (vercelToken) {
      try {
        // 查项目列表拿 project id
        const listRes = await fetch(
          `https://api.vercel.com/v9/projects?limit=100`,
          { headers: { Authorization: `Bearer ${vercelToken}` } }
        )
        if (listRes.ok) {
          const listData = await listRes.json()
          const project = listData.projects?.find(
            (p) => p.name === vercelProject || p.name === project_name
          )
          if (project) {
            project_name = project.name
            const deploysRes = await fetch(
              `https://api.vercel.com/v6/deployments?projectId=${project.id}&limit=5`,
              { headers: { Authorization: `Bearer ${vercelToken}` } }
            )
            if (deploysRes.ok) {
              const deploys = await deploysRes.json()
              const latest = deploys.deployments?.[0]
              if (latest) {
                vercel_status = latest.state === 'READY' ? 'online' : latest.state
                last_deploy = latest.created
                deploy_region = latest.regions?.[0] || latest.region || null
              }
            }
          }
        }
      } catch (e) {
        vercel_error = e.message
      }
    } else {
      vercel_error = '未配置 VERCEL_TOKEN'
    }

    // 2. 数据库连接状态（尝试 SELECT 1）
    let db_status = 'error'
    let db_error = null
    try {
      // 通过 RPC 探测数据库连通性：调用一个轻量函数或直接查 health
      const data = await supabaseRest('plants?select=id&limit=1')
      db_status = Array.isArray(data) ? 'ok' : 'error'
    } catch (e) {
      db_error = e.message
      db_status = 'error'
    }

    return ok({
      vercel_status,
      last_deploy,
      deploy_region,
      project_name,
      db_status,
      db_error,
      vercel_error,
      current_time: new Date().toISOString()
    })
  } catch (e) {
    return fail(e)
  }
}
