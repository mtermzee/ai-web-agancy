import { NextResponse } from "next/server";
import { isGeminiConfigured } from "@/lib/gemini/analysis";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ? String(claimsData.claims.sub) : null;

  if (claimsError || !userId) {
    return NextResponse.json(
      { ok: false, auth: false, workspace: false, geminiConfigured: isGeminiConfigured() },
      { status: 401 },
    );
  }

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  return NextResponse.json({
    ok: Boolean(membership) && isGeminiConfigured(),
    auth: true,
    workspace: Boolean(membership) && !membershipError,
    role: membership?.role ?? null,
    geminiConfigured: isGeminiConfigured(),
    model: process.env.GEMINI_MODEL?.trim() || "gemini-3.7-flash",
  });
}
