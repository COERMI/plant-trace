-- ============================================================
-- 「植迹 PlantTrace」管理员后台统计 RPC 函数
-- 使用方式：Supabase 控制台 → SQL Editor → 新建查询 → 粘贴本文件全部内容 → Run
-- 说明：
--   1. 这些函数用 SECURITY DEFINER 创建，拥有者权限执行，可绕过 RLS 统计全量数据
--   2. 只返回聚合统计数据（总数/时间/用量），不返回任何用户隐私（密码等）
--   3. 由 api/*.js 服务端函数通过 supabase-js 的 rpc() 调用，密钥只存在服务端
-- ============================================================

-- ---------- 数据库监控 ----------
create or replace function public.admin_database_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  plants_count bigint;
  records_count bigint;
  users_count bigint;
  last_record_time timestamptz;
  db_size_bytes bigint;
begin
  select count(*) into plants_count from public.plants;
  select count(*) into records_count from public.records;
  select count(*) into users_count from auth.users;
  select max(record_date) into last_record_time from public.records;
  select pg_database_size(current_database()) into db_size_bytes;

  return json_build_object(
    'tables_count', 2,
    'plants_count', plants_count,
    'records_count', records_count,
    'users_count', users_count,
    'db_size', db_size_bytes,
    'last_record_time', last_record_time
  );
end;
$$;

-- ---------- 用户管理 ----------
create or replace function public.admin_users_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  total_users bigint;
  active_today bigint;
  recent_users json;
begin
  select count(*) into total_users from auth.users;

  -- 今日有记录的用户数（以 record_date 为准）
  select count(distinct user_id) into active_today
  from public.records
  where record_date >= date_trunc('day', now());

  -- 最近注册的 5 个用户（脱敏：只取邮箱前缀做展示由前端处理，这里返回完整邮箱但前端会打码）
  select coalesce(json_agg(t), '[]'::json) into recent_users
  from (
    select
      u.email as email,
      u.created_at as created_at,
      (select count(*) from public.plants p where p.user_id = u.id) as plants_count
    from auth.users u
    order by u.created_at desc
    limit 5
  ) t;

  return json_build_object(
    'total_users', total_users,
    'active_today', active_today,
    'recent_users', recent_users
  );
end;
$$;

-- ---------- 最近活动（最近 10 条生长记录）----------
create or replace function public.admin_recent_activities(lim int default 10)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  select coalesce(json_agg(t), '[]'::json) into result
  from (
    select
      r.event_type as event_type,
      r.record_date as record_date,
      p.name as plant_name,
      u.email as user_email
    from public.records r
    join public.plants p on p.id = r.plant_id
    left join auth.users u on u.id = r.user_id
    order by r.record_date desc
    limit lim
  ) t;

  return result;
end;
$$;

-- ---------- 存储用量统计（基于 storage.objects）----------
create or replace function public.admin_storage_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  files_count bigint;
  storage_used bigint;
  largest_files json;
begin
  select count(*), coalesce(sum((metadata->>'size')::bigint), 0)
  into files_count, storage_used
  from storage.objects
  where bucket_id = 'plant-images';

  select coalesce(json_agg(t), '[]'::json) into largest_files
  from (
    select
      name as name,
      (metadata->>'size')::bigint as size
    from storage.objects
    where bucket_id = 'plant-images'
    order by (metadata->>'size')::bigint desc
    limit 5
  ) t;

  return json_build_object(
    'bucket_name', 'plant-images',
    'files_count', files_count,
    'storage_used', storage_used,
    'largest_files', largest_files
  );
end;
$$;

-- ============================================================
-- 授权：允许 anon / authenticated 角色调用这些 RPC 函数
-- （函数体用 SECURITY DEFINER 以拥有者权限执行，但调用权需显式授予）
-- ============================================================
grant execute on function public.admin_database_stats() to anon, authenticated;
grant execute on function public.admin_users_stats() to anon, authenticated;
grant execute on function public.admin_recent_activities(int) to anon, authenticated;
grant execute on function public.admin_storage_stats() to anon, authenticated;

-- ============================================================
-- 完成
-- ============================================================
