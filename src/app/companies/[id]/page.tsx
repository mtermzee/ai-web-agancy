import { notFound } from "next/navigation";
import { CompanyDetailClient } from "@/components/companies/CompanyDetailClient";
import { getCompany } from "@/lib/companies";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = getCompany(id);
  if (!company) return notFound();
  return <CompanyDetailClient initialCompany={company}/>;
}
