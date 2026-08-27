"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value === "/login") {
    return "/dashboard";
  }
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    router.replace(safeNextPath(searchParams.get("next")));
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="auth-field">
        <span>Email</span>
        <div className="auth-input-wrap">
          <Mail size={17} />
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@agency.com"
            required
          />
        </div>
      </label>

      <label className="auth-field">
        <span>Password</span>
        <div className="auth-input-wrap">
          <LockKeyhole size={17} />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
      </label>

      {error && <div className="auth-error">{error}</div>}

      <button className="button primary auth-submit" type="submit" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
        {!submitting && <ArrowRight size={16} />}
      </button>
    </form>
  );
}
