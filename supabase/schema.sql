-- HB Capital — full client management schema
-- Run this once in Supabase SQL Editor (Project → SQL Editor → New query → Run).
-- Safe to re-run: uses "if not exists" / "or replace" throughout.
--
-- This replaces the old mentorship_registrations-only schema with a proper
-- auth-linked system: real accounts (Supabase Auth), enrollments, and
-- per-cluster payment/approval progress — all gated by Row Level Security.

create extension if not exists pgcrypto;

-- ============================================================
-- ADMIN EMAIL — the one account with full management access.
-- Referenced in RLS policies and functions below.
-- ============================================================
-- fatsaninkhono01@gmail.com

-- ============================================================
-- PROFILES — one row per signed-up user, extends auth.users
-- ============================================================
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  created_at  timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admin can view all profiles"
  on profiles for select
  to authenticated
  using (auth.email() = 'fatsaninkhono01@gmail.com');

-- Auto-create a profile row whenever someone signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- CLUSTERS — static reference data, the 9 clusters
-- ============================================================
create table if not exists clusters (
  id          smallint primary key,
  level       text not null,       -- 'Foundation' | 'Intermediate' | 'Professional'
  name        text not null,
  price_mwk   integer not null,
  sort_order  smallint not null
);

insert into clusters (id, level, name, price_mwk, sort_order) values
  (1, 'Foundation',    'Markets & Trading Basics',            200000, 1),
  (2, 'Foundation',    'Price Action & Analysis',              200000, 2),
  (3, 'Foundation',    'Risk Management & Psychology',         200000, 3),
  (4, 'Intermediate',  'Advanced Technical Analysis',          300000, 4),
  (5, 'Intermediate',  'Fundamental & Macro Analysis',         300000, 5),
  (6, 'Intermediate',  'Strategy Development & Backtesting',   300000, 6),
  (7, 'Professional',  'Professional Market Analysis',         450000, 7),
  (8, 'Professional',  'Quantitative & Advanced Risk',         450000, 8),
  (9, 'Professional',  'Building the Professional System',     450000, 9)
on conflict (id) do nothing;

alter table clusters enable row level security;

create policy "Anyone signed in can view the cluster list"
  on clusters for select
  to authenticated
  using (true);

-- ============================================================
-- ENROLLMENTS — one row per client's program signup
-- ============================================================
create table if not exists enrollments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  plan                text not null,   -- 'Foundation' | 'Intermediate' | 'Professional' | 'Full Program'
  status              text not null default 'pending',  -- 'pending' | 'active' | 'expired' | 'cancelled'
  payment_method      text,
  payment_reference   text,
  expires_at          date,
  created_at          timestamptz not null default now(),
  approved_at         timestamptz,
  approved_by         text
);

alter table enrollments enable row level security;

create policy "Users can view their own enrollment"
  on enrollments for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own enrollment"
  on enrollments for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'pending');

create policy "Admin can view all enrollments"
  on enrollments for select
  to authenticated
  using (auth.email() = 'fatsaninkhono01@gmail.com');

create policy "Admin can update all enrollments"
  on enrollments for update
  to authenticated
  using (auth.email() = 'fatsaninkhono01@gmail.com');

-- ============================================================
-- CLIENT_CLUSTERS — per-user progress through the 9 clusters
-- ============================================================
create table if not exists client_clusters (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  cluster_id          smallint not null references clusters(id),
  status              text not null default 'locked',
                        -- 'locked' | 'pending_payment' | 'submitted' | 'approved' | 'completed'
  payment_method      text,
  payment_reference   text,
  submitted_at        timestamptz,
  approved_at         timestamptz,
  approved_by         text,
  unique (user_id, cluster_id)
);

alter table client_clusters enable row level security;

create policy "Users can view their own cluster progress"
  on client_clusters for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own initial cluster rows"
  on client_clusters for insert
  to authenticated
  with check (auth.uid() = user_id and status in ('locked', 'pending_payment'));

create policy "Admin can view all cluster progress"
  on client_clusters for select
  to authenticated
  using (auth.email() = 'fatsaninkhono01@gmail.com');

-- ============================================================
-- FUNCTIONS — the only way statuses move to "submitted" or "approved"
-- ============================================================

