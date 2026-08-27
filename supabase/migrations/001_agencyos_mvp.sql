-- AgencyOS MVP 0.5
-- Run this once in the Supabase SQL Editor before switching the app to Supabase.
-- IMPORTANT: The policies below intentionally allow anonymous read/write access for this public MVP.
-- Replace them with authenticated workspace/user policies before using real customer data.

create extension if not exists pgcrypto;

create table if not exists public.companies (
  id text primary key,
  name text not null,
  industry text not null,
  address text not null default '',
  city text not null default '',
  country text not null default '',
  phone text not null default '',
  email text not null default '',
  website text,
  has_website boolean not null default false,
  google_rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.website_audits (
  id uuid primary key default gen_random_uuid(),
  company_id text not null unique references public.companies(id) on delete cascade,
  overall_score integer not null check (overall_score between 0 and 100),
  design_score integer not null check (design_score between 0 and 100),
  mobile_score integer not null check (mobile_score between 0 and 100),
  seo_score integer not null check (seo_score between 0 and 100),
  performance_score integer not null check (performance_score between 0 and 100),
  conversion_score integer not null check (conversion_score between 0 and 100),
  problems text[] not null default '{}',
  strengths text[] not null default '{}',
  ai_summary text not null default '',
  opportunity text not null default '',
  recommendation text not null default '',
  suggested_structure text[] not null default '{}',
  sales_angle text not null default '',
  last_analyzed_at text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company_id text not null unique references public.companies(id) on delete cascade,
  status text not null default 'New',
  potential text not null default 'Medium',
  lead_score integer not null default 0 check (lead_score between 0 and 100),
  priority text not null default 'Normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  company_id text not null unique references public.companies(id) on delete cascade,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_activities (
  id text primary key,
  company_id text not null references public.companies(id) on delete cascade,
  type text not null,
  title text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists lead_activities_company_created_idx
  on public.lead_activities(company_id, created_at desc);

create table if not exists public.mockups (
  id uuid primary key default gen_random_uuid(),
  company_id text not null unique references public.companies(id) on delete cascade,
  status text not null default 'pending',
  mockup_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.outreach (
  id uuid primary key default gen_random_uuid(),
  company_id text not null unique references public.companies(id) on delete cascade,
  subject text not null default '',
  message text not null default '',
  approved boolean not null default false,
  status text not null default 'draft',
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at automatic.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['companies','website_audits','leads','lead_notes','mockups','outreach']
  loop
    execute format('drop trigger if exists set_%s_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%s_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end $$;

-- RLS stays enabled even for the MVP. These policies are intentionally permissive
-- because version 0.5 has no authentication yet.
alter table public.companies enable row level security;
alter table public.website_audits enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.lead_activities enable row level security;
alter table public.mockups enable row level security;
alter table public.outreach enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['companies','website_audits','leads','lead_notes','lead_activities','mockups','outreach']
  loop
    execute format('drop policy if exists "MVP public read %s" on public.%I', table_name, table_name);
    execute format('drop policy if exists "MVP public insert %s" on public.%I', table_name, table_name);
    execute format('drop policy if exists "MVP public update %s" on public.%I', table_name, table_name);
    execute format('drop policy if exists "MVP public delete %s" on public.%I', table_name, table_name);

    execute format('create policy "MVP public read %s" on public.%I for select to anon, authenticated using (true)', table_name, table_name);
    execute format('create policy "MVP public insert %s" on public.%I for insert to anon, authenticated with check (true)', table_name, table_name);
    execute format('create policy "MVP public update %s" on public.%I for update to anon, authenticated using (true) with check (true)', table_name, table_name);
    execute format('create policy "MVP public delete %s" on public.%I for delete to anon, authenticated using (true)', table_name, table_name);
  end loop;
end $$;
