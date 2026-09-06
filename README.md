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
│   ├── views/          # Home(首页集卡墙)、PlantDetail(详情页)、Login
│   ├── components/     # PlantCard、TimelineItem、PlantForm、RecordForm、EventTag、AutocompleteInput
│   ├── stores/         # plantStore、recordStore、userStore
│   ├── utils/          # supabase客户端、图片压缩、日期格式化、常量
│   ├── assets/         # 样式
│   ├── App.vue
│   └── main.js
├── supabase/
│   └── schema.sql      # 数据库初始化 SQL 脚本
├── scripts/
│   └── gen_icons.py    # PWA 图标生成脚本
├── public/             # PWA 图标等静态资源
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

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
