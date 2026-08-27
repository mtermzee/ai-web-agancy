import { notFound } from "next/navigation";
import { MockupPreviewClient } from "@/components/mockups/MockupPreviewClient";
import { getCompany } from "@/lib/companies";

export default async function MockupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = getCompany(id);
  if (!company) return notFound();
  return <MockupPreviewClient initialCompany={company}/>;
}
