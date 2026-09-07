# 植迹 PlantTrace

极简私人植物成长档案 —— 集卡式植物图鉴 + 单株植物独立生长时间线。

## 技术栈

- **前端**：Vue 3 + Vite + Vue Router 4 + Pinia
- **样式**：Tailwind CSS（严格按 UI 设计规范配置）
- **后端**：Supabase（数据库 + Storage + Auth）
- **PWA**：vite-plugin-pwa

## 项目结构

```
zhi-ji/
├── src/
│   ├── views/          # Home(首页集卡墙)、PlantDetail(详情页)、Stats(统计)、Login
│   │   └── admin/      # AdminLogin(后台登录)、AdminDashboard(后台仪表盘)
│   ├── components/     # PlantCard、TimelineItem、PlantForm、RecordForm、EventTag、AutocompleteInput
│   │   └── admin/      # StatusCard、Skeleton(后台专用组件)
│   ├── stores/         # plantStore、recordStore、userStore
│   ├── utils/          # supabase客户端、图片压缩、日期格式化、常量
│   ├── assets/         # 样式
│   ├── App.vue
│   └── main.js
├── api/                # Vercel Serverless Functions(管理员后台 API 代理，密钥只在此目录)
│   ├── _shared.js      # 服务端共享工具(Supabase REST/RPC 调用)
│   ├── auth.js         # 管理员登录校验
│   ├── system.js       # 系统状态总览
│   ├── database.js     # 数据库监控
│   ├── storage.js      # 存储监控
│   ├── users.js        # 用户管理
│   └── logs.js         # 系统日志
├── supabase/
│   ├── schema.sql      # 数据库初始化 SQL 脚本
│   └── admin_stats.sql # 管理员后台统计 RPC 函数(需在 SQL Editor 执行)
├── scripts/
│   └── gen_icons.py    # PWA 图标生成脚本
├── public/             # PWA 图标等静态资源
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 管理员后台

独立的后台管理系统，路径 `/admin`（不加入主应用底部导航，只能直接访问）。

- **登录页**：`/admin/login`，密码验证在服务端完成
- **仪表盘**：`/admin/dashboard`，30 秒自动刷新，监控网站/数据库/存储/用户状态
- **登录态**：`sessionStorage` 保存，关闭浏览器失效

### 后台部署步骤

1. **执行统计函数 SQL**：打开 Supabase 控制台 → SQL Editor，粘贴 `supabase/admin_stats.sql` 全部内容，点击 Run（创建绕过 RLS 的统计函数）
2. **配置环境变量**（在 Vercel 项目 Settings → Environment Variables）：
   - `ADMIN_PASSWORD`：后台登录密码（如 `plantrace2026`）
   - `SUPABASE_URL`：Supabase 项目 URL
   - `SUPABASE_SERVICE_ROLE_KEY`（可选）：service_role 密钥，用于直接查询全量数据；不配置则走 RPC 统计函数
   - `VERCEL_TOKEN`（可选）：Vercel API Token，用于查询部署状态
   - `VERCEL_PROJECT_NAME`（可选）：项目名，默认 `plant-trace`
3. **重新部署**：环境变量配置后需 Redeploy 生效

> 密钥只存在于 `api/` 目录的服务端函数（`process.env` 读取），绝不进入前端代码或 git 历史。

## 快速开始

### 1. 配置 Supabase

1. 前往 [supabase.com](https://supabase.com) 注册账号，创建新项目
2. 打开 **SQL Editor**，粘贴 `supabase/schema.sql` 的全部内容，点击 Run（一次运行完成建表和权限配置）
3. 打开 **Project Settings → API**，复制 `Project URL` 和 `anon public key`

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=你的-project-url
VITE_SUPABASE_ANON_KEY=你的-anon-key
```

### 3. 安装依赖并运行

```bash
npm install
npm run dev
```

### 4. 构建生产版本

```bash
npm run build
npm run preview
```

## 部署

推荐部署到 Vercel 或 Netlify（免费）：

**Vercel**：导入仓库 → 框架自动识别 Vite → 在环境变量中填入 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` → Deploy。

**Netlify**：导入仓库 → Build command `npm run build` → Publish directory `dist` → 配置环境变量 → Deploy。

详见 `docs/部署说明.md`。

## 文档

- `docs/使用说明.md`：如何新增植物、记录、同步
- `docs/部署说明.md`：Supabase + Vercel/Netlify 部署步骤
- `docs/PWA添加说明.md`：iOS / Android 添加到桌面步骤
