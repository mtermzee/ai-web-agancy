import { NextResponse } from "next/server";
import { searchOpenStreetMapLeads } from "@/lib/osm/leadFinder";
import type { IndustryPreset } from "@/types/osm";
import { createClient } from "@/lib/supabase/server";

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

  let body: {
    city?: string;
    industry?: IndustryPreset;
    customQuery?: string;
    onlyWithoutWebsite?: boolean;
    limit?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", code: "INVALID_BODY" },
      { status: 400 },
    );
  }

  const city = body.city?.trim();
  if (!city) {
    return NextResponse.json(
      { error: "City is required (e.g. Köln, Berlin, München)", code: "CITY_REQUIRED" },
      { status: 400 },
    );
  }

  const industry = (body.industry || "all") as IndustryPreset;
  const customQuery = body.customQuery?.trim();
  const onlyWithoutWebsite = Boolean(body.onlyWithoutWebsite);
  const limit = Math.min(50, Math.max(1, Number(body.limit) || 15));

  try {
    const leads = await searchOpenStreetMapLeads({
      city,
      industry,
      customQuery,
      onlyWithoutWebsite,
      limit,
    });

    return NextResponse.json({
      ok: true,
      city,
      industry,
      count: leads.length,
      leads,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OpenStreetMap search failed.";
    return NextResponse.json(
      { error: message, code: "SEARCH_FAILED" },
      { status: 500 },
    );
  }
}
