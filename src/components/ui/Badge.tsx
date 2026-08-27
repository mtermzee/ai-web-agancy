import type { LeadStatus, Potential } from "@/types/company";

export function StatusBadge({ status }: { status: LeadStatus }) {
  const tone = status === "Qualified" ? "green" : status === "High Potential" || status === "Mockup Ready" ? "purple" : status === "Rejected" ? "red" : status === "Needs Review" ? "orange" : "gray";
  return <span className={`badge ${tone}`}>{status}</span>;
}

export function PotentialBadge({ potential }: { potential: Potential }) {
  const tone = potential === "Very High" ? "purple" : potential === "High" ? "green" : potential === "Medium" ? "orange" : "gray";
  return <span className={`badge ${tone}`}>{potential}</span>;
}
