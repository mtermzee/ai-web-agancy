-- AgencyOS MVP 0.6 — Supabase Auth + secure workspace RLS
-- Run AFTER 001_agencyos_mvp.sql.
--
-- This migration removes all anonymous access. It also adds an explicit
-- workspace allowlist, so even if Supabase sign-up is accidentally enabled,
-- a newly authenticated user still cannot access AgencyOS data.
--
-- AFTER running this migration:
-- 1) Create your user in Supabase Dashboard -> Authentication -> Users.
-- 2) Copy that user's UUID.
-- 3) Run:
--      insert into public.workspace_members (user_id, role)
--      values ('YOUR_AUTH_USER_UUID'::uuid, 'owner')
--      on conflict (user_id) do update set role = excluded.role;

create table if not exists public.workspace_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now()
);

alter table public.workspace_members enable row level security;

-- Privileges and RLS work together. Anonymous visitors get no table privileges.
revoke all on table public.workspace_members from anon, authenticated;
grant select on table public.workspace_members to authenticated;

drop policy if exists "Members can read own membership" on public.workspace_members;
create policy "Members can read own membership"
on public.workspace_members
for select
to authenticated
using ((select auth.uid()) = user_id);

-- Remove the permissive 0.5 policies and replace them with workspace-member-only policies.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'companies',
    'website_audits',
    'leads',
    'lead_notes',
    'lead_activities',
    'mockups',
    'outreach'
  ]
  loop
    execute format('drop policy if exists "MVP public read %s" on public.%I', table_name, table_name);
    execute format('drop policy if exists "MVP public insert %s" on public.%I', table_name, table_name);
    execute format('drop policy if exists "MVP public update %s" on public.%I', table_name, table_name);
    execute format('drop policy if exists "MVP public delete %s" on public.%I', table_name, table_name);

    -- Re-running 0.6 remains safe.
    execute format('drop policy if exists "Workspace members read %s" on public.%I', table_name, table_name);
    execute format('drop policy if exists "Workspace members insert %s" on public.%I', table_name, table_name);
    execute format('drop policy if exists "Workspace members update %s" on public.%I', table_name, table_name);
    execute format('drop policy if exists "Workspace members delete %s" on public.%I', table_name, table_name);

    execute format('revoke all on table public.%I from anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);

    execute format(
      'create policy "Workspace members read %s" on public.%I for select to authenticated using (exists (select 1 from public.workspace_members wm where wm.user_id = (select auth.uid())))',
      table_name,
      table_name
    );
    execute format(
      'create policy "Workspace members insert %s" on public.%I for insert to authenticated with check (exists (select 1 from public.workspace_members wm where wm.user_id = (select auth.uid())))',
      table_name,
      table_name
    );
    execute format(
      'create policy "Workspace members update %s" on public.%I for update to authenticated using (exists (select 1 from public.workspace_members wm where wm.user_id = (select auth.uid()))) with check (exists (select 1 from public.workspace_members wm where wm.user_id = (select auth.uid())))',
      table_name,
      table_name
    );
    execute format(
      'create policy "Workspace members delete %s" on public.%I for delete to authenticated using (exists (select 1 from public.workspace_members wm where wm.user_id = (select auth.uid())))',
      table_name,
      table_name
    );
  end loop;
end $$;
