-- AgencyOS MVP 0.7 — Gemini analysis run history
-- Run AFTER 001 + 002. The core Gemini route can still update website_audits/leads
-- without this table, but this migration adds traceability for each AI run.

create table if not exists public.ai_analysis_runs (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references public.companies(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  status text not null check (status in ('completed', 'failed')),
  model text not null,
  mode text not null check (mode in ('website_url_context', 'business_data_only')),
  input_url text,
  confidence integer check (confidence between 0 and 100),
  result jsonb,
  sources jsonb not null default '[]'::jsonb,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists ai_analysis_runs_company_created_idx
  on public.ai_analysis_runs(company_id, created_at desc);

alter table public.ai_analysis_runs enable row level security;
revoke all on table public.ai_analysis_runs from anon, authenticated;
grant select, insert, delete on table public.ai_analysis_runs to authenticated;

drop policy if exists "Workspace members read ai_analysis_runs" on public.ai_analysis_runs;
drop policy if exists "Workspace members insert ai_analysis_runs" on public.ai_analysis_runs;
drop policy if exists "Workspace members delete ai_analysis_runs" on public.ai_analysis_runs;

create policy "Workspace members read ai_analysis_runs"
on public.ai_analysis_runs
for select
to authenticated
using (exists (
  select 1 from public.workspace_members wm
  where wm.user_id = (select auth.uid())
));

create policy "Workspace members insert ai_analysis_runs"
on public.ai_analysis_runs
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.workspace_members wm
    where wm.user_id = (select auth.uid())
  )
);

create policy "Workspace members delete ai_analysis_runs"
on public.ai_analysis_runs
for delete
to authenticated
using (exists (
  select 1 from public.workspace_members wm
  where wm.user_id = (select auth.uid())
));
