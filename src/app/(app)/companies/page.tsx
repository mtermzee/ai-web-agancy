"use client";

import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { CompaniesTable } from "@/components/companies/CompaniesTable";
import { LeadFinderModal } from "@/components/companies/LeadFinderModal";

export default function CompaniesPage() {
  const [isFinderOpen, setIsFinderOpen] = useState(false);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Lead database</div>
          <h1>Companies</h1>
          <p className="page-subtitle">
            Filter prospects, update pipeline status and persist the workflow through Supabase.
          </p>
        </div>
        <button
          className="button primary"
          onClick={() => setIsFinderOpen(true)}
        >
          <Plus size={17} />
          <span>Leads finden & anlegen</span>
        </button>
      </div>

      <CompaniesTable />

      <LeadFinderModal
        isOpen={isFinderOpen}
        onClose={() => setIsFinderOpen(false)}
      />
    </div>
  );
}
