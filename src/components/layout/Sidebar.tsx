"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bot, Building2, FileSearch, LayoutDashboard, Mail, PanelsTopLeft, Settings, Sparkles, Target } from "lucide-react";

const items = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Companies", "/companies", Building2],
  ["Leads", "/leads", Target],
  ["Website Audits", "/audits", FileSearch],
  ["Mockups", "/mockups", PanelsTopLeft],
  ["AI Analysis", "/analysis", Bot],
  ["Outreach", "/outreach", Mail],
  ["Settings", "/settings", Settings],
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><Sparkles size={18}/></span><span>AgencyOS</span></div>
      <div>
        <div className="nav-section-label">Workspace</div>
        <nav className="nav-list">
          {items.map(([label, href, Icon]) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return <Link key={href} href={href} className={`nav-link ${active ? "active" : ""}`}><Icon size={18}/>{label}</Link>;
          })}
        </nav>
      </div>
      <div className="sidebar-footer">
        <strong>AI pipeline · MVP mode</strong>
        <span>Hardcoded data today. Supabase, Gemini and n8n can replace the adapters later.</span>
      </div>
    </aside>
  );
}
