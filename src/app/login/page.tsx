import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ShieldCheck, Sparkles } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims?.sub) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo"><Sparkles size={22} /></div>
          <div>
            <strong>AgencyOS</strong>
            <span>AI Web Agency Workspace</span>
          </div>
        </div>

        <div className="auth-copy">
          <div className="eyebrow">Secure workspace</div>
          <h1>Welcome back</h1>
          <p>Sign in with the user you created in Supabase Auth to access leads, audits, mockups and outreach.</p>
        </div>

        <Suspense fallback={<div className="auth-loading">Loading sign-in…</div>}>
          <LoginForm />
        </Suspense>

        <div className="auth-security-note">
          <ShieldCheck size={16} />
          <span>No public sign-up is exposed in this MVP.</span>
        </div>
      </section>
    </main>
  );
}
