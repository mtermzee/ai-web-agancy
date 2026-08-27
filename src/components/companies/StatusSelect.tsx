"use client";

import type { LeadStatus } from "@/types/company";

const statuses: LeadStatus[] = [
  "New",
  "Needs Review",
  "High Potential",
  "Mockup Ready",
  "Contacted",
  "Qualified",
  "Rejected",
];

export function StatusSelect({ value, onChange, compact = false }: { value: LeadStatus; onChange: (status: LeadStatus) => void; compact?: boolean }) {
  return (
    <select
      className={`status-select ${compact ? "compact" : ""}`}
      value={value}
      onChange={(event) => onChange(event.target.value as LeadStatus)}
      aria-label="Lead status"
    >
      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
    </select>
  );
}
