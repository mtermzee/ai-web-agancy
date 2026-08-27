import { notFound } from "next/navigation";
import { CompanyDetailClient } from "@/components/companies/CompanyDetailClient";
import { getCompany } from "@/lib/companies";
import { getSupabaseCompany } from "@/lib/repositories/agencyServerRepository";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = (await getSupabaseCompany(id)) ?? getCompany(id);
  if (!company) return notFound();
  return <CompanyDetailClient initialCompany={company} />;
}
