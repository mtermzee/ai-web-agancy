"use client";

import Link from "next/link";
import { ExternalLink, Globe2, LayoutTemplate, Sparkles, Trash2 } from "lucide-react";
import { PotentialBadge } from "@/components/ui/Badge";
import { useCompanyStore } from "@/components/providers/CompanyStoreProvider";
import { getIndustryPreset } from "@/lib/mockups/mockupAssets";

export function MockupGallery() {
  const { companies, removeMockup } = useCompanyStore();
  const ready = companies.filter((company) => company.mockupReady);

  return (
    <div className="mockup-grid">
      {ready.map((company) => {
        const preset = getIndustryPreset(company.industry, company.city);
        return (
          <article className="card mockup-card" key={company.id}>
            <div
              className="mockup-thumb"
              style={{
                position: "relative",
                height: 180,
                overflow: "hidden",
                padding: 0,
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <img
                src={preset.heroImage}
                alt={company.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.1) 60%)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: 14,
                }}
              >
                <span
                  style={{
                    color: "#ffffff",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(6px)",
                    padding: "3px 8px",
                    borderRadius: 6,
                  }}
                >
                  <Globe2 size={12} /> {company.city}
                </span>
              </div>
            </div>
            <div className="mockup-card-body">
              <div>
                <span className="mini-label" style={{ color: "#0284c7" }}>
                  <Sparkles size={11} style={{ display: "inline", marginRight: 3 }} />
                  KI-Konzept bereit
                </span>
                <h2>{company.name}</h2>
                <p>
                  {company.industry} · {company.city}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <PotentialBadge potential={company.potential} />
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button
                    className="button secondary compact icon-only"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Möchtest du das Mockup für „${company.name}“ aus der Galerie entfernen?`,
                        )
                      ) {
                        void removeMockup(company.id);
                      }
                    }}
                    title="Mockup entfernen"
                    style={{ color: "#d92d20", padding: "6px 8px" }}
                  >
                    <Trash2 size={14} />
                  </button>
                  <Link
                    className="button primary compact"
                    href={`/companies/${company.id}/mockup`}
                  >
                    <ExternalLink size={14} /> Mockup Studio
                  </Link>
                </div>
              </div>
            </div>
          </article>
        );
      })}
      {!ready.length && (
        <div className="card empty-state review-empty" style={{ gridColumn: "1 / -1", padding: 40 }}>
          <LayoutTemplate size={32} color="#64748b" />
          <strong style={{ fontSize: "1.1rem", marginTop: 8 }}>Noch keine Mockups generiert</strong>
          <span style={{ color: "#64748b" }}>
            Gehe auf eine Unternehmens-Detailseite oder in die Review Queue und klicke auf „Generate Mockup“.
          </span>
        </div>
      )}
    </div>
  );
}
