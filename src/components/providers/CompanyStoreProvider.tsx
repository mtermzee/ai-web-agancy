"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { companies as seedCompanies } from "@/data/companies";
import {
  deleteAllCompanies,
  deleteCompany as deleteCompanyRemote,
  deleteDemoCompanies,
  isSupabaseConfigured,
  loadAgencyState,
  resetSupabaseDemoData,
  saveWorkflowState,
  seedSupabaseDemoData,
} from "@/lib/repositories/agencyRepository";
import { createDefaultWorkflow, priorityFromScore } from "@/lib/workflow";
import type { Company, LeadStatus } from "@/types/company";
import type { CompanyWorkflowState, LeadPriority, OutreachDraft } from "@/types/workflow";

type WorkflowOverrides = Record<string, Partial<CompanyWorkflowState>>;
type LegacyOverride = Partial<Pick<Company, "status" | "mockupReady">>;
type LegacyOverrides = Record<string, LegacyOverride>;
type DataSource = "supabase" | "local";

type CompanyStore = {
  companies: Company[];
  hydrated: boolean;
  dataSource: DataSource;
  syncing: boolean;
  syncError: string | null;
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
  deleteCompany: (id: string) => Promise<void>;
  deleteDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  loadDemoData: () => Promise<void>;
  syncFromSupabase: () => Promise<void>;
  resetDemoData: () => void;
};

const STORAGE_KEY = "agencyos-workflows-v2";
const LEGACY_STORAGE_KEY = "agencyos-company-overrides-v1";
const CompanyStoreContext = createContext<CompanyStore | null>(null);

