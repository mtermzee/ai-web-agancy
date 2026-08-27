-- AgencyOS MVP 0.7.1 — allow Gemini fallback analysis mode
-- Run AFTER 003_gemini_analysis_runs.sql if you want fallback runs stored in AI history.
-- The core analysis works even before this migration; only history persistence for
-- stored_profile runs depends on this constraint update.

alter table public.ai_analysis_runs
  drop constraint if exists ai_analysis_runs_mode_check;

alter table public.ai_analysis_runs
  add constraint ai_analysis_runs_mode_check
  check (mode in ('website_url_context', 'stored_profile', 'business_data_only'));
