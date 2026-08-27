export type LeadStatus =
  | "New"
  | "Needs Review"
  | "High Potential"
  | "Mockup Ready"
  | "Contacted"
  | "Qualified"
  | "Rejected";

export type Potential = "Low" | "Medium" | "High" | "Very High";

export type WebsiteScores = {
  overall: number;
  design: number;
  mobile: number;
  seo: number;
  performance: number;
  conversion: number;
};

export type Company = {
  id: string;
  name: string;
  industry: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  hasWebsite: boolean;
  googleRating: number;
  reviewCount: number;
  status: LeadStatus;
  potential: Potential;
  lastAnalyzedAt: string;
  scores: WebsiteScores;
  problems: string[];
  strengths: string[];
  aiSummary: string;
  opportunity: string;
  recommendation: string;
  suggestedStructure: string[];
  salesAngle: string;
  mockupReady: boolean;
};
