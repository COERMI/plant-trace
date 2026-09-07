// scripts/build-vercel.mjs — 使用 Vercel Build Output API 生成 .vercel/output
// 1. 运行 vite build 生成 dist（静态资源）
// 2. 将 dist 复制到 .vercel/output/static
// 3. 将 api/*.js 复制到 .vercel/output/functions/api/*.func（每个函数一个目录）
// 4. 生成 config.json 路由
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, cpSync, writeFileSync, readdirSync, copyFileSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, '.vercel', 'output')
const staticDir = join(outDir, 'static')
const functionsDir = join(outDir, 'functions')

// 1. 清理旧输出
rmSync(outDir, { recursive: true, force: true })
mkdirSync(staticDir, { recursive: true })
mkdirSync(functionsDir, { recursive: true })

// 2. 运行 vite build
console.log('>>> 运行 vite build ...')
execSync('npm run build', { cwd: root, stdio: 'inherit' })

// 3. 复制 dist 到 static（用 shell cp 避免 Node 递归复制问题）
console.log('>>> 复制 dist -> .vercel/output/static ...')
if (process.platform === 'win32') {
  execSync(`xcopy /E /I /Y "${join(root, 'dist')}" "${staticDir}"`, { stdio: 'inherit', cwd: root })
} else {
  execSync(`cp -r "${join(root, 'dist')}/." "${staticDir}/"`, { stdio: 'inherit', cwd: root })
}

// 4. 复制 api 函数
console.log('>>> 生成 Serverless Functions ...')
const apiDir = join(root, 'api')
const apiFiles = readdirSync(apiDir).filter((f) => f.endsWith('.js'))

const routes = []

for (const file of apiFiles) {
  const name = file.replace('.js', '')
  const funcDir = join(functionsDir, `api/${name}.func`)
  mkdirSync(funcDir, { recursive: true })

  // 复制函数文件
  copyFileSync(join(apiDir, file), join(funcDir, 'index.js'))

  // 生成 package.json（声明 CommonJS，避免被根目录 type:module 干扰）
  writeFileSync(join(funcDir, 'package.json'), JSON.stringify({ type: 'commonjs' }, null, 2))

  // 复制共享代码
  const libDir = join(root, 'lib')
  if (existsSync(libDir)) {
    const libTarget = join(funcDir, 'lib')
    mkdirSync(libTarget, { recursive: true })
    for (const lf of readdirSync(libDir)) {
      copyFileSync(join(libDir, lf), join(libTarget, lf))
    }
  }

  // 生成 .vc-config.json（函数配置）
  writeFileSync(join(funcDir, '.vc-config.json'), JSON.stringify({
    runtime: 'nodejs20.x',
    handler: 'index.js',
    launcherType: 'Nodejs',
    shouldAddHelpers: true,
    maxDuration: 10
  }, null, 2))

  // 记录路由
  routes.push({ src: `^/api/${name}$`, dest: `/api/${name}` })
  console.log(`  ✓ /api/${name}`)
}

// 5. 生成 config.json
const config = {
  version: 3,
  routes: [
    ...routes,
    { handle: 'filesystem' },
    { src: '/((?!api/).*)', dest: '/index.html' }
  ]
}
writeFileSync(join(outDir, 'config.json'), JSON.stringify(config, null, 2))
console.log('>>> 生成 config.json 完成')
console.log('>>> Build Output API 目录结构：')
console.log('  .vercel/output/static        <- 前端静态资源')
console.log('  .vercel/output/functions/api <- Serverless Functions')
console.log('  .vercel/output/config.json   <- 路由配置')
