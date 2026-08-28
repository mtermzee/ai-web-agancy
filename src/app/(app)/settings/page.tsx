"use client";

import { AlertTriangle, CheckCircle2, Database, Download, RefreshCw, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { useCompanyStore } from "@/components/providers/CompanyStoreProvider";

export default function Page() {
  const {
    dataSource,
    syncing,
    syncError,
    syncFromSupabase,
    deleteDemoData,
    clearAllData,
    loadDemoData,
    companies,
  } = useCompanyStore();

  const handleDeleteDemo = async () => {
    if (window.confirm("Möchtest du die 8 Demo-Leads wirklich löschen? Importierte / echte Leads bleiben erhalten.")) {
      await deleteDemoData();
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("WARNUNG: Möchtest du wirklich ALLE Unternehmen & Leads aus der Datenbank löschen?")) {
      await clearAllData();
    }
  };

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
              <div className="panel-note">Authenticated persistence layer</div>
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
                  : "The UI is using local seed data. Verify migrations 001–003, workspace membership and the Vercel environment variables."}
              </p>
            </div>
          </div>

          {syncError && (
            <div className="sync-error">
              <AlertTriangle size={16} />
              <span>{syncError}</span>
            </div>
          )}

          <div className="settings-actions" style={{ flexWrap: "wrap", gap: "10px" }}>
            <button className="button secondary" onClick={() => void syncFromSupabase()} disabled={syncing}>
              <RefreshCw size={15} className={syncing ? "spin-icon" : ""} />
              {syncing ? "Syncing…" : "Sync from Supabase"}
            </button>
            <button className="button secondary" onClick={handleDeleteDemo} disabled={syncing} style={{ color: "#b54708" }}>
              <Trash2 size={15} /> 8 Demo-Leads löschen
            </button>
            <button className="button secondary" onClick={handleClearAll} disabled={syncing} style={{ color: "#d92d20" }}>
              <Trash2 size={15} /> Alle Daten leeren
            </button>
            <button className="button secondary" onClick={() => void loadDemoData()} disabled={syncing}>
              <Download size={15} /> Demo-Daten laden
            </button>
          </div>
        </section>

        <section className="card panel">
          <div className="panel-header">
            <div>
              <h2>Gemini</h2>
              <div className="panel-note">Server-side AI analysis · Sprint 0.7</div>
            </div>
            <span className="badge purple">Server only</span>
          </div>
          <div className="integration-status">
            <div className="integration-icon ai"><Sparkles size={20} /></div>
            <div>
              <strong>Gemini 3.7 Flash ready in code</strong>
              <p>Add <code>GEMINI_API_KEY</code> to Vercel and local <code>.env.local</code>. The key is never exposed with a NEXT_PUBLIC_ prefix. Public websites are analyzed with URL Context.</p>
            </div>
          </div>
        </section>

        <section className="card panel settings-span">
          <div className="panel-header">
            <div>
              <h2>Integration checklist</h2>
              <div className="panel-note">What is wired into the code now</div>
            </div>
          </div>
          <ul className="integration-list">
            {[
              "Browser + server Supabase clients",
              "Supabase Auth login + logout",
              "Workspace membership gate",
              "Authenticated-only RLS policies",
              "Companies + website audits",
              "Lead score, status and priority",
              "Notes + activity timeline",
              "Mockup state",
              "Outreach drafts + approval",
              "Gemini server API route",
              "Gemini structured JSON analysis",
              "Website URL Context",
              "AI analysis run history",
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
