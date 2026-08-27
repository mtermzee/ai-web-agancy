"use client";

import { useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { useCompanyStore } from "@/components/providers/CompanyStoreProvider";
import type { GeminiAnalysisResponse } from "@/types/ai";

type Props = {
  companyId: string;
  compact?: boolean;
  onComplete?: (result: GeminiAnalysisResponse) => void;
};

export function GeminiAnalyzeButton({ companyId, compact = false, onComplete }: Props) {
  const { syncFromSupabase } = useCompanyStore();
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      const payload = (await response.json()) as GeminiAnalysisResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Gemini analysis failed.");

      await syncFromSupabase();
      setMessage(payload.mode === "website_url_context" ? "Website analyzed" : "Lead analyzed");
      onComplete?.(payload);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Gemini analysis failed.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className={`gemini-action ${compact ? "compact" : ""}`}>
      <button className={`button ${compact ? "secondary" : "primary"}`} onClick={() => void run()} disabled={running}>
        {running ? <RefreshCw size={15} className="spin-icon" /> : <Sparkles size={15} />}
        {running ? "Analyzing…" : compact ? "Analyze" : "Run Gemini analysis"}
      </button>
      {!compact && message && <span className="gemini-success">{message}</span>}
      {error && <span className="gemini-error" title={error}>{compact ? "Failed" : error}</span>}
    </div>
  );
}
