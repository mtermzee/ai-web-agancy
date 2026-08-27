"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, RotateCcw, Search } from "lucide-react";
import type { LeadStatus } from "@/types/company";
import { PotentialBadge } from "@/components/ui/Badge";
import { ScoreChip } from "@/components/ui/ScoreChip";
import { StatusSelect } from "@/components/companies/StatusSelect";
import { useCompanyStore } from "@/components/providers/CompanyStoreProvider";

export function CompaniesTable() {
  const { companies, getWorkflow, updateStatus } = useCompanyStore();
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("all");
  const [country, setCountry] = useState("all");
  const [website, setWebsite] = useState("all");
  const [potential, setPotential] = useState("all");
  const [status, setStatus] = useState("all");
  const [score, setScore] = useState("all");
  const [priority, setPriority] = useState("all");

  const industries = Array.from(new Set(companies.map((company) => company.industry))).sort();
  const countries = Array.from(new Set(companies.map((company) => company.country))).sort();

  const filtered = useMemo(() => companies.filter((company) => {
    const workflow = getWorkflow(company.id);
    const haystack = `${company.name} ${company.industry} ${company.city} ${company.country}`.toLowerCase();
    const matchesScore = score === "all"
      || (score === "0-39" && company.scores.overall < 40)
      || (score === "40-59" && company.scores.overall >= 40 && company.scores.overall < 60)
      || (score === "60-79" && company.scores.overall >= 60 && company.scores.overall < 80)
      || (score === "80-100" && company.scores.overall >= 80);

    return haystack.includes(query.toLowerCase())
      && (industry === "all" || company.industry === industry)
      && (country === "all" || company.country === country)
      && (website === "all" || String(company.hasWebsite) === website)
      && (potential === "all" || company.potential === potential)
      && (status === "all" || company.status === status)
      && (priority === "all" || workflow?.priority === priority)
      && matchesScore;
  }), [companies, getWorkflow, query, industry, country, website, potential, status, score, priority]);

  const resetFilters = () => {
    setQuery(""); setIndustry("all"); setCountry("all"); setWebsite("all"); setPotential("all"); setStatus("all"); setScore("all"); setPriority("all");
  };

  return <div className="card table-card">
    <div className="table-toolbar expanded crm-toolbar">
      <div className="field-wrap"><Search size={17}/><input className="control search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search companies..."/></div>
      <select className="control" value={industry} onChange={(event) => setIndustry(event.target.value)}><option value="all">All industries</option>{industries.map((value) => <option key={value}>{value}</option>)}</select>
      <select className="control" value={country} onChange={(event) => setCountry(event.target.value)}><option value="all">All countries</option>{countries.map((value) => <option key={value}>{value}</option>)}</select>
      <select className="control" value={website} onChange={(event) => setWebsite(event.target.value)}><option value="all">Website: all</option><option value="true">Website: yes</option><option value="false">Website: no</option></select>
      <select className="control" value={potential} onChange={(event) => setPotential(event.target.value)}><option value="all">All potential</option><option>Very High</option><option>High</option><option>Medium</option><option>Low</option></select>
      <select className="control" value={priority} onChange={(event) => setPriority(event.target.value)}><option value="all">All priorities</option><option>Urgent</option><option>High</option><option>Normal</option><option>Low</option></select>
      <select className="control" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option>New</option><option>Needs Review</option><option>High Potential</option><option>Mockup Ready</option><option>Contacted</option><option>Qualified</option><option>Rejected</option></select>
      <select className="control" value={score} onChange={(event) => setScore(event.target.value)}><option value="all">All website scores</option><option value="0-39">Score 0–39</option><option value="40-59">Score 40–59</option><option value="60-79">Score 60–79</option><option value="80-100">Score 80–100</option></select>
      <button className="button secondary filter-reset" onClick={resetFilters}><RotateCcw size={15}/>Reset</button>
    </div>
    <div className="table-meta"><strong>{filtered.length}</strong> of {companies.length} companies shown <span>· CRM changes persist in LocalStorage</span></div>
    <div className="table-wrap"><table><thead><tr><th>Company</th><th>Location</th><th>Website</th><th>Web score</th><th>Lead score</th><th>Status</th><th>Potential</th><th>Priority</th><th></th></tr></thead><tbody>
      {filtered.map((company) => {
        const workflow = getWorkflow(company.id);
        return <tr key={company.id}><td><Link href={`/companies/${company.id}`} className="company-cell"><div className="company-logo">{company.name.split(" ").map((part) => part[0]).slice(0,2).join("")}</div><div><strong>{company.name}</strong><span>{company.industry}</span></div></Link></td><td>{company.city}<br/><span style={{color:"#98a2b3"}}>{company.country}</span></td><td><span className={`badge ${company.hasWebsite ? "green" : "red"}`}><span className="website-dot"/>{company.hasWebsite ? "Yes" : "No"}</span></td><td><ScoreChip score={company.scores.overall}/></td><td><span className="lead-score-chip compact">{workflow?.leadScore ?? "–"}</span></td><td><StatusSelect compact value={company.status} onChange={(nextStatus: LeadStatus) => updateStatus(company.id, nextStatus)}/></td><td><PotentialBadge potential={company.potential}/></td><td>{workflow ? <span className={`priority-pill priority-${workflow.priority.toLowerCase()}`}>{workflow.priority}</span> : "–"}</td><td><Link href={`/companies/${company.id}`} aria-label={`Open ${company.name}`}><ExternalLink size={16} color="#667085"/></Link></td></tr>;
      })}
    </tbody></table></div>
    {!filtered.length && <div className="empty-state">No companies match the current filters.</div>}
  </div>;
}
