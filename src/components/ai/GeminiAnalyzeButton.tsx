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

export function GeminiAnalyzeButton({
	companyId,
	compact = false,
	onComplete,
}: Props) {
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
			const raw = await response.text();
			let payload: GeminiAnalysisResponse & {
				error?: string;
				code?: string;
				requestId?: string;
			};
			try {
				payload = JSON.parse(raw) as GeminiAnalysisResponse & {
					error?: string;
					code?: string;
					requestId?: string;
				};
			} catch {
				throw new Error(
					`AI endpoint returned ${response.status}: ${raw.slice(0, 220) || "empty response"}`,
				);
			}
			if (!response.ok) {
				const requestSuffix = payload.requestId
					? ` · ref ${payload.requestId}`
					: "";
				throw new Error(
					`${payload.error || `Gemini analysis failed (${response.status}).`}${requestSuffix}`,
				);
			}

			await syncFromSupabase();
			setMessage(
				payload.warning
					? "Analyzed with fallback"
					: payload.mode === "website_url_context"
						? "Website analyzed"
						: payload.mode === "stored_profile"
							? "Stored profile analyzed"
							: "Lead analyzed",
			);
			onComplete?.(payload);
		} catch (runError) {
			setError(
				runError instanceof Error
					? runError.message
					: "Gemini analysis failed.",
			);
		} finally {
			setRunning(false);
		}
	};

	return (
		<div className={`gemini-action ${compact ? "compact" : ""}`}>
			<button
				className={`button ${compact ? "secondary" : "primary"}`}
				onClick={() => void run()}
				disabled={running}
			>
				{running ? (
					<RefreshCw size={15} className="spin-icon" />
				) : (
					<Sparkles size={15} />
				)}
				{running ? "Analyzing…" : compact ? "Analyze" : "Run Gemini analysis"}
			</button>
			{!compact && message && <span className="gemini-success">{message}</span>}
			{error && (
				<span className="gemini-error" title={error}>
					{error}
				</span>
			)}
		</div>
	);
}
