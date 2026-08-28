"use client";

import Link from "next/link";
import { CheckCircle2, Eye, LayoutTemplate, RefreshCw, XCircle } from "lucide-react";
import { PotentialBadge, StatusBadge } from "@/components/ui/Badge";
import { ScoreChip } from "@/components/ui/ScoreChip";
import { useCompanyStore } from "@/components/providers/CompanyStoreProvider";

export function ReviewQueue() {
  const { companies, getWorkflow, updateStatus, markMockupReady, syncFromSupabase, syncing } = useCompanyStore();
  const reviewCompanies = companies
    .filter((company) => ["Needs Review", "High Potential", "Mockup Ready"].includes(company.status))
    .sort((a, b) => (getWorkflow(b.id)?.leadScore ?? 0) - (getWorkflow(a.id)?.leadScore ?? 0));

  return <>
    <div className="review-summary">
      <div><strong>{reviewCompanies.length}</strong><span>items in review flow</span></div>
      <div><strong>{reviewCompanies.filter((company) => (getWorkflow(company.id)?.leadScore ?? 0) >= 80).length}</strong><span>lead score ≥ 80</span></div>
      <div><strong>{reviewCompanies.filter((company) => company.mockupReady).length}</strong><span>mockups ready</span></div>
      <button className="button secondary" onClick={() => void syncFromSupabase()} disabled={syncing}>
        <RefreshCw size={15} className={syncing ? "spin-icon" : ""}/>
        {syncing ? "Syncing…" : "Sync CRM"}
      </button>
    </div>
    <div className="review-grid">
      {reviewCompanies.map((company) => {
        const workflow = getWorkflow(company.id);
        return <article className="card review-card" key={company.id}>
          <div className="review-card-top"><div className="company-logo large">{company.name.split(" ").map((part) => part[0]).slice(0,2).join("")}</div><div className="review-title"><strong>{company.name}</strong><span>{company.industry} · {company.city}</span></div><ScoreChip score={company.scores.overall}/></div>
          <div className="badge-row"><StatusBadge status={company.status}/><PotentialBadge potential={company.potential}/>{workflow && <span className={`priority-pill priority-${workflow.priority.toLowerCase()}`}>{workflow.priority} · {workflow.leadScore}</span>}</div>
          <p>{company.opportunity}</p>
          <div className="review-signals"><span>★ {company.googleRating} ({company.reviewCount})</span><span>{company.hasWebsite ? "Website detected" : "No website"}</span><span>{company.mockupReady ? "Mockup ready" : "Mockup pending"}</span>{workflow?.notes && <span>Notes added</span>}</div>
          <div className="review-actions"><Link className="button secondary" href={`/companies/${company.id}`}><Eye size={15}/>Review</Link>{!company.mockupReady && <button className="button secondary" onClick={() => markMockupReady(company.id)}><LayoutTemplate size={15}/>Create mockup</button>}<button className="icon-action approve" title="Qualify lead" onClick={() => updateStatus(company.id, "Qualified")}><CheckCircle2 size={17}/></button><button className="icon-action reject" title="Reject lead" onClick={() => updateStatus(company.id, "Rejected")}><XCircle size={17}/></button></div>
        </article>;
      })}
      {!reviewCompanies.length && <div className="card empty-state review-empty">Review queue is empty. Change a company status to “Needs Review” to add it here.</div>}
    </div>
  </>;
}
