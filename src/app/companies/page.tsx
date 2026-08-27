import { Plus } from "lucide-react";
import { CompaniesTable } from "@/components/companies/CompaniesTable";

export default function CompaniesPage() {
  return <div className="page"><div className="page-header"><div><div className="eyebrow">Lead database</div><h1>Companies</h1><p className="page-subtitle">Filter prospects, update pipeline status and persist the workflow through Supabase.</p></div><button className="button primary"><Plus size={17}/>Add company</button></div><CompaniesTable/></div>;
}
