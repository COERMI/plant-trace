-- ============================================================
-- 「植迹 PlantTrace」Supabase 数据库初始化脚本
-- 使用方式：在 Supabase 控制台 → SQL Editor → 新建查询，粘贴本文件全部内容，点击 Run
-- 注意：请一次运行，确保表和策略都创建成功
-- ============================================================

-- ---------- 扩展 ----------
create extension if not exists "pgcrypto";

-- ---------- 表 1：植物档案 plants ----------
create table if not exists public.plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  cover_image text not null,
  category text,
  strain text,
  variety text,
  acquire_date date not null default current_date,
  acquire_source text,
  current_status text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- 表 2：生长记录 records ----------
create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plant_id uuid references plants(id) on delete cascade not null,
  record_date timestamptz not null default now(),
  event_type text not null,
  images text[],
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- 索引 ----------
create index if not exists idx_plants_user on public.plants(user_id);
create index if not exists idx_records_plant on public.records(plant_id);
create index if not exists idx_records_user on public.records(user_id);

-- ---------- updated_at 自动更新触发器 ----------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_plants_updated on public.plants;
create trigger trg_plants_updated
  before update on public.plants
  for each row execute function public.set_updated_at();

drop trigger if exists trg_records_updated on public.records;
create trigger trg_records_updated
  before update on public.records
  for each row execute function public.set_updated_at();

-- ---------- 行级安全策略（RLS）----------
-- 每个用户只能读写自己的数据

alter table public.plants enable row level security;
alter table public.records enable row level security;

drop policy if exists "plants_select_own" on public.plants;
create policy "plants_select_own" on public.plants
  for select using (auth.uid() = user_id);

drop policy if exists "plants_insert_own" on public.plants;
create policy "plants_insert_own" on public.plants
  for insert with check (auth.uid() = user_id);

drop policy if exists "plants_update_own" on public.plants;
create policy "plants_update_own" on public.plants
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "plants_delete_own" on public.plants;
create policy "plants_delete_own" on public.plants
  for delete using (auth.uid() = user_id);

drop policy if exists "records_select_own" on public.records;
create policy "records_select_own" on public.records
  for select using (auth.uid() = user_id);

drop policy if exists "records_insert_own" on public.records;
create policy "records_insert_own" on public.records
  for insert with check (auth.uid() = user_id);

drop policy if exists "records_update_own" on public.records;
create policy "records_update_own" on public.records
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "records_delete_own" on public.records;
create policy "records_delete_own" on public.records
  for delete using (auth.uid() = user_id);

-- ============================================================
-- 存储桶与存储策略（Storage Bucket）
-- 桶名：plant-images（公开读，认证用户写）
-- ============================================================

insert into storage.buckets (id, name, public)
values ('plant-images', 'plant-images', true)
on conflict (id) do nothing;

-- 公开读取（封面图和记录照片都公开可读，便于 CDN 加载）
drop policy if exists "plant_images_public_read" on storage.objects;
create policy "plant_images_public_read" on storage.objects
  for select using (bucket_id = 'plant-images');

-- 认证用户可上传
drop policy if exists "plant_images_auth_insert" on storage.objects;
create policy "plant_images_auth_insert" on storage.objects
  for insert with check (bucket_id = 'plant-images' and auth.role() = 'authenticated');

-- 认证用户可更新/删除自己上传的文件
drop policy if exists "plant_images_auth_update" on storage.objects;
create policy "plant_images_auth_update" on storage.objects
  for update using (bucket_id = 'plant-images' and auth.role() = 'authenticated');

drop policy if exists "plant_images_auth_delete" on storage.objects;
create policy "plant_images_auth_delete" on storage.objects
  for delete using (bucket_id = 'plant-images' and auth.role() = 'authenticated');

-- ============================================================
-- 完成
-- ============================================================
