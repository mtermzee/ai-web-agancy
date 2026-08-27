"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, Mail, Save, ShieldCheck, Sparkles } from "lucide-react";
import { useCompanyStore } from "@/components/providers/CompanyStoreProvider";
import { PotentialBadge, StatusBadge } from "@/components/ui/Badge";

export function OutreachWorkspace({ initialCompanyId }: { initialCompanyId?: string }) {
  const { companies, getWorkflow, saveOutreachDraft, setOutreachApproved } = useCompanyStore();
  const eligibleCompanies = useMemo(() => [...companies].filter((company) => company.status !== "Rejected").sort((a, b) => {
    const aScore = getWorkflow(a.id)?.leadScore ?? 0;
    const bScore = getWorkflow(b.id)?.leadScore ?? 0;
    return bScore - aScore;
  }), [companies, getWorkflow]);
  const initial = eligibleCompanies.some((company) => company.id === initialCompanyId) ? initialCompanyId! : eligibleCompanies[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState(initial);
  const company = companies.find((item) => item.id === selectedId);
  const workflow = company ? getWorkflow(company.id) : undefined;
  const [subject, setSubject] = useState(workflow?.outreach.subject ?? "");
  const [message, setMessage] = useState(workflow?.outreach.message ?? "");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!workflow || dirty) return;
    setSubject(workflow.outreach.subject);
    setMessage(workflow.outreach.message);
  }, [workflow, dirty]);

  const changeCompany = (id: string) => {
    setSelectedId(id);
    const next = getWorkflow(id);
    setSubject(next?.outreach.subject ?? "");
    setMessage(next?.outreach.message ?? "");
    setDirty(false);
  };

  if (!company || !workflow) return <div className="card empty-state">No eligible leads available.</div>;

  const save = () => {
    saveOutreachDraft(company.id, { subject, message });
    setDirty(false);
  };

  return <div className="outreach-layout">
    <aside className="card outreach-sidebar">
      <div className="outreach-sidebar-title"><strong>Lead drafts</strong><span>{eligibleCompanies.length} companies</span></div>
      <div className="outreach-lead-list">
        {eligibleCompanies.map((item) => {
          const itemWorkflow = getWorkflow(item.id);
          return <button key={item.id} className={`outreach-lead ${item.id === company.id ? "active" : ""}`} onClick={() => changeCompany(item.id)}>
            <div className="company-logo">{item.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div>
            <div><strong>{item.name}</strong><span>{item.industry} · Score {itemWorkflow?.leadScore ?? "–"}</span></div>
            {itemWorkflow?.outreach.approved && <CheckCircle2 size={15}/>} 
          </button>;
        })}
      </div>
    </aside>

    <section className="card outreach-editor">
      <div className="outreach-editor-header">
        <div><div className="eyebrow">Draft workspace</div><h2>{company.name}</h2><div className="badge-row"><StatusBadge status={company.status}/><PotentialBadge potential={company.potential}/><span className={`badge ${workflow.outreach.approved ? "green" : "yellow"}`}>{workflow.outreach.approved ? "Approved" : "Needs approval"}</span></div></div>
        <Link className="button secondary" href={`/companies/${company.id}`}><Eye size={15}/>Company</Link>
      </div>

      <div className="outreach-safety"><ShieldCheck size={18}/><div><strong>Human approval required</strong><span>This MVP only prepares drafts. It does not send email and does not contact anyone automatically.</span></div></div>

      <label className="editor-field"><span>Subject</span><input className="control" value={subject} onChange={(event) => { setSubject(event.target.value); setDirty(true); }}/></label>
      <label className="editor-field"><span>Message</span><textarea className="outreach-message" value={message} onChange={(event) => { setMessage(event.target.value); setDirty(true); }}/></label>

      <div className="outreach-editor-footer">
        <div className="draft-meta"><Sparkles size={14}/><span>Gemini-style personalization is simulated from the dummy analysis.</span></div>
        <div className="header-actions"><button className="button secondary" disabled={!dirty} onClick={save}><Save size={15}/>Save draft</button><button className={`button ${workflow.outreach.approved ? "secondary" : "success-button"}`} disabled={dirty} onClick={() => setOutreachApproved(company.id, !workflow.outreach.approved)}>{workflow.outreach.approved ? "Remove approval" : "Approve draft"}</button></div>
      </div>
    </section>

    <aside className="card outreach-context">
      <div className="context-icon"><Mail size={19}/></div><h2>Why this angle?</h2><p>{company.salesAngle}</p>
      <div className="context-divider"/>
      <span className="mini-label">Key opportunity</span><p>{company.opportunity}</p>
      <div className="context-divider"/>
      <span className="mini-label">Lead readiness</span><div className="readiness-row"><strong>{workflow.leadScore}/100</strong><span>{workflow.priority} priority</span></div>
    </aside>
  </div>;
}
