"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { companies as seedCompanies } from "@/data/companies";
import { createDefaultWorkflow, priorityFromScore } from "@/lib/workflow";
import type { Company, LeadStatus } from "@/types/company";
import type { CompanyWorkflowState, LeadPriority, OutreachDraft } from "@/types/workflow";

type WorkflowOverrides = Record<string, Partial<CompanyWorkflowState>>;
type LegacyOverride = Partial<Pick<Company, "status" | "mockupReady">>;
type LegacyOverrides = Record<string, LegacyOverride>;

type CompanyStore = {
  companies: Company[];
  hydrated: boolean;
  getCompany: (id: string) => Company | undefined;
  getWorkflow: (id: string) => CompanyWorkflowState | undefined;
  updateStatus: (id: string, status: LeadStatus) => void;
  updatePriority: (id: string, priority: LeadPriority) => void;
  updateLeadScore: (id: string, score: number) => void;
  saveNotes: (id: string, notes: string) => void;
  saveOutreachDraft: (id: string, draft: Pick<OutreachDraft, "subject" | "message">) => void;
  setOutreachApproved: (id: string, approved: boolean) => void;
  sendToReview: (id: string) => void;
  markMockupReady: (id: string) => void;
  resetDemoData: () => void;
};

const STORAGE_KEY = "agencyos-workflows-v2";
const LEGACY_STORAGE_KEY = "agencyos-company-overrides-v1";
const CompanyStoreContext = createContext<CompanyStore | null>(null);

function activityId(type: string) {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function CompanyStoreProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<WorkflowOverrides>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setOverrides(JSON.parse(saved));
      } else {
        const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacy) setOverrides(JSON.parse(legacy) as LegacyOverrides);
      }
    } catch {
      // Invalid local demo state should never break the product shell.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }, [hydrated, overrides]);

  const workflows = useMemo(() => {
    const result: Record<string, CompanyWorkflowState> = {};
    for (const company of seedCompanies) {
      const base = createDefaultWorkflow(company);
      const saved = overrides[company.id] ?? {};
      result[company.id] = {
        ...base,
        ...saved,
        outreach: { ...base.outreach, ...(saved.outreach ?? {}) },
        activities: saved.activities ?? base.activities,
      };
    }
    return result;
  }, [overrides]);

  const companies = useMemo(
    () => seedCompanies.map((company) => ({
      ...company,
      status: workflows[company.id]?.status ?? company.status,
      mockupReady: workflows[company.id]?.mockupReady ?? company.mockupReady,
    })),
    [workflows],
  );

  const getCompany = useCallback((id: string) => companies.find((company) => company.id === id), [companies]);
  const getWorkflow = useCallback((id: string) => workflows[id], [workflows]);

  const updateState = useCallback((id: string, recipe: (current: CompanyWorkflowState) => CompanyWorkflowState) => {
    const company = seedCompanies.find((item) => item.id === id);
    if (!company) return;
    setOverrides((currentOverrides) => {
      const base = createDefaultWorkflow(company);
      const saved = currentOverrides[id] ?? {};
      const current: CompanyWorkflowState = {
        ...base,
        ...saved,
        outreach: { ...base.outreach, ...(saved.outreach ?? {}) },
        activities: saved.activities ?? base.activities,
      };
      return { ...currentOverrides, [id]: recipe(current) };
    });
  }, []);

  const updateStatus = useCallback((id: string, status: LeadStatus) => {
    updateState(id, (current) => {
      if (current.status === status) return current;
      return {
        ...current,
        status,
        activities: [{
          id: activityId("status"), type: "status", title: "Lead status changed",
          detail: `${current.status} → ${status}`, createdAt: new Date().toISOString(),
        }, ...current.activities],
      };
    });
  }, [updateState]);

  const updatePriority = useCallback((id: string, priority: LeadPriority) => {
    updateState(id, (current) => current.priority === priority ? current : ({
      ...current,
      priority,
      activities: [{ id: activityId("priority"), type: "priority", title: "Priority updated", detail: `${current.priority} → ${priority}`, createdAt: new Date().toISOString() }, ...current.activities],
    }));
  }, [updateState]);

  const updateLeadScore = useCallback((id: string, rawScore: number) => {
    const score = Math.max(0, Math.min(100, Math.round(rawScore)));
    updateState(id, (current) => current.leadScore === score ? current : ({
      ...current,
      leadScore: score,
      priority: priorityFromScore(score),
      activities: [{ id: activityId("score"), type: "score", title: "Lead score adjusted", detail: `${current.leadScore} → ${score}`, createdAt: new Date().toISOString() }, ...current.activities],
    }));
  }, [updateState]);

  const saveNotes = useCallback((id: string, notes: string) => {
    updateState(id, (current) => current.notes === notes ? current : ({
      ...current,
      notes,
      activities: [{ id: activityId("note"), type: "note", title: "Lead notes saved", detail: notes.trim() ? "Notes were updated for human review." : "Notes were cleared.", createdAt: new Date().toISOString() }, ...current.activities],
    }));
  }, [updateState]);

  const saveOutreachDraft = useCallback((id: string, draft: Pick<OutreachDraft, "subject" | "message">) => {
    updateState(id, (current) => ({
      ...current,
      outreach: { ...current.outreach, ...draft, approved: false, updatedAt: new Date().toISOString() },
      activities: [{ id: activityId("outreach"), type: "outreach", title: "Outreach draft saved", detail: "Draft requires human approval before any future sending step.", createdAt: new Date().toISOString() }, ...current.activities],
    }));
  }, [updateState]);

  const setOutreachApproved = useCallback((id: string, approved: boolean) => {
    updateState(id, (current) => current.outreach.approved === approved ? current : ({
      ...current,
      outreach: { ...current.outreach, approved, updatedAt: new Date().toISOString() },
      activities: [{ id: activityId("outreach-approval"), type: "outreach", title: approved ? "Outreach draft approved" : "Outreach approval removed", detail: approved ? "Ready for a future manual sending step." : "Draft returned to review.", createdAt: new Date().toISOString() }, ...current.activities],
    }));
  }, [updateState]);

  const sendToReview = useCallback((id: string) => updateStatus(id, "Needs Review"), [updateStatus]);

  const markMockupReady = useCallback((id: string) => {
    updateState(id, (current) => {
      if (current.mockupReady) return current;
      const keepStatus = ["Contacted", "Qualified", "Rejected"].includes(current.status);
      return {
        ...current,
        mockupReady: true,
        status: keepStatus ? current.status : "Mockup Ready",
        activities: [{ id: activityId("mockup"), type: "mockup", title: "Mockup generated", detail: "Demo website concept is ready for human review.", createdAt: new Date().toISOString() }, ...current.activities],
      };
    });
  }, [updateState]);

  const resetDemoData = useCallback(() => setOverrides({}), []);

  const value = useMemo(() => ({
    companies, hydrated, getCompany, getWorkflow, updateStatus, updatePriority, updateLeadScore,
    saveNotes, saveOutreachDraft, setOutreachApproved, sendToReview, markMockupReady, resetDemoData,
  }), [companies, hydrated, getCompany, getWorkflow, updateStatus, updatePriority, updateLeadScore, saveNotes, saveOutreachDraft, setOutreachApproved, sendToReview, markMockupReady, resetDemoData]);

  return <CompanyStoreContext.Provider value={value}>{children}</CompanyStoreContext.Provider>;
}

export function useCompanyStore() {
  const context = useContext(CompanyStoreContext);
  if (!context) throw new Error("useCompanyStore must be used inside CompanyStoreProvider");
  return context;
}
