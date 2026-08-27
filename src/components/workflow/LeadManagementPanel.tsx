"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Check, MessageSquareText, Save, Target } from "lucide-react";
import { useCompanyStore } from "@/components/providers/CompanyStoreProvider";
import type { Company } from "@/types/company";
import type { LeadPriority } from "@/types/workflow";

const priorities: LeadPriority[] = ["Low", "Normal", "High", "Urgent"];

export function LeadManagementPanel({ company }: { company: Company }) {
  const { getWorkflow, updatePriority, updateLeadScore, saveNotes } = useCompanyStore();
  const workflow = getWorkflow(company.id);
  const [notes, setNotes] = useState(workflow?.notes ?? "");
  const [scoreInput, setScoreInput] = useState(String(workflow?.leadScore ?? 0));
  const [notesDirty, setNotesDirty] = useState(false);

  useEffect(() => {
    if (!workflow) return;
    if (!notesDirty) setNotes(workflow.notes);
    setScoreInput(String(workflow.leadScore));
  }, [workflow, notesDirty]);

  if (!workflow) return null;

  const saveScore = () => {
    const value = Number(scoreInput);
    if (!Number.isFinite(value)) return setScoreInput(String(workflow.leadScore));
    updateLeadScore(company.id, value);
  };

  const handleSaveNotes = () => {
    saveNotes(company.id, notes);
    setNotesDirty(false);
  };

  return <>
    <section className="card panel">
      <div className="panel-header"><div><h2>Lead management</h2><div className="panel-note">Supabase-backed CRM state · LocalStorage fallback</div></div></div>
      <div className="lead-management-grid">
        <div className="lead-score-card">
          <div className="lead-score-ring" style={{"--lead-score": `${workflow.leadScore * 3.6}deg`} as CSSProperties}>
            <div><strong>{workflow.leadScore}</strong><span>/100</span></div>
          </div>
          <div><span className="mini-label">Lead score</span><h3>{workflow.leadScore >= 80 ? "Strong sales fit" : workflow.leadScore >= 60 ? "Worth reviewing" : "Lower priority"}</h3><p>Combines potential, website weakness and trust signals in this MVP.</p></div>
        </div>
        <div className="crm-fields">
          <label><span>Priority</span><select className="control" value={workflow.priority} onChange={(event) => updatePriority(company.id, event.target.value as LeadPriority)}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
          <label><span>Manual lead score</span><div className="score-input-row"><input className="control" type="number" min="0" max="100" value={scoreInput} onChange={(event) => setScoreInput(event.target.value)} onBlur={saveScore}/><button className="button secondary" onClick={saveScore}><Target size={15}/>Apply</button></div></label>
        </div>
      </div>
    </section>

    <section className="card panel">
      <div className="panel-header"><div><h2>Internal notes</h2><div className="panel-note">Human-only context for qualification and follow-up</div></div>{notesDirty ? <span className="unsaved-indicator">Unsaved changes</span> : workflow.notes ? <span className="saved-indicator"><Check size={13}/>Saved</span> : null}</div>
      <textarea className="notes-area" value={notes} onChange={(event) => { setNotes(event.target.value); setNotesDirty(true); }} placeholder="Add context from your research or human review…"/>
      <div className="notes-actions"><span>{notes.length} characters</span><button className="button secondary" disabled={!notesDirty} onClick={handleSaveNotes}><Save size={15}/>Save notes</button></div>
    </section>

    <section className="card panel outreach-mini-card">
      <div><div className="mini-label">Human-reviewed outreach</div><h2>{workflow.outreach.approved ? "Draft approved" : "Draft still needs approval"}</h2><p>{workflow.outreach.subject}</p></div>
      <Link className="button secondary" href={`/outreach?company=${company.id}`}><MessageSquareText size={16}/>Open draft</Link>
    </section>
  </>;
}
