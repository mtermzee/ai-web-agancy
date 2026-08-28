"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Globe2,
  MapPin,
  Pencil,
  Phone,
  Save,
  Sparkles,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { AuditScores } from "@/components/companies/AuditScores";
import { GeminiAnalyzeButton } from "@/components/ai/GeminiAnalyzeButton";
import { PotentialBadge, StatusBadge } from "@/components/ui/Badge";
import { StatusSelect } from "@/components/companies/StatusSelect";
import { useCompanyStore } from "@/components/providers/CompanyStoreProvider";
import { ActivityTimeline } from "@/components/workflow/ActivityTimeline";
import { LeadManagementPanel } from "@/components/workflow/LeadManagementPanel";
import type { Company, LeadStatus } from "@/types/company";

export function CompanyDetailClient({ initialCompany }: { initialCompany: Company }) {
  const router = useRouter();
  const {
    getCompany,
    getWorkflow,
    updateStatus,
    sendToReview,
    markMockupReady,
    deleteCompany,
    updateCompany,
  } = useCompanyStore();
  const company = getCompany(initialCompany.id) ?? initialCompany;
  const workflow = getWorkflow(company.id);
  const [generating, setGenerating] = useState(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(company.name);
  const [editPhone, setEditPhone] = useState(company.phone);
  const [editEmail, setEditEmail] = useState(company.email);
  const [editWebsite, setEditWebsite] = useState(company.website || "");
  const [editAddress, setEditAddress] = useState(company.address);
  const [editCity, setEditCity] = useState(company.city);
  const [editCountry, setEditCountry] = useState(company.country);
  const [editRating, setEditRating] = useState(company.googleRating || 0);
  const [editReviews, setEditReviews] = useState(company.reviewCount || 0);

  const generateMockup = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company }),
      });
      const data = await res.json();
      if (data.ok && data.mockupContent && typeof window !== "undefined") {
        window.localStorage.setItem(
          `agencyos-mockup-${company.id}`,
          JSON.stringify(data.mockupContent),
        );
      }
      markMockupReady(company.id);
      router.push(`/companies/${company.id}/mockup`);
    } catch (err) {
      console.warn("Mockup generation failed, navigating to studio", err);
      markMockupReady(company.id);
      router.push(`/companies/${company.id}/mockup`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Möchtest du "${company.name}" wirklich löschen?`)) {
      await deleteCompany(company.id);
      router.push("/companies");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWeb = editWebsite.trim()
      ? editWebsite.trim().startsWith("http")
        ? editWebsite.trim()
        : `https://${editWebsite.trim()}`
      : undefined;

    await updateCompany(company.id, {
      name: editName.trim() || company.name,
      phone: editPhone.trim(),
      email: editEmail.trim(),
      website: cleanWeb,
      hasWebsite: Boolean(cleanWeb),
      address: editAddress.trim(),
      city: editCity.trim(),
      country: editCountry.trim(),
      googleRating: Number(editRating) || 0,
      reviewCount: Number(editReviews) || 0,
    });
    setIsEditing(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link href="/companies" className="eyebrow inline-link">
            <ArrowLeft size={14} />
            Companies
          </Link>
          <h1>{company.name}</h1>
          <p className="page-subtitle">
            {company.industry} · {company.city}, {company.country}
          </p>
        </div>
        <div className="header-actions">
          <button
            className="button secondary"
            onClick={handleDelete}
            title="Unternehmen löschen"
            style={{ color: "#d92d20" }}
          >
            <Trash2 size={16} />
          </button>
          <Link className="button secondary" href={`/companies/${company.id}/mockup`}>
            <Globe2 size={17} />
            Open mockup
          </Link>
          <button
            className="button primary"
            onClick={generateMockup}
            disabled={generating || company.mockupReady}
          >
            <Sparkles size={17} />
            {generating
              ? "Generating..."
              : company.mockupReady
              ? "Mockup ready"
              : "Generate mockup"}
          </button>
        </div>
      </div>

      {workflow && (
        <section className="company-command-strip card">
          <div>
            <span>Lead score</span>
            <strong>
              {workflow.leadScore}
              <small>/100</small>
            </strong>
          </div>
          <div>
            <span>Priority</span>
            <strong>{workflow.priority}</strong>
          </div>
          <div>
            <span>Website score</span>
            <strong>
              {company.scores.overall}
              <small>/100</small>
            </strong>
          </div>
          <div>
            <span>Outreach</span>
            <strong className={workflow.outreach.approved ? "success-text" : "muted-text"}>
              {workflow.outreach.approved ? "Approved" : "Draft review"}
            </strong>
          </div>
          <div>
            <span>Mockup</span>
            <strong className={company.mockupReady ? "success-text" : "muted-text"}>
              {company.mockupReady ? "Ready" : "Pending"}
            </strong>
          </div>
        </section>
      )}

      <div className="detail-grid">
        <div className="detail-stack">
          <section className="card panel">
            <div className="panel-header">
              <div>
                <h2>Company information</h2>
                <div className="panel-note">Public business data & verified profile</div>
              </div>
              <div className="badge-row" style={{ alignItems: "center" }}>
                <button
                  className="button secondary compact"
                  onClick={() => setIsEditing(!isEditing)}
                  style={{ marginRight: 6, fontSize: "0.75rem", padding: "3px 8px" }}
                >
                  <Pencil size={12} />
                  <span>{isEditing ? "Abbrechen" : "Bearbeiten"}</span>
                </button>
                <StatusBadge status={company.status} />
                <PotentialBadge potential={company.potential} />
              </div>
            </div>

            {isEditing ? (
              <form
                onSubmit={handleSaveEdit}
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  background: "#f8fafc",
                  borderRadius: 10,
                  margin: "12px 16px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Firmenname</label>
                    <input
                      className="control compact"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Telefon</label>
                    <input
                      className="control compact"
                      placeholder="z. B. +49 221 123456"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>E-Mail</label>
                    <input
                      className="control compact"
                      placeholder="info@beispiel.de"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Website</label>
                    <input
                      className="control compact"
                      placeholder="https://beispiel.de"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Adresse</label>
                    <input
                      className="control compact"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Stadt & Land</label>
                    <input
                      className="control compact"
                      value={`${editCity}, ${editCountry}`}
                      onChange={(e) => {
                        const parts = e.target.value.split(",");
                        setEditCity(parts[0]?.trim() || "");
                        if (parts[1]) setEditCountry(parts[1].trim());
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Google Bewertung (★)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      className="control compact"
                      value={editRating}
                      onChange={(e) => setEditRating(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Anzahl Bewertungen</label>
                    <input
                      type="number"
                      min="0"
                      className="control compact"
                      value={editReviews}
                      onChange={(e) => setEditReviews(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                  <button
                    type="button"
                    className="button secondary compact"
                    onClick={() => setIsEditing(false)}
                  >
                    <X size={13} /> Abbrechen
                  </button>
                  <button type="submit" className="button primary compact">
                    <Save size={13} /> Speichern
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="workflow-strip">
                  <div>
                    <span className="workflow-label">Lead status</span>
                    <StatusSelect
                      value={company.status}
                      onChange={(status: LeadStatus) => updateStatus(company.id, status)}
                    />
                  </div>
                  <button
                    className="button secondary"
                    onClick={() => sendToReview(company.id)}
                    disabled={company.status === "Needs Review"}
                  >
                    Send to review
                  </button>
                  <span className={`save-state ${company.mockupReady ? "ready" : ""}`}>
                    {company.mockupReady ? "Mockup generated" : "No mockup yet"}
                  </span>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Address</div>
                    <div className="info-value">
                      <MapPin size={14} className="inline-icon" />
                      {company.address ? `${company.address}, ` : ""}
                      {company.city}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Phone</div>
                    <div className="info-value">
                      <Phone size={14} className="inline-icon" />
                      {company.phone || "Nicht hinterlegt"}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Email</div>
                    <div className="info-value">{company.email || "Nicht hinterlegt"}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Website</div>
                    <div className="info-value">
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            color: "var(--primary)",
                            textDecoration: "none",
                          }}
                        >
                          {company.website.replace(/^https?:\/\//, "")} <ExternalLink size={12} />
                        </a>
                      ) : (
                        "No website detected"
                      )}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Google rating</div>
                    <div className="info-value">
                      ★ {company.googleRating || 0} · {company.reviewCount || 0} reviews
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Last analysis</div>
                    <div className="info-value">{company.lastAnalyzedAt || "Bereit zur KI-Analyse"}</div>
                  </div>
                </div>
              </>
            )}
          </section>

          <section className="card panel">
            <div className="panel-header">
              <div>
                <h2>Website audit</h2>
                <div className="panel-note">Simple MVP scoring model · 0–100</div>
              </div>
            </div>
            <AuditScores scores={company.scores} />
          </section>

          <LeadManagementPanel company={company} />

          <div className="split-panels">
            <section className="card panel">
              <div className="panel-header">
                <div>
                  <h2>Problems</h2>
                  <div className="panel-note">Detected opportunities</div>
                </div>
              </div>
              <ul className="list">
                {company.problems.map((item) => (
                  <li key={item}>
                    <TriangleAlert className="list-icon" size={16} color="#d92d20" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <section className="card panel">
              <div className="panel-header">
                <div>
                  <h2>Strengths</h2>
                  <div className="panel-note">Signals worth preserving</div>
                </div>
              </div>
              <ul className="list">
                {company.strengths.map((item) => (
                  <li key={item}>
                    <CheckCircle2 className="list-icon" size={16} color="#079455" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <aside className="detail-stack">
          <section className="card panel ai-box">
            <div className="panel-header ai-panel-header">
              <div>
                <div className="ai-chip">
                  <Sparkles size={13} />
                  Gemini analyst · live
                </div>
                <h2>AI recommendation</h2>
              </div>
              <GeminiAnalyzeButton companyId={company.id} compact />
            </div>
            <p>
              {company.aiSummary ||
                "Run Gemini analysis to create a fresh evidence-aware recommendation."}
            </p>
            <p>
              <strong>Opportunity:</strong> {company.opportunity || "Not analyzed yet."}
            </p>
            <p>
              <strong>Recommendation:</strong> {company.recommendation || "Not analyzed yet."}
            </p>
            <div className="ai-disclaimer">
              Website scores are AI-assisted estimates from retrievable page evidence, not
              Lighthouse or browser-rendering measurements.
            </div>
          </section>
          <section className="card panel">
            <div className="panel-header">
              <div>
                <h2>Suggested structure</h2>
                <div className="panel-note">Future mockup generator input</div>
              </div>
            </div>
            <ol className="structure-list">
              {company.suggestedStructure.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>
          <section className="card panel">
            <div className="panel-header">
              <div>
                <h2>Sales angle</h2>
                <div className="panel-note">Review before future outreach</div>
              </div>
            </div>
            <p className="body-copy">{company.salesAngle}</p>
          </section>
          {workflow && (
            <section className="card panel">
              <div className="panel-header">
                <div>
                  <h2>Activity timeline</h2>
                  <div className="panel-note">Persisted history of human workflow actions</div>
                </div>
              </div>
              <ActivityTimeline activities={workflow.activities} />
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
