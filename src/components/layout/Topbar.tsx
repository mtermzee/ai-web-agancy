import { Bell, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="topbar">
      <div className="top-search"><Search size={18}/><input placeholder="Search companies, leads, audits..." /></div>
      <div className="top-actions"><button className="icon-button" aria-label="Notifications"><Bell size={18}/></button><div className="avatar">MT</div></div>
    </header>
  );
}
