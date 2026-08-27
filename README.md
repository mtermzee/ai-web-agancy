# AgencyOS MVP — Sprint 0.6

AgencyOS is the interactive AI web-agency MVP built with Next.js, TypeScript and Supabase.
Sprint 0.6 adds authentication and locks the database behind an explicit workspace membership allowlist.

## Stack

- Next.js App Router
- TypeScript / React
- Supabase Database
- Supabase Auth
- `@supabase/ssr` cookie-based sessions
- Lucide Icons

## What Sprint 0.6 adds

- `/login` with Supabase email/password sign-in
- Logout from the top bar
- Server-side route protection with `auth.getClaims()`
- Next.js `proxy.ts` session refresh
- `workspace_members` allowlist
- Anonymous DB access revoked
- RLS policies restricted to authenticated workspace members
- `/access-denied` for authenticated users who are not workspace members
- Existing Companies / Audits / Leads / Notes / Timeline / Mockups / Outreach persistence remains intact

## 1. Install

```bash
npm install
npm run dev
```

## 2. Supabase environment variables

Local `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://prgcclwtgbsvcxtawhyy.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Set the same variables in Vercel under Project Settings -> Environment Variables.

## 3. Database migrations

If Sprint 0.5 migration has not been run yet, run first:

```text
supabase/migrations/001_agencyos_mvp.sql
```

Then run:

```text
supabase/migrations/002_auth_and_secure_rls.sql
```

Migration 002 removes the permissive anonymous policies from 0.5 and adds the `workspace_members` access gate.

## 4. Create your login user

In Supabase Dashboard:

1. Authentication -> Users
2. Create a user with your email and password
3. Make sure the user can sign in

AgencyOS intentionally exposes no public sign-up page.

## 5. Authorize the user for AgencyOS

Open:

```text
supabase/setup/authorize_owner.sql
```

Replace `YOUR_LOGIN_EMAIL@example.com` with the exact Auth email and run the SQL in Supabase SQL Editor.

The final verification query should show one row with role `owner`.

## 6. Recommended Supabase Auth setting

Because this MVP is currently a private single-workspace app, keep public user registration disabled in Supabase Auth settings. The workspace allowlist still protects the data if registration is accidentally enabled later.

## 7. Deploy

```bash
git add .
git commit -m "feat: add Supabase auth and secure RLS"
git push
```

Vercel should deploy automatically.

Open the production app. Signed-out visitors should be redirected to `/login`. After sign-in, only users present in `workspace_members` can enter the dashboard.

## Security model

Browser code uses only the Supabase publishable key. It is not a database secret. Authorization is enforced by Supabase Auth + Postgres grants + RLS. No service-role/secret key is included in the frontend.

Current workspace model: all authorized `workspace_members` share the same AgencyOS dataset. A later SaaS/multi-tenant sprint can add `workspace_id` ownership to every domain table.
