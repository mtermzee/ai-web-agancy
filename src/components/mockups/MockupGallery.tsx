"use client";

import Link from "next/link";
import { ExternalLink, LayoutTemplate } from "lucide-react";
import { PotentialBadge } from "@/components/ui/Badge";
import { useCompanyStore } from "@/components/providers/CompanyStoreProvider";

export function MockupGallery() {
  const { companies } = useCompanyStore();
  const ready = companies.filter((company) => company.mockupReady);

  return <div className="mockup-grid">
    {ready.map((company) => <article className="card mockup-card" key={company.id}><div className="mockup-thumb"><div className="thumb-nav"/><div className="thumb-hero"><div/><span/></div><div className="thumb-cards"><i/><i/><i/></div></div><div className="mockup-card-body"><div><span className="mini-label">Generated concept</span><h2>{company.name}</h2><p>{company.industry} · {company.city}</p></div><PotentialBadge potential={company.potential}/><Link className="button secondary" href={`/companies/${company.id}/mockup`}><ExternalLink size={15}/>Open preview</Link></div></article>)}
    {!ready.length && <div className="card empty-state review-empty"><LayoutTemplate size={26}/><strong>No mockups generated yet.</strong><span>Generate one from a company detail page or the review queue.</span></div>}
  </div>;
}