function activityId(type: string) {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function CompanyStoreProvider({ children }: { children: React.ReactNode }) {
  const [baseCompanies, setBaseCompanies] = useState<Company[]>(seedCompanies);
  const [overrides, setOverrides] = useState<WorkflowOverrides>({});
  const [hydrated, setHydrated] = useState(false);
  const [dataSource, setDataSource] = useState<DataSource>("local");
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const syncFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setDataSource("local");
      setSyncError("Supabase environment variables are not configured.");
      return;
    }

    setSyncing(true);
    setSyncError(null);
    try {
      const state = await loadAgencyState();
      setBaseCompanies(state.companies);
      setOverrides(state.workflows);
      setDataSource("supabase");
    } catch (error) {
      setDataSource("local");
      setSyncError(error instanceof Error ? error.message : "Supabase sync failed.");
    } finally {
      setSyncing(false);
    }
  }, []);

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

    void syncFromSupabase();
  }, [syncFromSupabase]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }, [hydrated, overrides]);

  const workflows = useMemo(() => {
    const result: Record<string, CompanyWorkflowState> = {};
    for (const company of baseCompanies) {
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
  }, [baseCompanies, overrides]);

  const companies = useMemo(
    () =>
      baseCompanies.map((company) => ({
        ...company,
        status: workflows[company.id]?.status ?? company.status,
        mockupReady: workflows[company.id]?.mockupReady ?? company.mockupReady,
      })),
    [baseCompanies, workflows],
  );

  const getCompany = useCallback(
    (id: string) => companies.find((company) => company.id === id),
    [companies],
  );
  const getWorkflow = useCallback((id: string) => workflows[id], [workflows]);

  const persistWorkflow = useCallback(
    (company: Company, next: CompanyWorkflowState) => {
      if (dataSource !== "supabase") return;
      setSyncing(true);
      void saveWorkflowState(company, next)
        .then(() => setSyncError(null))
        .catch((error) => {
          setSyncError(error instanceof Error ? error.message : "Supabase write failed.");
        })
        .finally(() => setSyncing(false));
    },
    [dataSource],
  );

  const updateState = useCallback(
    (id: string, recipe: (current: CompanyWorkflowState) => CompanyWorkflowState) => {
      const company = companies.find((item) => item.id === id);
      const current = workflows[id];
      if (!company || !current) return;

      const next = recipe(current);
      if (next === current) return;
      setOverrides((currentOverrides) => ({ ...currentOverrides, [id]: next }));
      persistWorkflow(company, next);
    },
    [companies, workflows, persistWorkflow],
  );

  const updateStatus = useCallback(
    (id: string, status: LeadStatus) => {
      updateState(id, (current) => {
        if (current.status === status) return current;
        return {
          ...current,
          status,
          activities: [
            {
              id: activityId("status"),
              type: "status",
              title: "Lead status changed",
              detail: `${current.status} → ${status}`,
              createdAt: new Date().toISOString(),
            },
            ...current.activities,
          ],
        };
      });
    },
    [updateState],
  );

  const updatePriority = useCallback(
    (id: string, priority: LeadPriority) => {
      updateState(id, (current) =>
        current.priority === priority
          ? current
          : {
              ...current,
              priority,
              activities: [
                {
                  id: activityId("priority"),
                  type: "priority",
                  title: "Priority updated",
                  detail: `${current.priority} → ${priority}`,
                  createdAt: new Date().toISOString(),
                },
                ...current.activities,
              ],
            },
      );
    },
    [updateState],
  );

  const updateLeadScore = useCallback(
    (id: string, rawScore: number) => {
      const score = Math.max(0, Math.min(100, Math.round(rawScore)));
      updateState(id, (current) =>
        current.leadScore === score
          ? current
          : {
              ...current,
              leadScore: score,
              priority: priorityFromScore(score),
              activities: [
                {
                  id: activityId("score"),
                  type: "score",
                  title: "Lead score adjusted",
                  detail: `${current.leadScore} → ${score}`,
                  createdAt: new Date().toISOString(),
                },
                ...current.activities,
              ],
            },
      );
    },
    [updateState],
  );

  const saveNotes = useCallback(
    (id: string, notes: string) => {
      updateState(id, (current) =>
        current.notes === notes
          ? current
          : {
              ...current,
              notes,
              activities: [
                {
                  id: activityId("note"),
                  type: "note",
                  title: "Lead notes saved",
                  detail: notes.trim()
                    ? "Notes were updated for human review."
                    : "Notes were cleared.",
                  createdAt: new Date().toISOString(),
                },
                ...current.activities,
              ],
            },
      );
    },
    [updateState],
  );

  const saveOutreachDraft = useCallback(
    (id: string, draft: Pick<OutreachDraft, "subject" | "message">) => {
      updateState(id, (current) => ({
        ...current,
        outreach: {
          ...current.outreach,
          ...draft,
          approved: false,
          updatedAt: new Date().toISOString(),
        },
        activities: [
          {
            id: activityId("outreach"),
            type: "outreach",
            title: "Outreach draft saved",
            detail: "Draft requires human approval before any future sending step.",
            createdAt: new Date().toISOString(),
          },
          ...current.activities,
        ],
      }));
    },
    [updateState],
  );

  const setOutreachApproved = useCallback(
    (id: string, approved: boolean) => {
      updateState(id, (current) =>
        current.outreach.approved === approved
          ? current
          : {
              ...current,
              outreach: {
                ...current.outreach,
                approved,
                updatedAt: new Date().toISOString(),
              },
              activities: [
                {
                  id: activityId("outreach-approval"),
                  type: "outreach",
                  title: approved ? "Outreach draft approved" : "Outreach approval removed",
                  detail: approved
                    ? "Ready for a future manual sending step."
                    : "Draft returned to review.",
                  createdAt: new Date().toISOString(),
                },
                ...current.activities,
              ],
            },
      );
    },
    [updateState],
  );

  const sendToReview = useCallback(
    (id: string) => updateStatus(id, "Needs Review"),
    [updateStatus],
  );

  const markMockupReady = useCallback(
    (id: string) => {
      updateState(id, (current) => {
        if (current.mockupReady) return current;
        const keepStatus = ["Contacted", "Qualified", "Rejected"].includes(current.status);
        return {
          ...current,
          mockupReady: true,
          status: keepStatus ? current.status : "Mockup Ready",
          activities: [
            {
              id: activityId("mockup"),
              type: "mockup",
              title: "Mockup generated",
              detail: "Demo website concept is ready for human review.",
              createdAt: new Date().toISOString(),
            },
            ...current.activities,
          ],
        };
      });
    },
    [updateState],
  );

  const deleteCompany = useCallback(
    async (id: string) => {
      setBaseCompanies((prev) => prev.filter((c) => c.id !== id));
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      if (dataSource === "supabase") {
        try {
          await deleteCompanyRemote(id);
        } catch (error) {
          setSyncError(error instanceof Error ? error.message : "Delete failed.");
        }
      }
    },
    [dataSource],
  );

  const deleteDemoData = useCallback(async () => {
    const demoIds = seedCompanies.map((c) => c.id);
    const demoSet = new Set(demoIds);

    setBaseCompanies((prev) => prev.filter((c) => !demoSet.has(c.id)));
    setOverrides((prev) => {
      const next = { ...prev };
      for (const id of demoIds) delete next[id];
      return next;
    });

    if (dataSource === "supabase") {
      setSyncing(true);
      try {
        await deleteDemoCompanies(demoIds);
        await syncFromSupabase();
      } catch (error) {
        setSyncError(error instanceof Error ? error.message : "Delete demo data failed.");
      } finally {
        setSyncing(false);
      }
    }
  }, [dataSource, syncFromSupabase]);

  const clearAllData = useCallback(async () => {
    setBaseCompanies([]);
    setOverrides({});
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);

    if (dataSource === "supabase") {
      setSyncing(true);
      try {
        await deleteAllCompanies();
        await syncFromSupabase();
      } catch (error) {
        setSyncError(error instanceof Error ? error.message : "Clear all failed.");
      } finally {
        setSyncing(false);
      }
    }
  }, [dataSource, syncFromSupabase]);

  const loadDemoData = useCallback(async () => {
    setBaseCompanies(seedCompanies);
    setOverrides({});
    setSyncError(null);

    if (dataSource === "supabase") {
      setSyncing(true);
      try {
        await seedSupabaseDemoData(seedCompanies);
        await syncFromSupabase();
      } catch (error) {
        setSyncError(error instanceof Error ? error.message : "Load demo data failed.");
      } finally {
        setSyncing(false);
      }
    }
  }, [dataSource, syncFromSupabase]);

  const resetDemoData = useCallback(() => {
    void loadDemoData();
  }, [loadDemoData]);

  const value = useMemo(
    () => ({
      companies,
      hydrated,
      dataSource,
      syncing,
      syncError,
      getCompany,
      getWorkflow,
      updateStatus,
      updatePriority,
      updateLeadScore,
      saveNotes,
      saveOutreachDraft,
      setOutreachApproved,
      sendToReview,
      markMockupReady,
      deleteCompany,
      deleteDemoData,
      clearAllData,
      loadDemoData,
      syncFromSupabase,
      resetDemoData,
    }),
    [
      companies,
      hydrated,
      dataSource,
      syncing,
      syncError,
      getCompany,
      getWorkflow,
      updateStatus,
      updatePriority,
      updateLeadScore,
      saveNotes,
      saveOutreachDraft,
      setOutreachApproved,
      sendToReview,
      markMockupReady,
      deleteCompany,
      deleteDemoData,
      clearAllData,
      loadDemoData,
      syncFromSupabase,
      resetDemoData,
    ],
  );

  return <CompanyStoreContext.Provider value={value}>{children}</CompanyStoreContext.Provider>;
}

export function useCompanyStore() {
  const context = useContext(CompanyStoreContext);
  if (!context) throw new Error("useCompanyStore must be used inside CompanyStoreProvider");
  return context;
}
