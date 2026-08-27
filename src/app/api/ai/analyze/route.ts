import { NextResponse } from "next/server";
import { analyzeCompanyWithGemini, isGeminiConfigured } from "@/lib/gemini/analysis";
import { createClient } from "@/lib/supabase/server";
import { priorityFromScore } from "@/lib/workflow";
import type { Company, LeadStatus, Potential } from "@/types/company";

export const runtime = "nodejs";
export const maxDuration = 60;

type AnalyzeRequest = { companyId?: string };

function companyFromRows(
  row: Record<string, unknown>,
  audit: Record<string, unknown>,
  lead: Record<string, unknown>,
  mockup: Record<string, unknown>,
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
    suggestedStructure: Array.isArray(audit.suggested_structure) ? (audit.suggested_structure as string[]) : [],
    salesAngle: String(audit.sales_angle ?? ""),
    mockupReady: String(mockup.status ?? "pending") === "ready",
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ? String(claimsData.claims.sub) : null;

  if (claimsError || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  if (!membership) {
    return NextResponse.json({ error: "Workspace access denied" }, { status: 403 });
  }

  if (!isGeminiConfigured()) {
    return NextResponse.json(
      { error: "Gemini is not configured. Add GEMINI_API_KEY to Vercel and .env.local." },
      { status: 503 },
    );
  }

  let body: AnalyzeRequest;
  try {
    body = (await request.json()) as AnalyzeRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const companyId = body.companyId?.trim();
  if (!companyId) {
    return NextResponse.json({ error: "companyId is required" }, { status: 400 });
  }

  const companyResult = await supabase.from("companies").select("*").eq("id", companyId).maybeSingle();
  if (companyResult.error || !companyResult.data) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const [auditResult, leadResult, mockupResult] = await Promise.all([
    supabase.from("website_audits").select("*").eq("company_id", companyId).maybeSingle(),
    supabase.from("leads").select("*").eq("company_id", companyId).maybeSingle(),
    supabase.from("mockups").select("*").eq("company_id", companyId).maybeSingle(),
  ]);

  const company = companyFromRows(
    companyResult.data as Record<string, unknown>,
    (auditResult.data ?? {}) as Record<string, unknown>,
    (leadResult.data ?? {}) as Record<string, unknown>,
    (mockupResult.data ?? {}) as Record<string, unknown>,
  );

  try {
    const result = await analyzeCompanyWithGemini(company);
    const analysis = result.analysis;

    const auditSave = await supabase.from("website_audits").upsert(
      {
        company_id: companyId,
        overall_score: analysis.scores.overall,
        design_score: analysis.scores.design,
        mobile_score: analysis.scores.mobile,
        seo_score: analysis.scores.seo,
        performance_score: analysis.scores.performance,
        conversion_score: analysis.scores.conversion,
        problems: analysis.problems,
        strengths: analysis.strengths,
        ai_summary: analysis.summary,
        opportunity: analysis.opportunity,
        recommendation: analysis.recommendation,
        suggested_structure: analysis.suggestedStructure,
        sales_angle: analysis.salesAngle,
        last_analyzed_at: result.analyzedAt,
      },
      { onConflict: "company_id" },
    );
    if (auditSave.error) throw new Error(`Save audit: ${auditSave.error.message}`);

    const currentStatus = company.status;
    const leadSave = await supabase.from("leads").upsert(
      {
        company_id: companyId,
        status: currentStatus,
        potential: analysis.potential,
        lead_score: analysis.leadScore,
        priority: priorityFromScore(analysis.leadScore),
      },
      { onConflict: "company_id" },
    );
    if (leadSave.error) throw new Error(`Save lead score: ${leadSave.error.message}`);

    const activityId = `analysis-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const activitySave = await supabase.from("lead_activities").insert({
      id: activityId,
      company_id: companyId,
      type: "analysis",
      title: "Gemini analysis completed",
      detail: `${result.model} · ${result.mode === "website_url_context" ? "website URL context" : "business data only"} · confidence ${analysis.confidence}%`,
      created_at: result.analyzedAt,
    });
    if (activitySave.error) throw new Error(`Save activity: ${activitySave.error.message}`);

    // Migration 003 is optional for running the core analysis. If the history table
    // is present, keep a traceable record. If not, the canonical audit still saves.
    const runSave = await supabase.from("ai_analysis_runs").insert({
      company_id: companyId,
      created_by: userId,
      status: "completed",
      model: result.model,
      mode: result.mode,
      input_url: company.website ?? null,
      confidence: analysis.confidence,
      result: analysis,
      sources: result.sources,
      created_at: result.analyzedAt,
    });

    return NextResponse.json({
      ...result,
      historySaved: !runSave.error,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini analysis failed.";

    // Best-effort failure history. The route still returns the real analysis error.
    await supabase.from("ai_analysis_runs").insert({
      company_id: companyId,
      created_by: userId,
      status: "failed",
      model: process.env.GEMINI_MODEL?.trim() || "gemini-3.7-flash",
      mode: company.hasWebsite && company.website ? "website_url_context" : "business_data_only",
      input_url: company.website ?? null,
      error: message,
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
