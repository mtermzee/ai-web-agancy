import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CompanyStoreProvider } from "@/components/providers/CompanyStoreProvider";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  const userId = String(data.claims.sub);
  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError || !membership) {
    redirect("/access-denied");
  }

  const email = typeof data.claims.email === "string" ? data.claims.email : "Signed in";

  return (
    <CompanyStoreProvider>
      <div className="app-shell">
        <Sidebar />
        <main className="main">
          <Topbar email={email} />
          {children}
        </main>
      </div>
    </CompanyStoreProvider>
  );
}
