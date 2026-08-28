import { createClient } from "@/lib/supabase/client";
import { createDefaultWorkflow } from "@/lib/workflow";
import type { Company, LeadStatus, Potential } from "@/types/company";
import type { ActivityType, CompanyWorkflowState, LeadPriority } from "@/types/workflow";

export type AgencyState = {
  companies: Company[];
  workflows: Record<string, CompanyWorkflowState>;
};

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

function throwIfError(error: { message: string } | null, label: string) {
  if (error) throw new Error(`${label}: ${error.message}`);
}

function toCompany(
  row: Record<string, unknown>,
  audit: Record<string, unknown> | undefined,
  lead: Record<string, unknown> | undefined,
  mockup: Record<string, unknown> | undefined,
): Company {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    industry: String(row.industry ?? ""),
    address: String(row.address ?? ""),
    city: String(row.city ?? ""),
    country: String(row.country ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    website: row.website ? String(row.website) : undefined,
    hasWebsite: Boolean(row.has_website),
    googleRating: Number(row.google_rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    status: String(lead?.status ?? "New") as LeadStatus,
    potential: String(lead?.potential ?? "Medium") as Potential,
    lastAnalyzedAt: String(audit?.last_analyzed_at ?? ""),
    scores: {
      overall: Number(audit?.overall_score ?? 0),
      design: Number(audit?.design_score ?? 0),
      mobile: Number(audit?.mobile_score ?? 0),
      seo: Number(audit?.seo_score ?? 0),
      performance: Number(audit?.performance_score ?? 0),
      conversion: Number(audit?.conversion_score ?? 0),
    },
    problems: Array.isArray(audit?.problems) ? (audit.problems as string[]) : [],
    strengths: Array.isArray(audit?.strengths) ? (audit.strengths as string[]) : [],
    aiSummary: String(audit?.ai_summary ?? ""),
    opportunity: String(audit?.opportunity ?? ""),
    recommendation: String(audit?.recommendation ?? ""),
    suggestedStructure: Array.isArray(audit?.suggested_structure)
      ? (audit.suggested_structure as string[])
      : [],
    salesAngle: String(audit?.sales_angle ?? ""),
    mockupReady: String(mockup?.status ?? "pending") === "ready",
  };
}

export async function loadAgencyState(): Promise<AgencyState> {
  const supabase = createClient();

  const [companiesResult, auditsResult, leadsResult, notesResult, activitiesResult, mockupsResult, outreachResult] =
    await Promise.all([
      supabase.from("companies").select("*").order("name"),
      supabase.from("website_audits").select("*"),
      supabase.from("leads").select("*"),
      supabase.from("lead_notes").select("*"),
      supabase.from("lead_activities").select("*").order("created_at", { ascending: false }),
      supabase.from("mockups").select("*"),
      supabase.from("outreach").select("*"),
    ]);

  throwIfError(companiesResult.error, "Load companies");
  throwIfError(auditsResult.error, "Load website audits");
  throwIfError(leadsResult.error, "Load leads");
  throwIfError(notesResult.error, "Load lead notes");
  throwIfError(activitiesResult.error, "Load activities");
  throwIfError(mockupsResult.error, "Load mockups");
  throwIfError(outreachResult.error, "Load outreach");

  const companyRows = (companiesResult.data ?? []) as Record<string, unknown>[];
  const auditRows = (auditsResult.data ?? []) as Record<string, unknown>[];
  const leadRows = (leadsResult.data ?? []) as Record<string, unknown>[];
  const noteRows = (notesResult.data ?? []) as Record<string, unknown>[];
  const activityRows = (activitiesResult.data ?? []) as Record<string, unknown>[];
  const mockupRows = (mockupsResult.data ?? []) as Record<string, unknown>[];
  const outreachRows = (outreachResult.data ?? []) as Record<string, unknown>[];

  const byCompany = <T extends Record<string, unknown>>(rows: T[]) =>
    new Map(rows.map((row) => [String(row.company_id), row]));

  const audits = byCompany(auditRows);
  const leads = byCompany(leadRows);
  const notes = byCompany(noteRows);
  const mockups = byCompany(mockupRows);
  const outreach = byCompany(outreachRows);

  const companies = companyRows.map((row) =>
    toCompany(row, audits.get(String(row.id)), leads.get(String(row.id)), mockups.get(String(row.id))),
  );

  const workflows: Record<string, CompanyWorkflowState> = {};
  for (const company of companies) {
    const base = createDefaultWorkflow(company);
    const lead = leads.get(company.id);
    const note = notes.get(company.id);
    const draft = outreach.get(company.id);
    const companyActivities = activityRows
      .filter((row) => String(row.company_id) === company.id)
      .map((row) => ({
        id: String(row.id),
        type: String(row.type) as ActivityType,
        title: String(row.title ?? ""),
        detail: row.detail ? String(row.detail) : undefined,
        createdAt: String(row.created_at),
      }));

    workflows[company.id] = {
      status: String(lead?.status ?? company.status) as LeadStatus,
      mockupReady: company.mockupReady,
      leadScore: Number(lead?.lead_score ?? base.leadScore),
      priority: String(lead?.priority ?? base.priority) as LeadPriority,
      notes: String(note?.notes ?? ""),
      outreach: {
        subject: String(draft?.subject ?? base.outreach.subject),
        message: String(draft?.message ?? base.outreach.message),
        approved: Boolean(draft?.approved ?? false),
        updatedAt: draft?.updated_at ? String(draft.updated_at) : undefined,
      },
      activities: companyActivities.length ? companyActivities : base.activities,
    };
  }

  return { companies, workflows };
}

function companyRows(companies: Company[]) {
  return companies.map((company) => ({
    id: company.id,
    name: company.name,
    industry: company.industry,
    address: company.address,
    city: company.city,
    country: company.country,
    phone: company.phone,
    email: company.email,
    website: company.website ?? null,
    has_website: company.hasWebsite,
    google_rating: company.googleRating,
    review_count: company.reviewCount,
  }));
}

function auditRows(companies: Company[]) {
  return companies.map((company) => ({
    company_id: company.id,
    overall_score: company.scores.overall,
    design_score: company.scores.design,
    mobile_score: company.scores.mobile,
    seo_score: company.scores.seo,
    performance_score: company.scores.performance,
    conversion_score: company.scores.conversion,
    problems: company.problems,
    strengths: company.strengths,
    ai_summary: company.aiSummary,
    opportunity: company.opportunity,
    recommendation: company.recommendation,
    suggested_structure: company.suggestedStructure,
    sales_angle: company.salesAngle,
    last_analyzed_at: company.lastAnalyzedAt,
  }));
}

function workflowRows(companies: Company[]) {
  return companies.map((company) => ({ company, workflow: createDefaultWorkflow(company) }));
}

export async function seedSupabaseDemoData(companies: Company[]) {
  const supabase = createClient();
  const defaults = workflowRows(companies);

  const companiesUpsert = await supabase.from("companies").upsert(companyRows(companies), { onConflict: "id" });
  throwIfError(companiesUpsert.error, "Seed companies");

  const auditsUpsert = await supabase.from("website_audits").upsert(auditRows(companies), { onConflict: "company_id" });
  throwIfError(auditsUpsert.error, "Seed website audits");

  const leadsUpsert = await supabase.from("leads").upsert(
    defaults.map(({ company, workflow }) => ({
      company_id: company.id,
      status: workflow.status,
      potential: company.potential,
      lead_score: workflow.leadScore,
      priority: workflow.priority,
    })),
    { onConflict: "company_id" },
  );
  throwIfError(leadsUpsert.error, "Seed leads");

  const notesUpsert = await supabase.from("lead_notes").upsert(
    defaults.map(({ company, workflow }) => ({ company_id: company.id, notes: workflow.notes })),
    { onConflict: "company_id" },
  );
  throwIfError(notesUpsert.error, "Seed notes");

  const mockupsUpsert = await supabase.from("mockups").upsert(
    defaults.map(({ company, workflow }) => ({
      company_id: company.id,
      status: workflow.mockupReady ? "ready" : "pending",
      mockup_url: workflow.mockupReady ? `/companies/${company.id}/mockup` : null,
    })),
    { onConflict: "company_id" },
  );
  throwIfError(mockupsUpsert.error, "Seed mockups");

  const outreachUpsert = await supabase.from("outreach").upsert(
    defaults.map(({ company, workflow }) => ({
      company_id: company.id,
      subject: workflow.outreach.subject,
      message: workflow.outreach.message,
      approved: workflow.outreach.approved,
      status: "draft",
    })),
    { onConflict: "company_id" },
  );
  throwIfError(outreachUpsert.error, "Seed outreach");

  const activityUpsert = await supabase.from("lead_activities").upsert(
    defaults.flatMap(({ company, workflow }) =>
      workflow.activities.map((activity) => ({
        id: activity.id,
        company_id: company.id,
        type: activity.type,
        title: activity.title,
        detail: activity.detail ?? null,
        // Some legacy dummy timestamps are human-readable labels, not ISO timestamps.
        created_at: Number.isNaN(new Date(activity.createdAt).getTime())
          ? new Date().toISOString()
          : new Date(activity.createdAt).toISOString(),
      })),
    ),
    { onConflict: "id" },
  );
  throwIfError(activityUpsert.error, "Seed activities");
}

export async function saveWorkflowState(company: Company, workflow: CompanyWorkflowState) {
  const supabase = createClient();

  const leadResult = await supabase.from("leads").upsert(
    {
      company_id: company.id,
      status: workflow.status,
      potential: company.potential,
      lead_score: workflow.leadScore,
      priority: workflow.priority,
    },
    { onConflict: "company_id" },
  );
  throwIfError(leadResult.error, "Save lead");

  const notesResult = await supabase.from("lead_notes").upsert(
    { company_id: company.id, notes: workflow.notes },
    { onConflict: "company_id" },
  );
  throwIfError(notesResult.error, "Save notes");

  const mockupResult = await supabase.from("mockups").upsert(
    {
      company_id: company.id,
      status: workflow.mockupReady ? "ready" : "pending",
      mockup_url: workflow.mockupReady ? `/companies/${company.id}/mockup` : null,
    },
    { onConflict: "company_id" },
  );
  throwIfError(mockupResult.error, "Save mockup");

  const outreachResult = await supabase.from("outreach").upsert(
    {
      company_id: company.id,
      subject: workflow.outreach.subject,
      message: workflow.outreach.message,
      approved: workflow.outreach.approved,
      status: workflow.outreach.approved ? "approved" : "draft",
    },
    { onConflict: "company_id" },
  );
  throwIfError(outreachResult.error, "Save outreach");

  if (workflow.activities.length) {
    const activityResult = await supabase.from("lead_activities").upsert(
      workflow.activities.map((activity) => ({
        id: activity.id,
        company_id: company.id,
        type: activity.type,
        title: activity.title,
        detail: activity.detail ?? null,
        created_at: Number.isNaN(new Date(activity.createdAt).getTime())
          ? new Date().toISOString()
          : new Date(activity.createdAt).toISOString(),
      })),
      { onConflict: "id" },
    );
    throwIfError(activityResult.error, "Save activities");
  }
}

export async function deleteCompany(id: string) {
  const supabase = createClient();
  const res = await supabase.from("companies").delete().eq("id", id);
  throwIfError(res.error, "Delete company");
}

export async function deleteDemoCompanies(demoIds: string[]) {
  const supabase = createClient();
  const res = await supabase.from("companies").delete().in("id", demoIds);
  throwIfError(res.error, "Delete demo companies");
}

export async function deleteAllCompanies() {
  const supabase = createClient();
  const res = await supabase.from("companies").delete().not("id", "is", null);
  throwIfError(res.error, "Delete all companies");
}

export async function resetSupabaseDemoData(companies: Company[]) {
  const supabase = createClient();
  // Deleting companies cascades into all workflow tables, then the immutable
  // demo seed is inserted again. This reset is only intended for the MVP.
  const clearResult = await supabase.from("companies").delete().not("id", "is", null);
  throwIfError(clearResult.error, "Reset companies");
  await seedSupabaseDemoData(companies);
}
