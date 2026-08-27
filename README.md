# AgencyOS MVP — Sprint 0.5 (Supabase)

AgencyOS is now connected to Supabase while keeping the existing Next.js UI and CRM workflow intact. GitHub + Vercel are assumed to be already configured.

## What changed in Sprint 0.5

- `@supabase/supabase-js` + `@supabase/ssr`
- Browser Supabase client
- Server Supabase client
- Next.js 16 `proxy.ts` session refresh using `auth.getClaims()`
- Normalized Supabase schema for:
  - `companies`
  - `website_audits`
  - `leads`
  - `lead_notes`
  - `lead_activities`
  - `mockups`
  - `outreach`
- Companies and workflow state load from Supabase
- Status, score, priority, notes, timeline, mockups and outreach are persisted to Supabase
- Empty database is automatically seeded with the existing 15 demo companies
- LocalStorage remains as a safe UI fallback if Supabase is unavailable or the migration has not been run
- Dynamic company detail/mockup routes can resolve Supabase-created company IDs server-side
- `/settings` shows Supabase connection/sync status

## 1. Install dependencies

```bash
npm install
```

The package file already includes:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## 2. Environment variables

Copy `.env.example` to `.env.local` for local development. The supplied project URL and publishable key are already present in the example.

For Vercel, add both variables under **Project → Settings → Environment Variables**:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Then redeploy.

## 3. Create the database tables

Open the Supabase SQL Editor and run:

```text
supabase/migrations/001_agencyos_mvp.sql
```

After the migration succeeds, open the app. If `companies` is empty, AgencyOS automatically seeds the 15 demo companies and their audits/workflow state.

## 4. Run locally

```bash
npm run dev
```

Open `http://localhost:3000/settings` first. It should show **Supabase — Connected**.

Useful routes:

- `/dashboard`
- `/companies`
- `/companies/rheinblick-dental`
- `/leads`
- `/mockups`
- `/outreach`
- `/settings`

## Architecture

- `src/data/companies.ts` — immutable demo seed/fallback
- `src/lib/repositories/agencyRepository.ts` — browser data repository + demo seeding + writes
- `src/lib/repositories/agencyServerRepository.ts` — server-side company lookup
- `src/lib/supabase/client.ts` — browser Supabase client
- `src/lib/supabase/server.ts` — server Supabase client
- `src/lib/supabase/proxy.ts` — session refresh helper
- `proxy.ts` — Next.js Proxy entry point
- `src/components/providers/CompanyStoreProvider.tsx` — optimistic UI state + Supabase persistence + LocalStorage fallback
- `supabase/migrations/001_agencyos_mvp.sql` — database schema and temporary MVP RLS policies

## Security note for this MVP

There is still **no authentication**. The migration intentionally uses temporary anonymous read/write RLS policies so the deployed MVP can persist data using the publishable key.

Do **not** store real customer data with these policies. Before production or real lead ingestion, the next security step should be Supabase Auth + workspace-scoped RLS policies. The publishable key itself is designed to be public; access control must come from RLS/authentication.

## Next sprint

Recommended next step: Gemini integration behind server-side routes/actions, while keeping analysis generation separate from database persistence. After that, the first n8n Lead Finder can insert companies into the same Supabase schema.
