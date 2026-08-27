# AgencyOS — MVP Sprint 0.7

AgencyOS is a Next.js/TypeScript web-agency lead workflow prototype. Sprint 0.7 adds real, human-triggered Gemini analysis on top of the authenticated Supabase workspace introduced in 0.6.

## What Sprint 0.7 adds

- Google Gen AI SDK (`@google/genai`)
- server-only `GEMINI_API_KEY`
- default model: `gemini-3.7-flash`
- authenticated `POST /api/ai/analyze`
- workspace membership check before every AI run
- Gemini structured JSON output
- Gemini URL Context for companies with a public website
- business-data-only analysis for companies without a website
- automatic persistence to `website_audits`
- automatic potential + lead-score update in `leads`
- human lead status is never changed by Gemini
- activity timeline entry for every successful analysis
- optional `ai_analysis_runs` history table for traceability
- real AI Analysis workspace at `/analysis`
- Analyze button on every company detail page
- no automatic outreach sending
- no Google Search grounding in this sprint (avoids surprise search-tool costs)

## Important limitation

URL Context can retrieve public page content, but this Sprint does not run a real browser, Lighthouse, Core Web Vitals, breakpoint tests, or screenshot-based visual QA. Design/mobile/performance scores are therefore AI-assisted estimates based on retrievable website evidence, not laboratory measurements.

## Install

```bash
npm install
npm run dev
```

## Environment variables

Keep your existing Supabase values and add:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...

# Server-only. Never use NEXT_PUBLIC_ for this key.
GEMINI_API_KEY=your_google_ai_studio_api_key
GEMINI_MODEL=gemini-3.7-flash
```

For Vercel, add `GEMINI_API_KEY` and optionally `GEMINI_MODEL` in Project Settings -> Environment Variables, then redeploy.

A consumer Gemini subscription does not substitute for the API credential used by the server route; use a Gemini API key from Google AI Studio / the Gemini API project you want billed or rate-limited.

## Supabase migrations

Run these in order if not already applied:

1. `supabase/migrations/001_agencyos_mvp.sql`
2. `supabase/migrations/002_auth_and_secure_rls.sql`
3. `supabase/migrations/003_gemini_analysis_runs.sql`

Migration 003 adds AI run history. The canonical analysis itself is stored in the existing `website_audits` and `leads` tables.

## AI flow

```text
Human clicks Analyze
        |
        v
POST /api/ai/analyze
        |
        +--> Supabase Auth + workspace membership
        |
        +--> load company from Supabase
        |
        +--> Gemini 3.7 Flash
              |
              +--> URL Context when website exists
              +--> stored business data when no website exists
        |
        v
Structured JSON
        |
        +--> website_audits
        +--> leads (potential / score / priority)
        +--> lead_activities
        +--> ai_analysis_runs
        |
        v
UI syncs from Supabase
```

## Main routes

- `/dashboard`
- `/companies`
- `/companies/[id]`
- `/analysis`
- `/leads`
- `/mockups`
- `/outreach`
- `/settings`

## Security

- Gemini key is server-only.
- The API route requires a valid Supabase session.
- The authenticated user must be present in `workspace_members`.
- Supabase RLS from Sprint 0.6 remains active.
- The client never receives `GEMINI_API_KEY`.
- Gemini analysis never sends outreach automatically.

## Next logical sprint

Sprint 0.8 can add a real deterministic website auditor (browser/Lighthouse-style metrics) and feed those measurements into Gemini. After that, n8n can start inserting real leads and triggering the same analysis pipeline without rewriting the frontend.
