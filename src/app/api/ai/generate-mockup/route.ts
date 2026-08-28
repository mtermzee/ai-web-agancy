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

  let body: { company?: Company; companyId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", code: "INVALID_BODY" },
      { status: 400 },
    );
  }

  let company = body.company;

  if (!company && body.companyId) {
    const { data: cRow } = await supabase
      .from("companies")
      .select("*")
      .eq("id", body.companyId)
      .maybeSingle();

    if (cRow) {
      company = {
        id: String(cRow.id),
        name: String(cRow.name || ""),
        industry: String(cRow.industry || ""),
        address: String(cRow.address || ""),
        city: String(cRow.city || ""),
        country: String(cRow.country || "Deutschland"),
        phone: String(cRow.phone || ""),
        email: String(cRow.email || ""),
        website: cRow.website ? String(cRow.website) : undefined,
        hasWebsite: Boolean(cRow.has_website),
        googleRating: Number(cRow.google_rating || 0),
        reviewCount: Number(cRow.review_count || 0),
        status: "New",
        potential: "High",
        lastAnalyzedAt: "",
        scores: { overall: 50, design: 50, mobile: 50, seo: 50, performance: 50, conversion: 50 },
        problems: [],
        strengths: [],
        aiSummary: "",
        opportunity: "",
        recommendation: "",
        suggestedStructure: [],
        salesAngle: "",
        mockupReady: true,
      };
    }
  }

  if (!company) {
    return NextResponse.json(
      { error: "Company data is required", code: "NO_COMPANY" },
      { status: 400 },
    );
  }

  try {
    const mockupContent = await generateMockupWithGemini(company);

    // Save mockup status in Supabase if exists
    if (company.id) {
      await supabase.from("mockups").upsert(
        {
          company_id: company.id,
          status: "ready",
          mockup_url: `/companies/${company.id}/mockup`,
        },
        { onConflict: "company_id" },
      );
    }

    return NextResponse.json({
      ok: true,
      mockupContent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message, code: "GENERATION_ERROR" }, { status: 500 });
  }
}
