"use client";

import Link from "next/link";
import { Activity, Building2, CheckCircle2, Gauge, Globe2, LayoutTemplate, Target, TriangleAlert } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PotentialBadge } from "@/components/ui/Badge";
import { useCompanyStore } from "@/components/providers/CompanyStoreProvider";

export function DashboardClient() {
  const { companies, getWorkflow } = useCompanyStore();
  const total = companies.length;
  const noWebsite = companies.filter((company) => !company.hasWebsite).length;
  const poorWebsite = companies.filter((company) => company.hasWebsite && company.scores.overall < 50).length;
  const avgWebsiteScore = total > 0 ? Math.round(companies.reduce((sum, company) => sum + company.scores.overall, 0) / total) : 0;
  const avgLeadScore = total > 0 ? Math.round(companies.reduce((sum, company) => sum + (getWorkflow(company.id)?.leadScore ?? 0), 0) / total) : 0;
  const mockups = companies.filter((company) => company.mockupReady).length;
  const reviewCount = companies.filter((company) => ["Needs Review", "High Potential", "Mockup Ready"].includes(company.status)).length;
  const approvedDrafts = companies.filter((company) => getWorkflow(company.id)?.outreach.approved).length;
  const topLeads = [...companies]
    .filter((company) => company.status !== "Rejected")
    .sort((a, b) => (getWorkflow(b.id)?.leadScore ?? 0) - (getWorkflow(a.id)?.leadScore ?? 0))
    .slice(0, 5);
  const pipeline = [
    ["Discovered", total],
    ["Needs review", companies.filter((company) => company.status === "Needs Review").length],
    ["Mockup ready", mockups],
    ["Qualified", companies.filter((company) => company.status === "Qualified").length],
    ["Outreach approved", approvedDrafts],
  ] as const;
  const max = Math.max(...pipeline.map(([, value]) => value), 1);

  return <div className="page">
    <div className="page-header"><div><div className="eyebrow">AI lead intelligence</div><h1>Dashboard</h1><p className="page-subtitle">Real-time pipeline overview, lead rankings and automated website audits.</p></div><Link href="/companies" className="button primary"><Building2 size={17}/>Browse companies</Link></div>
    <section className="kpi-grid">
      <KpiCard label="Companies in CRM" value={total} change="active pipeline" icon={Building2}/>
      <KpiCard label="No website" value={noWebsite} change="high opportunity" icon={Globe2}/>
      <KpiCard label="Poor websites" value={poorWebsite} change="website score < 50" icon={TriangleAlert}/>
      <KpiCard label="Avg. website score" value={total > 0 ? `${avgWebsiteScore}/100` : "–"} change="portfolio average" icon={Activity}/>
      <KpiCard label="Avg. lead score" value={total > 0 ? `${avgLeadScore}/100` : "–"} change="commercial priority" icon={Gauge}/>
      <KpiCard label="Mockups ready" value={mockups} change="ready to present" icon={LayoutTemplate}/>
      <KpiCard label="Review queue" value={reviewCount} change="needs human action" icon={Target}/>
      <KpiCard label="Approved drafts" value={approvedDrafts} change="ready for outreach" icon={CheckCircle2}/>
    </section>
    <div className="dashboard-grid">
      <section className="card panel"><div className="panel-header"><div><h2>Top opportunities</h2><div className="panel-note">Ranked by commercial lead score</div></div><Link className="button secondary" href="/leads">Review leads</Link></div><div className="lead-list">
        {topLeads.map((company) => {
          const workflow = getWorkflow(company.id);
          return <Link className="lead-row" key={company.id} href={`/companies/${company.id}`}><div className="lead-name"><strong>{company.name}</strong><span>{company.industry} · {company.city}</span></div><PotentialBadge potential={company.potential}/><span className="lead-score-chip">{workflow?.leadScore ?? "–"}</span></Link>;
        })}
        {!topLeads.length && <div className="empty-state" style={{ padding: "24px 12px" }}>No leads in CRM yet. Use "Leads finden & anlegen" to import businesses.</div>}
      </div></section>
      <section className="card panel"><div className="panel-header"><div><h2>Pipeline snapshot</h2><div className="panel-note">Updates from status, mockup and outreach actions</div></div></div><div className="pipeline">{pipeline.map(([label,value]) => <div className="pipeline-row" key={label}><span>{label}</span><div className="bar-track"><div className="bar-fill" style={{width:`${Math.max(8,(value/max)*100)}%`}}/></div><strong>{value}</strong></div>)}</div></section>
    </div>
  </div>;
}
