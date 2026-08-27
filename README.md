# AgencyOS MVP — Sprint 0.3

A frontend-only MVP for an AI-assisted web-agency lead workflow. The app uses hardcoded company data plus LocalStorage for interactive CRM state. There is still no database, authentication, Gemini API, n8n workflow, scraping, or email sending.

## Sprint 0.3 features

- SaaS app shell with responsive sidebar/navigation
- Dashboard with live local KPIs
- 15 realistic dummy companies
- Search and filtering by industry, country, website, potential, status, website score and CRM priority
- Company detail view and website audit scores
- Simulated website mockup generation
- Human review queue
- Local lead score and priority management
- Internal notes per company
- Activity timeline for status, score, priority, notes, mockups and outreach actions
- Personalized outreach draft workspace
- Explicit human approval state for outreach drafts
- No automatic sending of any message
- LocalStorage persistence with migration from Sprint 0.2 state

## Architecture

- `src/data/companies.ts` — immutable dummy source data
- `src/types/company.ts` — company/audit domain model
- `src/types/workflow.ts` — CRM/workflow domain model
- `src/lib/workflow.ts` — deterministic MVP lead scoring and default outreach draft generation
- `src/components/providers/CompanyStoreProvider.tsx` — local repository/state adapter; intended replacement point for Supabase later
- `src/components/workflow/*` — CRM controls and activity timeline
- `src/components/outreach/*` — human-reviewed draft workspace

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Useful routes:

- `/dashboard`
- `/companies`
- `/companies/rheinblick-dental`
- `/leads`
- `/mockups`
- `/outreach`

## Next integration path

1. GitHub repository + CI baseline
2. Vercel deployment
3. Replace local workflow adapter with Supabase repositories
4. Gemini analysis API behind server-side routes/actions
5. n8n lead-finder ingestion
6. Website audit automation
7. Real scoring calibration
8. Outreach generation + human review, while keeping sending as a separate controlled step
