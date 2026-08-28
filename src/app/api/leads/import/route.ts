import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createDefaultWorkflow } from "@/lib/workflow";
import type { Company } from "@/types/company";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ? String(claimsData.claims.sub) : null;

  if (claimsError || !userId) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in.", code: "AUTH_REQUIRED" },
      { status: 401 },
    );
  }

  let body: { companies?: Company[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", code: "INVALID_BODY" },
      { status: 400 },
    );
  }

  const companies = body.companies;
  if (!Array.isArray(companies) || !companies.length) {
    return NextResponse.json(
      { error: "No companies provided to import.", code: "NO_COMPANIES" },
      { status: 400 },
    );
  }

  try {
    const companyRows = companies.map((company) => ({
      id: company.id,
      name: company.name,
      industry: company.industry,
      address: company.address || "",
      city: company.city || "",
      country: company.country || "Deutschland",
      phone: company.phone || "",
      email: company.email || "",
      website: company.website || null,
      has_website: Boolean(company.hasWebsite),
      google_rating: Number(company.googleRating || 0),
      review_count: Number(company.reviewCount || 0),
    }));

    const auditRows = companies.map((company) => ({
      company_id: company.id,
      overall_score: company.scores.overall,
      design_score: company.scores.design,
      mobile_score: company.scores.mobile,
      seo_score: company.scores.seo,
      performance_score: company.scores.performance,
      conversion_score: company.scores.conversion,
      problems: company.problems || [],
      strengths: company.strengths || [],
      ai_summary: company.aiSummary || "",
      opportunity: company.opportunity || "",
      recommendation: company.recommendation || "",
      suggested_structure: company.suggestedStructure || [],
      sales_angle: company.salesAngle || "",
      last_analyzed_at: company.lastAnalyzedAt || "",
    }));

    const workflows = companies.map((c) => ({ company: c, wf: createDefaultWorkflow(c) }));

    const leadRows = workflows.map(({ company, wf }) => ({
      company_id: company.id,
      status: company.status || "New",
      potential: company.potential || (company.hasWebsite ? "Medium" : "Very High"),
      lead_score: wf.leadScore,
      priority: wf.priority,
    }));

    const noteRows = workflows.map(({ company, wf }) => ({
      company_id: company.id,
      notes: wf.notes || "",
    }));

    const mockupRows = workflows.map(({ company, wf }) => ({
      company_id: company.id,
      status: wf.mockupReady ? "ready" : "pending",
      mockup_url: wf.mockupReady ? `/companies/${company.id}/mockup` : null,
    }));

    const outreachRows = workflows.map(({ company, wf }) => ({
      company_id: company.id,
      subject: wf.outreach.subject,
      message: wf.outreach.message,
      approved: wf.outreach.approved,
      status: "draft",
    }));

    const activityRows = workflows.flatMap(({ company }) => [
      {
        id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        company_id: company.id,
        type: "lead",
        title: "Lead aus OpenStreetMap importiert",
        detail: company.hasWebsite
          ? `Website: ${company.website}`
          : "Keine Website vorhanden (Hohes Potenzial)",
        created_at: new Date().toISOString(),
      },
    ]);

    // Upsert batch
    const [cRes, aRes, lRes, nRes, mRes, oRes, actRes] = await Promise.all([
      supabase.from("companies").upsert(companyRows, { onConflict: "id" }),
      supabase.from("website_audits").upsert(auditRows, { onConflict: "company_id" }),
      supabase.from("leads").upsert(leadRows, { onConflict: "company_id" }),
      supabase.from("lead_notes").upsert(noteRows, { onConflict: "company_id" }),
      supabase.from("mockups").upsert(mockupRows, { onConflict: "company_id" }),
      supabase.from("outreach").upsert(outreachRows, { onConflict: "company_id" }),
      supabase.from("lead_activities").upsert(activityRows, { onConflict: "id" }),
    ]);

    const errors = [cRes.error, aRes.error, lRes.error, nRes.error, mRes.error, oRes.error, actRes.error].filter(Boolean);
    if (errors.length) {
      throw new Error(errors.map((e) => e?.message).join(" | "));
    }

    return NextResponse.json({
      ok: true,
      importedCount: companies.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import to Supabase failed.";
    return NextResponse.json(
      { error: message, code: "IMPORT_FAILED" },
      { status: 500 },
    );
  }
}
