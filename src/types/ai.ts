export type GeminiAnalysisMode = "website_url_context" | "stored_profile" | "business_data_only";

export type GeminiWebsiteScores = {
  overall: number;
  design: number;
  mobile: number;
  seo: number;
  performance: number;
  conversion: number;
};

export type GeminiCompanyAnalysis = {
  scores: GeminiWebsiteScores;
  problems: string[];
  strengths: string[];
  summary: string;
  opportunity: string;
  recommendation: string;
  suggestedStructure: string[];
  salesAngle: string;
  potential: "Low" | "Medium" | "High" | "Very High";
  leadScore: number;
  confidence: number;
};

export type GeminiSource = {
  title?: string;
  url: string;
};

export type GeminiAnalysisResponse = {
  analysis: GeminiCompanyAnalysis;
  model: string;
  mode: GeminiAnalysisMode;
  sources: GeminiSource[];
  analyzedAt: string;
  warning?: string;
};