-- A client submits payment proof for a cluster that's awaiting payment.
create or replace function submit_cluster_payment(p_cluster_id smallint, p_method text, p_reference text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update client_clusters
  set status = 'submitted',
      payment_method = p_method,
      payment_reference = p_reference,
      submitted_at = now()
  where user_id = auth.uid()
    and cluster_id = p_cluster_id
    and status = 'pending_payment';
end;
$$;

grant execute on function submit_cluster_payment(smallint, text, text) to authenticated;

-- Admin accepts a client's enrollment, sets an expiry date, and unlocks access.
-- Full Program: unlocks (approves) all 9 clusters immediately.
-- Single-level plans: unlocks only the first cluster of that level for payment.
create or replace function admin_approve_enrollment(p_enrollment_id uuid, p_expires_at date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_plan text;
begin
  if auth.email() <> 'fatsaninkhono01@gmail.com' then
    raise exception 'Not authorized';
  end if;

  select user_id, plan into v_user_id, v_plan
  from enrollments where id = p_enrollment_id;

  update enrollments
  set status = 'active', expires_at = p_expires_at, approved_at = now(), approved_by = auth.email()
  where id = p_enrollment_id;

  if v_plan = 'Full Program' then
    update client_clusters
    set status = 'approved', approved_at = now(), approved_by = auth.email()
    where user_id = v_user_id;
  else
    update client_clusters
    set status = 'pending_payment'
    where user_id = v_user_id
      and cluster_id = (
        select min(id) from clusters where level = v_plan
      )
      and status = 'locked';
  end if;
end;
$$;

grant execute on function admin_approve_enrollment(uuid, date) to authenticated;

-- Admin approves a single cluster payment, which unlocks the next cluster.
create or replace function admin_approve_cluster(p_user_id uuid, p_cluster_id smallint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next_id smallint;
begin
  if auth.email() <> 'fatsaninkhono01@gmail.com' then
    raise exception 'Not authorized';
  end if;

  update client_clusters
  set status = 'approved', approved_at = now(), approved_by = auth.email()
  where user_id = p_user_id and cluster_id = p_cluster_id;

  select id into v_next_id from clusters where id = p_cluster_id + 1;

  if v_next_id is not null then
    update client_clusters
    set status = 'pending_payment'
    where user_id = p_user_id and cluster_id = v_next_id and status = 'locked';
  end if;
end;
$$;

grant execute on function admin_approve_cluster(uuid, smallint) to authenticated;

-- Admin marks a cluster as fully completed (mentorship session done).
create or replace function admin_complete_cluster(p_user_id uuid, p_cluster_id smallint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.email() <> 'fatsaninkhono01@gmail.com' then
    raise exception 'Not authorized';
  end if;

  update client_clusters
  set status = 'completed'
  where user_id = p_user_id and cluster_id = p_cluster_id;
end;
$$;

grant execute on function admin_complete_cluster(uuid, smallint) to authenticated;

-- ============================================================
-- CLUSTER_RESOURCES — downloadable/linked materials per cluster.
-- Unlocks for a client once they've reached "approved" or "completed"
-- on that specific cluster — not before.
-- ============================================================
create table if not exists cluster_resources (
  id           uuid primary key default gen_random_uuid(),
  cluster_id   smallint not null references clusters(id),
  title        text not null,
  description  text,
  url          text not null,      -- link to the file (e.g. a Supabase Storage public URL, Google Drive link, etc.)
  sort_order   smallint not null default 0,
  created_at   timestamptz not null default now()
);

alter table cluster_resources enable row level security;

-- Clients can see resources only for clusters they've unlocked (approved or completed).
create policy "Clients can view resources for unlocked clusters"
  on cluster_resources for select
  to authenticated
  using (
    exists (
      select 1 from client_clusters cc
      where cc.user_id = auth.uid()
        and cc.cluster_id = cluster_resources.cluster_id
        and cc.status in ('approved', 'completed')
    )
  );

create policy "Admin can view all resources"
  on cluster_resources for select
  to authenticated
  using (auth.email() = 'fatsaninkhono01@gmail.com');

create policy "Admin can add resources"
  on cluster_resources for insert
  to authenticated
  with check (auth.email() = 'fatsaninkhono01@gmail.com');

create policy "Admin can edit resources"
  on cluster_resources for update
  to authenticated
  using (auth.email() = 'fatsaninkhono01@gmail.com');

create policy "Admin can delete resources"
  on cluster_resources for delete
  to authenticated
  using (auth.email() = 'fatsaninkhono01@gmail.com');
