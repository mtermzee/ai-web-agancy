"use client";

import { AlertTriangle, CheckCircle2, Database, RefreshCw, RotateCcw } from "lucide-react";
import { useCompanyStore } from "@/components/providers/CompanyStoreProvider";

export default function Page() {
  const { dataSource, syncing, syncError, syncFromSupabase, resetDemoData, companies } = useCompanyStore();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Workspace</div>
          <h1>Settings</h1>
          <p className="page-subtitle">Integration status and MVP data controls.</p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="card panel">
          <div className="panel-header">
            <div>
              <h2>Supabase</h2>
              <div className="panel-note">Authenticated persistence layer for Sprint 0.6</div>
            </div>
            <span className={`badge ${dataSource === "supabase" ? "green" : "orange"}`}>
              {dataSource === "supabase" ? "Connected" : "Local fallback"}
            </span>
          </div>

          <div className="integration-status">
            <div className={`integration-icon ${dataSource === "supabase" ? "ok" : "warning"}`}>
              {dataSource === "supabase" ? <Database size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div>
              <strong>{dataSource === "supabase" ? "Supabase is active" : "Using browser fallback"}</strong>
              <p>
                {dataSource === "supabase"
                  ? `${companies.length} companies are loaded from Supabase. CRM edits are persisted remotely.`
                  : "The UI is using local seed data. Verify migrations 001 + 002, workspace membership and the Vercel environment variables."}
              </p>
            </div>
          </div>

          {syncError && (
            <div className="sync-error">
              <AlertTriangle size={16} />
              <span>{syncError}</span>
            </div>
          )}

          <div className="settings-actions">
            <button className="button secondary" onClick={() => void syncFromSupabase()} disabled={syncing}>
              <RefreshCw size={15} className={syncing ? "spin-icon" : ""} />
              {syncing ? "Syncing…" : "Sync from Supabase"}
            </button>
            <button className="button secondary" onClick={resetDemoData} disabled={syncing}>
              <RotateCcw size={15} />Reset demo data
            </button>
          </div>
        </section>

        <section className="card panel">
          <div className="panel-header">
            <div>
              <h2>Integration checklist</h2>
              <div className="panel-note">What is wired into the code now</div>
            </div>
          </div>
          <ul className="integration-list">
            {[
              "Browser Supabase client",
              "Server Supabase client",
              "Supabase Auth login + logout",
              "Next.js proxy session refresh",
              "Server-side protected routes",
              "Workspace membership gate",
              "Authenticated-only RLS policies",
              "Companies + website audits",
              "Lead score, status and priority",
              "Notes + activity timeline",
              "Mockup state",
              "Outreach drafts + approval",
              "LocalStorage network fallback",
            ].map((item) => (
              <li key={item}><CheckCircle2 size={15} />{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
