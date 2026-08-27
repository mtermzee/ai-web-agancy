import type { LeadStatus } from "@/types/company";

export type LeadPriority = "Low" | "Normal" | "High" | "Urgent";
export type ActivityType = "analysis" | "status" | "priority" | "score" | "note" | "mockup" | "outreach";

export type LeadActivity = {
  id: string;
  type: ActivityType;
  title: string;
  detail?: string;
  createdAt: string;
};

export type OutreachDraft = {
  subject: string;
  message: string;
  approved: boolean;
  updatedAt?: string;
};

export type CompanyWorkflowState = {
  status: LeadStatus;
  mockupReady: boolean;
  leadScore: number;
  priority: LeadPriority;
  notes: string;
  outreach: OutreachDraft;
  activities: LeadActivity[];
};
