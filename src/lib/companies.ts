import { companies } from "@/data/companies";
import type { Company } from "@/types/company";

export function getCompany(id: string): Company | undefined {
  return companies.find((company) => company.id === id);
}

export function getDashboardStats() {
  const total = companies.length;
  const noWebsite = companies.filter((company) => !company.hasWebsite).length;
  const poorWebsite = companies.filter((company) => company.hasWebsite && company.scores.overall < 50).length;
  const goodWebsite = companies.filter((company) => company.scores.overall >= 70).length;
  const avgScore = Math.round(companies.reduce((sum, company) => sum + company.scores.overall, 0) / total);
  const leads = companies.filter((company) => ["High", "Very High"].includes(company.potential)).length;
  const mockups = companies.filter((company) => company.mockupReady).length;
  return { total, noWebsite, poorWebsite, goodWebsite, avgScore, leads, mockups };
}

export const scoreTone = (score: number) => {
  if (score >= 75) return "good";
  if (score >= 50) return "medium";
  return "bad";
};
