import type { LucideIcon } from "lucide-react";
export function KpiCard({ label, value, change, icon: Icon }: { label: string; value: string | number; change: string; icon: LucideIcon }) {
  return <div className="card kpi-card"><div className="kpi-top"><div className="kpi-icon"><Icon size={18}/></div><span className="kpi-change">{change}</span></div><div className="kpi-value">{value}</div><div className="kpi-label">{label}</div></div>;
}
