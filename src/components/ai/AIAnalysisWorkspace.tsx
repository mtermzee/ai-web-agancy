"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Search, Sparkles } from "lucide-react";
import { GeminiAnalyzeButton } from "@/components/ai/GeminiAnalyzeButton";
import { useCompanyStore } from "@/components/providers/CompanyStoreProvider";
import { ScoreChip } from "@/components/ui/ScoreChip";

function formatAnalyzedAt(value: string) {
  if (!value) return "Never";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

export function AIAnalysisWorkspace() {
  const { companies, getWorkflow } = useCompanyStore();
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...companies]
      .filter((company) => !term || `${company.name} ${company.industry} ${company.city}`.toLowerCase().includes(term))
      .sort((a, b) => (getWorkflow(b.id)?.leadScore ?? 0) - (getWorkflow(a.id)?.leadScore ?? 0));
  }, [companies, getWorkflow, search]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Gemini analyst</div>
          <h1>AI Analysis</h1>
          <p className="page-subtitle">Run human-triggered Gemini audits and persist the structured result to Supabase.</p>
        </div>
      </div>

      <section className="card ai-analysis-intro">
        <div className="ai-intro-icon"><Sparkles size={21} /></div>
        <div>
          <strong>Evidence-aware analysis</strong>
          <p>Companies with a public website use Gemini URL Context. Companies without a website are analyzed only from the stored business data. Google Search is not enabled in this sprint.</p>
        </div>
      </section>

      <section className="card table-card ai-analysis-table">
        <div className="table-toolbar ai-toolbar">
          <div className="field-wrap">
            <Search size={16} />
            <input className="control search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search companies…" />
          </div>
          <div className="ai-count">{rows.length} companies</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Analysis mode</th>
                <th>Website score</th>
                <th>Lead score</th>
                <th>Last analyzed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((company) => {
                const workflow = getWorkflow(company.id);
                return (
                  <tr key={company.id}>
                    <td>
                      <Link href={`/companies/${company.id}`} className="company-cell-link">
                        <strong>{company.name}</strong>
                        <span>{company.industry} · {company.city}</span>
                      </Link>
                    </td>
                    <td>
                      <span className={`analysis-mode ${company.hasWebsite ? "url" : "data"}`}>
                        {company.hasWebsite ? "URL Context" : "Business data"}
                      </span>
                    </td>
                    <td><ScoreChip score={company.scores.overall} /></td>
                    <td><span className="lead-score-chip compact">{workflow?.leadScore ?? 0}</span></td>
                    <td className="muted-cell">{formatAnalyzedAt(company.lastAnalyzedAt)}</td>
                    <td className="analysis-actions">
                      <GeminiAnalyzeButton companyId={company.id} compact />
                      <Link href={`/companies/${company.id}`} className="icon-button small" title="Open company"><ExternalLink size={14} /></Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
