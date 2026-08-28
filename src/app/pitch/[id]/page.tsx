import { notFound } from "next/navigation";
import { getCompany } from "@/lib/companies";
import { getSupabaseCompany } from "@/lib/repositories/agencyServerRepository";
import { ClientPitchView } from "@/components/mockups/ClientPitchView";

export default async function PitchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = (await getSupabaseCompany(id)) ?? getCompany(id);
  if (!company) return notFound();
  return <ClientPitchView company={company} />;
}
