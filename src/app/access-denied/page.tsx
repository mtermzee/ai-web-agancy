import { ShieldAlert } from "lucide-react";
import { AccessDeniedActions } from "@/components/auth/AccessDeniedActions";

export default function AccessDeniedPage() {
  return (
    <main className="auth-page">
      <section className="auth-card access-denied-card">
        <div className="access-denied-icon"><ShieldAlert size={25} /></div>
        <div className="auth-copy">
          <div className="eyebrow">Workspace access</div>
          <h1>Access not granted</h1>
          <p>
            Your Supabase account is authenticated, but it is not listed in the AgencyOS
            workspace_members table. Add the Auth user UUID as a workspace member, then sign in again.
          </p>
        </div>
        <AccessDeniedActions />
      </section>
    </main>
  );
}
