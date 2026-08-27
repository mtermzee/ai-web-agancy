"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { useCompanyStore } from "@/components/providers/CompanyStoreProvider";
import type { Company } from "@/types/company";

export function MockupPreviewClient({ initialCompany }: { initialCompany: Company }) {
  const { getCompany, markMockupReady } = useCompanyStore();
  const company = getCompany(initialCompany.id) ?? initialCompany;
  const [generating, setGenerating] = useState(false);

  const generate = () => {
    if (company.mockupReady || generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      markMockupReady(company.id);
      setGenerating(false);
    }, 900);
  };

  return <div className="page"><div className="page-header"><div><Link href={`/companies/${company.id}`} className="eyebrow inline-link"><ArrowLeft size={14}/>{company.name}</Link><h1>Website mockup preview</h1><p className="page-subtitle">A simulated generation flow today; later powered by Gemini + a template pipeline.</p></div><button className={`button ${company.mockupReady ? "success-button" : "primary"}`} onClick={generate} disabled={company.mockupReady || generating}>{company.mockupReady ? <CheckCircle2 size={17}/> : <Sparkles size={17}/>} {generating ? "Generating concept..." : company.mockupReady ? "Mockup ready" : "Generate concept"}</button></div>
    {!company.mockupReady && <div className="generation-banner"><Sparkles size={18}/><div><strong>This preview is not marked as generated yet.</strong><span>Click “Generate concept” to simulate the future agent and persist the result in Supabase (with LocalStorage fallback).</span></div></div>}
    <div className={`mockup-shell ${generating ? "is-generating" : ""}`}><div className="browser-bar"><span className="browser-dot"/><span className="browser-dot"/><span className="browser-dot"/><span className="browser-address">preview.agencyos.local/{company.id}</span></div><div className="mock-site">
      <nav className="mock-nav"><div className="mock-brand">{company.name}</div><div className="mock-links"><span>Leistungen</span><span>Über uns</span><span>Bewertungen</span><span>Kontakt</span></div><button className="mock-cta">Termin vereinbaren</button></nav>
      <section className="mock-hero"><div><div className="mock-kicker">Modern care · locally trusted</div><h2>Ihre Gesundheit verdient eine Praxis, die sich Zeit nimmt.</h2><p>Persönliche Betreuung, moderne Behandlung und ein unkomplizierter Weg zu Ihrem nächsten Termin – in einer ruhigen, vertrauensvollen Atmosphäre.</p><div className="mock-cta-row"><button className="mock-cta">Termin vereinbaren</button><button className="mock-ghost">Leistungen ansehen</button></div></div><div className="mock-photo"/></section>
      <section className="mock-section alt"><div className="mock-section-title"><div><div className="mock-kicker">Unsere Leistungen</div><h3>Moderne Behandlung. Klar erklärt.</h3></div><p>Von Vorsorge bis Spezialbehandlung: verständliche Leistungen, transparente Abläufe und persönliche Ansprechpartner.</p></div><div className="service-grid"><div className="service-card"><strong>Vorsorge & Prophylaxe</strong><span>Früh erkennen, langfristig gesund bleiben und Behandlung vermeiden.</span></div><div className="service-card"><strong>Ästhetische Behandlung</strong><span>Moderne Lösungen mit natürlichem Ergebnis und sorgfältiger Beratung.</span></div><div className="service-card"><strong>Akute Beschwerden</strong><span>Schnelle Orientierung und ein klarer Weg zur passenden Behandlung.</span></div></div></section>
      <section className="mock-section"><div className="mock-section-title"><div><div className="mock-kicker">Vertrauen</div><h3>Was Patient:innen sagen</h3></div><p>Das bestehende Bewertungsprofil wird direkt in den neuen Auftritt integriert und sichtbar gemacht.</p></div><div className="mock-testimonial">“Professionell, freundlich und endlich eine Praxis, bei der man sich vom ersten Kontakt an gut aufgehoben fühlt.”</div></section>
      <footer className="mock-footer"><strong>{company.name}</strong><span>{company.address} · {company.city}</span><span>{company.phone}</span></footer>
    </div>{generating && <div className="generation-overlay"><div className="spinner"/><strong>Building website concept</strong><span>Combining company profile, audit signals and suggested structure…</span></div>}</div>
  </div>;
}
