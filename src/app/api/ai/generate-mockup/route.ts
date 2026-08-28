import { NextResponse } from "next/server";
import { generateMockupWithGemini } from "@/lib/gemini/mockupGenerator";
import { createClient } from "@/lib/supabase/server";
import type { Company } from "@/types/company";

export const runtime = "nodejs";
export const maxDuration = 45;

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

  let body: { company?: Company; companyId?: string; style?: import("@/types/mockup").MockupStyle };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", code: "INVALID_BODY" },
      { status: 400 },
    );
  }

  let company = body.company;
  const companyId = body.companyId || company?.id;

  if (companyId) {
    const { data: cRow } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .maybeSingle();

    const { data: aRow } = await supabase
      .from("website_audits")
      .select("*")
      .eq("company_id", companyId)
      .maybeSingle();

    if (cRow) {
      company = {
        id: String(cRow.id),
        name: String(cRow.name || company?.name || ""),
        industry: String(cRow.industry || company?.industry || ""),
        address: String(cRow.address || company?.address || ""),
        city: String(cRow.city || company?.city || ""),
        country: String(cRow.country || company?.country || "Deutschland"),
        phone: String(cRow.phone || company?.phone || ""),
        email: String(cRow.email || company?.email || ""),
        website: cRow.website ? String(cRow.website) : company?.website,
        hasWebsite: Boolean(cRow.has_website ?? company?.hasWebsite),
        googleRating: Number(cRow.google_rating || company?.googleRating || 0),
        reviewCount: Number(cRow.review_count || company?.reviewCount || 0),
        status: company?.status || "New",
        potential: company?.potential || "High",
        lastAnalyzedAt: String(aRow?.last_analyzed_at || company?.lastAnalyzedAt || ""),
        scores: aRow
          ? {
              overall: Number(aRow.overall_score || 50),
              design: Number(aRow.design_score || 50),
              mobile: Number(aRow.mobile_score || 50),
              seo: Number(aRow.seo_score || 50),
              performance: Number(aRow.performance_score || 50),
              conversion: Number(aRow.conversion_score || 50),
            }
          : company?.scores || { overall: 50, design: 50, mobile: 50, seo: 50, performance: 50, conversion: 50 },
        problems: Array.isArray(aRow?.problems) ? aRow.problems : (company?.problems || []),
        strengths: Array.isArray(aRow?.strengths) ? aRow.strengths : (company?.strengths || []),
        aiSummary: String(aRow?.ai_summary || company?.aiSummary || ""),
        opportunity: String(aRow?.opportunity || company?.opportunity || ""),
        recommendation: String(aRow?.recommendation || company?.recommendation || ""),
        suggestedStructure: Array.isArray(aRow?.suggested_structure)
          ? aRow.suggested_structure
          : (company?.suggestedStructure || []),
        salesAngle: String(aRow?.sales_angle || company?.salesAngle || ""),
        mockupReady: true,
      };
    }
  }

  if (!company) {
    return NextResponse.json(
      { error: "Unternehmensdaten sind erforderlich.", code: "NO_COMPANY" },
      { status: 400 },
    );
  }

  try {
    const mockupContent = await generateMockupWithGemini(company, body.style);

    // Save mockup status in Supabase if company exists in db
    if (company.id) {
      try {
        await supabase.from("mockups").upsert(
          {
            company_id: company.id,
            status: "ready",
            mockup_url: `/companies/${company.id}/mockup`,
          },
          { onConflict: "company_id" },
        );
      } catch (dbErr) {
        console.warn("[Mockup Route] Supabase upsert non-critical warning:", dbErr);
      }
    }

    return NextResponse.json({
      ok: true,
      mockupContent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generierung fehlgeschlagen";
    console.error("[Mockup API Error]", error);
    return NextResponse.json({ error: message, code: "GENERATION_ERROR" }, { status: 500 });
  }
}
