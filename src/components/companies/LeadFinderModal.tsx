"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useCompanyStore } from "@/components/providers/CompanyStoreProvider";
import type { Company } from "@/types/company";
import { type IndustryPreset, INDUSTRY_CONFIG } from "@/types/osm";

const POPULAR_CITIES = [
  "Köln",
  "Berlin",
  "München",
  "Hamburg",
  "Wien",
  "Zürich",
  "London",
  "New York",
  "Miami",
  "Dubai",
  "Paris",
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type ConfirmImportState = {
  isOpen: boolean;
  toImport: Company[];
  newCount: number;
  existingCount: number;
  updatedItems: Array<{ company: Company; diffs: string[] }>;
};

function findExistingMatch(lead: Company, crmList: Company[]): Company | undefined {
  const normLeadName = lead.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normLeadCity = lead.city.toLowerCase().replace(/[^a-z0-9]/g, "");

  return crmList.find((c) => {
    if (c.id === lead.id) return true;
    const cName = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cCity = c.city.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cName === normLeadName && (cCity === normLeadCity || !cCity || !normLeadCity)) return true;
    if (
      lead.website &&
      c.website &&
      lead.website.replace(/^https?:\/\//, "").replace(/\/$/, "") ===
        c.website.replace(/^https?:\/\//, "").replace(/\/$/, "")
    ) {
      return true;
    }
    return false;
  });
}

function getLeadDifferences(lead: Company, existing: Company): string[] {
  const diffs: string[] = [];
  if (lead.phone && lead.phone !== existing.phone) {
    diffs.push(`Telefonnummer neu: ${lead.phone}`);
  }
  if (lead.email && lead.email !== existing.email) {
    diffs.push(`E-Mail neu: ${lead.email}`);
  }
  if (lead.website && lead.website !== existing.website) {
    diffs.push(`Website aktualisiert: ${lead.website}`);
  }
  if (
    lead.address &&
    lead.address !== existing.address &&
    lead.address !== `${existing.city} Zentrum` &&
    !existing.address.includes(lead.address)
  ) {
    diffs.push(`Adresse ergänzt: ${lead.address}`);
  }
  return diffs;
}

export function LeadFinderModal({ isOpen, onClose }: Props) {
  const { syncFromSupabase, companies: existingCrmCompanies } = useCompanyStore();
  const [activeTab, setActiveTab] = useState<"osm" | "manual">("osm");

  // OSM Search State
  const [city, setCity] = useState("Köln");
  const [industry, setIndustry] = useState<IndustryPreset>("dentist");
  const [customQuery, setCustomQuery] = useState("");
  const [onlyWithoutWebsite, setOnlyWithoutWebsite] = useState(false);
  const [limit, setLimit] = useState(50);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Company[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<ConfirmImportState | null>(null);

  // Import State
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // Manual Form State
  const [manualName, setManualName] = useState("");
  const [manualIndustry, setManualIndustry] = useState("Dienstleistung");
  const [manualCity, setManualCity] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [manualWebsite, setManualWebsite] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!city.trim()) return;
    setSearching(true);
    setSearchError(null);
    setImportSuccess(null);
    setLeads([]);
    setSelectedIds(new Set());

    try {
      const res = await fetch("/api/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: city.trim(),
          industry,
          customQuery: customQuery.trim() || undefined,
          onlyWithoutWebsite,
          limit,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Suche fehlgeschlagen (${res.status})`);
      }

      const fetchedLeads = data.leads || [];
      setLeads(fetchedLeads);
      // Select all by default
      setSelectedIds(new Set(fetchedLeads.map((l: Company) => l.id)));
      if (!fetchedLeads.length) {
        setSearchError(
          "Keine Einträge für diese Suchkombination gefunden. Versuche eine andere Stadt oder einen breiteren Begriff.",
        );
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Suche fehlgeschlagen.");
    } finally {
      setSearching(false);
    }
  };

  const handleLoadMore = async () => {
    if (!city.trim() || loadingMore) return;
    setLoadingMore(true);
    setSearchError(null);

    try {
      const newLimit = leads.length + 50;
      const res = await fetch("/api/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: city.trim(),
          industry,
          customQuery: customQuery.trim() || undefined,
          onlyWithoutWebsite,
          limit: newLimit,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Laden fehlgeschlagen");

      const fetchedLeads = data.leads || [];
      const existingIds = new Set(leads.map((l) => l.id));
      const newOnes = fetchedLeads.filter((l: Company) => !existingIds.has(l.id));

      if (newOnes.length === 0) {
        setSearchError("Keine weiteren Betriebe in dieser Region gefunden.");
      } else {
        setLeads(fetchedLeads);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          for (const l of newOnes) next.add(l.id);
          return next;
        });
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Fehler beim Nachladen.");
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)));
    }
  };

  const handleImportClick = () => {
    const toImport = leads.filter((l) => selectedIds.has(l.id));
    if (!toImport.length) return;

    const newOnes: Company[] = [];
    const existingOnes: Company[] = [];
    const updatedItems: Array<{ company: Company; diffs: string[] }> = [];

    for (const lead of toImport) {
      const existing = findExistingMatch(lead, existingCrmCompanies);
      if (existing) {
        existingOnes.push(lead);
        const diffs = getLeadDifferences(lead, existing);
        if (diffs.length > 0) {
          updatedItems.push({ company: lead, diffs });
        }
      } else {
        newOnes.push(lead);
      }
    }

    // If there are existing companies in the selection, ask first!
    if (existingOnes.length > 0) {
      setConfirmModal({
        isOpen: true,
        toImport,
        newCount: newOnes.length,
        existingCount: existingOnes.length,
        updatedItems,
      });
      return;
    }

    // Otherwise import directly
    void executeImport(toImport, false);
  };

  const executeImport = async (toImport: Company[], updateExisting: boolean) => {
    setConfirmModal(null);
    setImporting(true);
    setSearchError(null);

    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companies: toImport, updateExisting }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Import fehlgeschlagen (${res.status})`);
      }

      await syncFromSupabase();

      let msg = "";
      if (data.insertedCount > 0 && data.updatedCount > 0) {
        msg = `${data.insertedCount} neue Leads angelegt & ${data.updatedCount} bestehende aktualisiert!`;
      } else if (data.insertedCount > 0) {
        msg = `${data.insertedCount} neue Leads erfolgreich ins CRM importiert!`;
      } else if (data.updatedCount > 0) {
        msg = `${data.updatedCount} bestehende Leads erfolgreich aktualisiert!`;
      } else {
        msg = `Keine neuen Leads importiert (${data.skippedCount || 0} unverändert übersprungen).`;
      }

      setImportSuccess(msg);
      // Remove imported from current list
      setLeads((prev) => prev.filter((l) => !selectedIds.has(l.id)));
      setSelectedIds(new Set());
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Import fehlgeschlagen.");
    } finally {
      setImporting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualCity.trim()) {
      setManualError("Name und Stadt sind Pflichtfelder.");
      return;
    }

    setImporting(true);
    setManualError(null);

    const hasWebsite = Boolean(manualWebsite.trim());
    const cleanWebsite = hasWebsite
      ? manualWebsite.startsWith("http")
        ? manualWebsite.trim()
        : `https://${manualWebsite.trim()}`
      : undefined;

    const newCompany: Company = {
      id: `${manualName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`,
      name: manualName.trim(),
      industry: manualIndustry.trim(),
      address: manualAddress.trim(),
      city: manualCity.trim(),
      country: "Deutschland",
      phone: manualPhone.trim(),
      email: manualEmail.trim(),
      website: cleanWebsite,
      hasWebsite,
      googleRating: 0,
      reviewCount: 0,
      status: "New",
      potential: hasWebsite ? "Medium" : "Very High",
      lastAnalyzedAt: "",
      scores: {
        overall: hasWebsite ? 45 : 0,
        design: hasWebsite ? 40 : 0,
        mobile: hasWebsite ? 40 : 0,
        seo: hasWebsite ? 40 : 0,
        performance: hasWebsite ? 50 : 0,
        conversion: hasWebsite ? 35 : 0,
      },
      problems: hasWebsite
        ? ["Noch kein KI-Audit durchgeführt"]
        : ["Keine eigene Website vorhanden"],
      strengths: ["Manuell im CRM angelegt"],
      aiSummary: `Manuell erfasster ${manualIndustry}-Betrieb in ${manualCity}.`,
      opportunity: hasWebsite
        ? "Website-Audit durchführen."
        : "Neubau einer modernen Website zur Neukundengewinnung.",
      recommendation: "Führe eine KI-Analyse durch oder erstelle ein Mockup.",
      suggestedStructure: [
        "Hero-Bereich",
        "Leistungen & Angebote",
        "Über uns",
        "Kundenstimmen",
        "Kontakt",
      ],
      salesAngle: "Professioneller Webauftritt zur planbaren Kundengewinnung.",
      mockupReady: false,
    };

    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companies: [newCompany], updateExisting: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Speichern fehlgeschlagen");

      await syncFromSupabase();
      setImportSuccess(`„${newCompany.name}“ erfolgreich im CRM angelegt!`);
      setManualName("");
      setManualAddress("");
      setManualWebsite("");
      setManualPhone("");
      setManualEmail("");
    } catch (err) {
      setManualError(err instanceof Error ? err.message : "Fehler beim Anlegen.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="lead-finder-modal-overlay" onClick={onClose}>
      <div className="lead-finder-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="lead-finder-header">
          <div className="lead-finder-title">
            <div className="lead-finder-badge">
              <Globe size={13} />
              OpenStreetMap Geosearch
            </div>
            <h2>Leads finden & anlegen</h2>
            <p>
              Finde echte lokale Unternehmen aus OpenStreetMap weltweit oder erstelle manuell
              neue Leads.
            </p>
          </div>
          <button className="lead-finder-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="lead-finder-tabs">
          <button
            className={`lead-finder-tab ${activeTab === "osm" ? "active" : ""}`}
            onClick={() => setActiveTab("osm")}
          >
            <Search size={14} />
            OpenStreetMap Live-Finder
          </button>
          <button
            className={`lead-finder-tab ${activeTab === "manual" ? "active" : ""}`}
            onClick={() => setActiveTab("manual")}
          >
            <Plus size={14} />
            Manuell anlegen
          </button>
        </div>

        {/* Modal Body */}
        <div className="lead-finder-body">
          {activeTab === "osm" ? (
            <div className="finder-osm-section">
              {/* Filter Controls */}
              <div className="finder-controls-grid">
                <div className="finder-field">
                  <label className="field-label">Stadt / Region (Weltweit)</label>
                  <input
                    type="text"
                    className="control"
                    placeholder="z. B. Köln, Berlin, London, Miami..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void handleSearch()}
                  />
                  <div className="city-chips">
                    {POPULAR_CITIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`city-chip ${city === c ? "active" : ""}`}
                        onClick={() => setCity(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="finder-field">
                  <label className="field-label">Branche</label>
                  <select
                    className="control"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value as IndustryPreset)}
                  >
                    {Object.entries(INDUSTRY_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>
                        {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="finder-field">
                  <label className="field-label">Optional: Spezifischer Suchbegriff</label>
                  <input
                    type="text"
                    className="control"
                    placeholder="z. B. Dachdecker, Pizzeria, Tierarzt..."
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                  />
                </div>

                <div className="finder-field-inline">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={onlyWithoutWebsite}
                      onChange={(e) => setOnlyWithoutWebsite(e.target.checked)}
                    />
                    <span>
                      Nur Betriebe <strong>ohne Website</strong> suchen (High Potential)
                    </span>
                  </label>

                  <div className="limit-selector">
                    <span style={{ fontSize: 13, color: "#667085" }}>Anzahl:</span>
                    <select
                      className="control compact"
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={150}>150</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="finder-action-row">
                <button
                  className="button primary"
                  onClick={() => void handleSearch()}
                  disabled={searching || !city.trim()}
                >
                  {searching ? (
                    <Loader2 size={16} className="spin-icon" />
                  ) : (
                    <Search size={16} />
                  )}
                  {searching ? "Suche auf OpenStreetMap…" : "Leads suchen"}
                </button>
              </div>

              {searchError && <div className="finder-alert error">{searchError}</div>}

              {importSuccess && (
                <div className="finder-alert success">
                  <CheckCircle2 size={16} />
                  <span>{importSuccess}</span>
                </div>
              )}

              {leads.length > 0 && (
                <div className="finder-results-section">
                  <div className="results-header">
                    <div className="results-count">
                      <strong>{leads.length}</strong> Betriebe gefunden (
                      {leads.filter((l) => !l.hasWebsite).length} ohne Website) ·{" "}
                      <strong>{selectedIds.size}</strong> ausgewählt
                    </div>
                    <div className="results-actions">
                      <button
                        type="button"
                        className="button secondary compact"
                        onClick={toggleSelectAll}
                      >
                        {selectedIds.size === leads.length
                          ? "Alle abwählen"
                          : "Alle auswählen"}
                      </button>
                      <button
                        type="button"
                        className="button primary compact"
                        disabled={selectedIds.size === 0 || importing}
                        onClick={handleImportClick}
                      >
                        {importing ? (
                          <Loader2 size={14} className="spin-icon" />
                        ) : (
                          <Plus size={14} />
                        )}
                        {importing
                          ? "Importiere…"
                          : `${selectedIds.size} in CRM importieren`}
                      </button>
                    </div>
                  </div>

                  <div className="results-list">
                    {leads.map((lead) => {
                      const isSelected = selectedIds.has(lead.id);
                      const existing = findExistingMatch(lead, existingCrmCompanies);
                      const diffs = existing ? getLeadDifferences(lead, existing) : [];

                      return (
                        <div
                          key={lead.id}
                          className={`lead-result-card ${isSelected ? "selected" : ""}`}
                          onClick={() => toggleSelect(lead.id)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(lead.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="lead-info">
                            <div className="lead-name-row">
                              <strong>{lead.name}</strong>
                              <span className="badge industry-badge">{lead.industry}</span>

                              {/* CRM Status Badges */}
                              {existing && diffs.length === 0 && (
                                <span
                                  className="badge"
                                  style={{
                                    background: "#f2f4f7",
                                    color: "#475467",
                                    fontSize: "0.72rem",
                                  }}
                                >
                                  ✓ Bereits im CRM
                                </span>
                              )}
                              {existing && diffs.length > 0 && (
                                <span
                                  className="badge"
                                  style={{
                                    background: "#fffaeb",
                                    color: "#b54708",
                                    border: "1px solid #fedf89",
                                    fontSize: "0.72rem",
                                  }}
                                >
                                  🔄 Neue Daten ({diffs.length})
                                </span>
                              )}

                              {lead.hasWebsite ? (
                                <a
                                  href={lead.website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="lead-website-link"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {lead.website?.replace(/^https?:\/\//, "")}{" "}
                                  <ExternalLink size={11} />
                                </a>
                              ) : (
                                <span className="badge no-web-badge">Keine Website</span>
                              )}
                            </div>

                            <div className="lead-meta-row">
                              <span className="lead-meta-item">
                                <MapPin size={12} />
                                {lead.address ? `${lead.address}, ` : ""}
                                {lead.city}
                              </span>
                              {lead.phone && (
                                <span className="lead-meta-item">
                                  <Phone size={12} />
                                  {lead.phone}
                                </span>
                              )}
                              {lead.email && (
                                <span className="lead-meta-item">✉️ {lead.email}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Load More Button */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "14px 0",
                      borderTop: "1px solid #eaecf0",
                      marginTop: 8,
                    }}
                  >
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => void handleLoadMore()}
                      disabled={loadingMore || searching}
                    >
                      {loadingMore ? (
                        <Loader2 size={15} className="spin-icon" />
                      ) : (
                        <Plus size={15} />
                      )}
                      {loadingMore ? "Lade weitere Betriebe…" : "Mehr Betriebe nachladen (+50)"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form className="finder-manual-form" onSubmit={handleManualSubmit}>
              <div className="manual-grid">
                <div className="manual-field">
                  <label className="field-label">Unternehmensname *</label>
                  <input
                    type="text"
                    className="control"
                    placeholder="z. B. Malermeister Weber GmbH"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    required
                  />
                </div>

                <div className="manual-field">
                  <label className="field-label">Branche</label>
                  <input
                    type="text"
                    className="control"
                    placeholder="z. B. Handwerk, Zahnarzt, Restaurant"
                    value={manualIndustry}
                    onChange={(e) => setManualIndustry(e.target.value)}
                  />
                </div>

                <div className="manual-field">
                  <label className="field-label">Stadt / Ort *</label>
                  <input
                    type="text"
                    className="control"
                    placeholder="z. B. Köln"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    required
                  />
                </div>

                <div className="manual-field">
                  <label className="field-label">Adresse (Straße & Hausnummer)</label>
                  <input
                    type="text"
                    className="control"
                    placeholder="z. B. Hauptstraße 12"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                  />
                </div>

                <div className="manual-field">
                  <label className="field-label">Website (optional)</label>
                  <input
                    type="text"
                    className="control"
                    placeholder="https://example.com"
                    value={manualWebsite}
                    onChange={(e) => setManualWebsite(e.target.value)}
                  />
                </div>

                <div className="manual-field">
                  <label className="field-label">Telefonnummer</label>
                  <input
                    type="text"
                    className="control"
                    placeholder="+49 221 123456"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                  />
                </div>

                <div className="manual-field span-2">
                  <label className="field-label">E-Mail</label>
                  <input
                    type="email"
                    className="control"
                    placeholder="kontakt@unternehmen.de"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                  />
                </div>
              </div>

              {manualError && <div className="finder-alert error">{manualError}</div>}

              {importSuccess && (
                <div className="finder-alert success">
                  <CheckCircle2 size={16} />
                  <span>{importSuccess}</span>
                </div>
              )}

              <div className="finder-action-row">
                <button type="submit" className="button primary" disabled={importing}>
                  {importing ? (
                    <Loader2 size={16} className="spin-icon" />
                  ) : (
                    <Plus size={16} />
                  )}
                  {importing ? "Speichere…" : "Lead im CRM anlegen"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="lead-finder-footer">
          <button className="button secondary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>

      {/* Confirmation & Difference Dialog */}
      {confirmModal && confirmModal.isOpen && (
        <div
          className="lead-finder-modal-overlay"
          style={{ zIndex: 1100, background: "rgba(0, 0, 0, 0.65)" }}
          onClick={() => setConfirmModal(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: 520,
              width: "90%",
              background: "#ffffff",
              padding: 24,
              borderRadius: 14,
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: "#fffaeb",
                  color: "#b54708",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RefreshCw size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
                  Bereits vorhandene Leads gefunden
                </h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#667085" }}>
                  Einige ausgewählte Betriebe existieren bereits in deiner Datenbank.
                </p>
              </div>
            </div>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #eaecf0",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: "0.88rem",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div>
                🌱 <strong>{confirmModal.newCount}</strong> neue Betriebe werden angelegt.
              </div>
              <div>
                🏢 <strong>{confirmModal.existingCount}</strong> Betriebe sind bereits im CRM.
              </div>

              {confirmModal.updatedItems.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <span style={{ fontWeight: 600, color: "#b54708" }}>
                    🔄 Abweichende/neue Kontaktdaten gefunden ({confirmModal.updatedItems.length} Betriebe):
                  </span>
                  <div
                    style={{
                      maxHeight: 140,
                      overflowY: "auto",
                      marginTop: 6,
                      fontSize: "0.8rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {confirmModal.updatedItems.map(({ company, diffs }) => (
                      <div
                        key={company.id}
                        style={{
                          background: "#ffffff",
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <strong>{company.name}</strong>
                        <ul style={{ margin: "2px 0 0 16px", padding: 0, color: "#475467" }}>
                          {diffs.map((d) => (
                            <li key={d}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p style={{ margin: 0, fontSize: "0.85rem", color: "#475467" }}>
              Wie möchtest du mit den bereits vorhandenen Betrieben verfahren?
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
              <button
                className="button primary"
                onClick={() => void executeImport(confirmModal.toImport, true)}
              >
                <RefreshCw size={14} />
                Bestehende aktualisieren & Neue anlegen
              </button>
              <button
                className="button secondary"
                onClick={() => void executeImport(confirmModal.toImport, false)}
              >
                <Plus size={14} />
                Nur neue anlegen (Bestehende überspringen)
              </button>
              <button
                className="button secondary"
                onClick={() => setConfirmModal(null)}
                style={{ color: "#667085" }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
