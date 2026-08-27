"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function Topbar({ email }: { email: string }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const initials = email === "Signed in"
    ? "AO"
    : email.split("@")[0].split(/[._-]/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "AO";

  return (
    <header className="topbar">
      <div className="top-search">
        <Search size={18} />
        <input placeholder="Search companies, leads, audits..." />
      </div>
      <div className="top-actions">
        <button className="icon-button" aria-label="Notifications"><Bell size={18} /></button>
        <div className="top-user" title={email}>
          <div className="avatar">{initials}</div>
          <span>{email}</span>
        </div>
        <button className="icon-button" aria-label="Sign out" title="Sign out" onClick={handleSignOut} disabled={signingOut}>
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
