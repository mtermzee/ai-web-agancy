import type { Company } from "@/types/company";
import type { CompanyWorkflowState, LeadPriority, OutreachDraft } from "@/types/workflow";

const potentialBase = {
  "Very High": 80,
  High: 68,
  Medium: 52,
  Low: 34,
} as const;

export function calculateLeadScore(company: Company) {
  const weakWebsiteBonus = company.hasWebsite ? Math.round((100 - company.scores.overall) * 0.18) : 18;
  const trustBonus = Math.min(8, Math.round((company.googleRating - 4) * 5) + Math.min(4, Math.floor(company.reviewCount / 100)));
  return Math.max(0, Math.min(100, potentialBase[company.potential] + weakWebsiteBonus + trustBonus));
}

export function priorityFromScore(score: number): LeadPriority {
  if (score >= 90) return "Urgent";
  if (score >= 78) return "High";
  if (score >= 58) return "Normal";
  return "Low";
}

export function buildDefaultOutreachDraft(company: Company): OutreachDraft {
  const websiteLine = company.hasWebsite
    ? `Bei einer kurzen Analyse Ihrer Website sind uns vor allem ${company.problems.slice(0, 2).join(" und ").toLowerCase()} aufgefallen.`
    : "Uns ist aufgefallen, dass aktuell keine eigene Website als zentraler digitaler Anlaufpunkt vorhanden ist.";

  return {
    subject: `Idee für den Webauftritt von ${company.name}`,
    message: `Hallo ${company.name}-Team,\n\nich bin bei der Recherche nach starken lokalen Unternehmen auf Sie aufmerksam geworden. ${websiteLine}\n\n${company.salesAngle}\n\nIch habe dazu bereits einen unverbindlichen Website-Ansatz vorbereitet, der zeigt, wie ein modernerer Auftritt aussehen könnte. Wenn das für Sie interessant ist, würde ich Ihnen die Idee gern kurz zeigen.\n\nViele Grüße`,
    approved: false,
  };
}

export function createDefaultWorkflow(company: Company): CompanyWorkflowState {
  const leadScore = calculateLeadScore(company);
  return {
    status: company.status,
    mockupReady: company.mockupReady,
    leadScore,
    priority: priorityFromScore(leadScore),
    notes: "",
    outreach: buildDefaultOutreachDraft(company),
    activities: [
      {
        id: `seed-analysis-${company.id}`,
        type: "analysis",
        title: "Website analysis completed",
        detail: `Overall website score: ${company.scores.overall}/100`,
        createdAt: company.lastAnalyzedAt,
      },
    ],
  };
}
