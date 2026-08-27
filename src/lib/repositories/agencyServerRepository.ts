import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Company, LeadStatus, Potential } from "@/types/company";

export async function getSupabaseCompany(id: string): Promise<Company | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }

  const supabase = await createClient();
  const companyResult = await supabase.from("companies").select("*").eq("id", id).maybeSingle();
  if (companyResult.error || !companyResult.data) return null;

  const [auditResult, leadResult, mockupResult] = await Promise.all([
    supabase.from("website_audits").select("*").eq("company_id", id).maybeSingle(),
    supabase.from("leads").select("*").eq("company_id", id).maybeSingle(),
    supabase.from("mockups").select("*").eq("company_id", id).maybeSingle(),
  ]);

  const row = companyResult.data as Record<string, unknown>;
  const audit = (auditResult.data ?? {}) as Record<string, unknown>;
  const lead = (leadResult.data ?? {}) as Record<string, unknown>;
  const mockup = (mockupResult.data ?? {}) as Record<string, unknown>;

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
    status: String(lead.status ?? "New") as LeadStatus,
    potential: String(lead.potential ?? "Medium") as Potential,
    lastAnalyzedAt: String(audit.last_analyzed_at ?? ""),
    scores: {
      overall: Number(audit.overall_score ?? 0),
      design: Number(audit.design_score ?? 0),
      mobile: Number(audit.mobile_score ?? 0),
      seo: Number(audit.seo_score ?? 0),
      performance: Number(audit.performance_score ?? 0),
      conversion: Number(audit.conversion_score ?? 0),
    },
    problems: Array.isArray(audit.problems) ? (audit.problems as string[]) : [],
    strengths: Array.isArray(audit.strengths) ? (audit.strengths as string[]) : [],
    aiSummary: String(audit.ai_summary ?? ""),
    opportunity: String(audit.opportunity ?? ""),
    recommendation: String(audit.recommendation ?? ""),
    suggestedStructure: Array.isArray(audit.suggested_structure)
      ? (audit.suggested_structure as string[])
      : [],
    salesAngle: String(audit.sales_angle ?? ""),
    mockupReady: String(mockup.status ?? "pending") === "ready",
  };
}
