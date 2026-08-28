"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Phone,
  Plus,
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

export function LeadFinderModal({ isOpen, onClose }: Props) {
  const { syncFromSupabase } = useCompanyStore();
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
        setSearchError("Keine Einträge für diese Suchkombination gefunden. Versuche eine andere Stadt oder einen breiteren Begriff.");
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

  const handleImport = async () => {
    const toImport = leads.filter((l) => selectedIds.has(l.id));
    if (!toImport.length) return;

    setImporting(true);
    setSearchError(null);

    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companies: toImport }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Import fehlgeschlagen (${res.status})`);
      }

      await syncFromSupabase();
      setImportSuccess(`${toImport.length} Leads erfolgreich ins CRM importiert!`);
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
        : "Neubau einer modernen Website.",
      recommendation: "Mit Gemini analysieren.",
      suggestedStructure: ["Hero", "Leistungen", "Über uns", "Kontakt"],
      salesAngle: "Professioneller Webauftritt.",
      mockupReady: false,
    };

    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companies: [newCompany] }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Speichern fehlgeschlagen (${res.status})`);
      }

      await syncFromSupabase();
      onClose();
    } catch (err) {
      setManualError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content lead-finder-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="eyebrow">Lead Generator</div>
            <h2>Unternehmen hinzufügen</h2>
          </div>
          <button className="icon-button close-btn" onClick={onClose} aria-label="Schließen">
            <X size={18} />
          </button>
        </div>

        <div className="finder-tabs">
          <button
            className={`tab-button ${activeTab === "osm" ? "active" : ""}`}
            onClick={() => setActiveTab("osm")}
          >
            <Globe size={16} />
            OpenStreetMap Lead Finder (Open Source)
          </button>
          <button
            className={`tab-button ${activeTab === "manual" ? "active" : ""}`}
            onClick={() => setActiveTab("manual")}
          >
            <Plus size={16} />
            Manuell eintragen
          </button>
        </div>

        {activeTab === "osm" ? (
          <div className="finder-body">
            <div className="finder-form-grid">
              <div className="finder-field">
                <label className="field-label">Stadt / Region</label>
                <div className="field-input-wrap">
                  <MapPin size={16} className="field-icon" />
                  <input
                    type="text"
                    className="control"
                    placeholder="z. B. Köln, Berlin, München..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void handleSearch()}
                  />
                </div>
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
                  <span>Nur Betriebe <strong>ohne Website</strong> suchen (High Potential)</span>
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

            {searchError && (
              <div className="finder-alert error">{searchError}</div>
            )}

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
                      onClick={() => void handleImport()}
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
                            <span className="badge industry-badge">
                              {lead.industry}
                            </span>
                            {lead.hasWebsite ? (
                              <a
                                href={lead.website}
                                target="_blank"
                                rel="noreferrer"
                                className="badge green website-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Website <ExternalLink size={11} />
                              </a>
                            ) : (
                              <span className="badge red">Keine Website</span>
                            )}
                          </div>
                          <div className="lead-meta-row">
                            {lead.address && (
                              <span>
                                <MapPin size={12} /> {lead.address}, {lead.city}
                              </span>
                            )}
                            {lead.phone && (
                              <span>
                                <Phone size={12} /> {lead.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
                  <button
                    type="button"
                    className="button secondary compact"
                    onClick={() => void handleLoadMore()}
                    disabled={loadingMore}
                  >
                    {loadingMore ? <Loader2 size={14} className="spin-icon" /> : <Plus size={14} />}
                    {loadingMore ? "Lade weitere Betriebe…" : "Mehr Betriebe nachladen (+50)"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form className="finder-body manual-form" onSubmit={handleManualSubmit}>
            <div className="manual-grid">
              <div className="finder-field">
                <label className="field-label">Firmenname *</label>
                <input
                  type="text"
                  required
                  className="control"
                  placeholder="z. B. Praxis Dr. Müller"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                />
              </div>

              <div className="finder-field">
                <label className="field-label">Branche</label>
                <input
                  type="text"
                  className="control"
                  placeholder="z. B. Zahnarzt, Physiotherapie..."
                  value={manualIndustry}
                  onChange={(e) => setManualIndustry(e.target.value)}
                />
              </div>

              <div className="finder-field">
                <label className="field-label">Stadt *</label>
                <input
                  type="text"
                  required
                  className="control"
                  placeholder="z. B. München"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                />
              </div>

              <div className="finder-field">
                <label className="field-label">Adresse (Straße & Nr.)</label>
                <input
                  type="text"
                  className="control"
                  placeholder="z. B. Leopoldstraße 45"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                />
              </div>

              <div className="finder-field">
                <label className="field-label">Website (optional)</label>
                <input
                  type="text"
                  className="control"
                  placeholder="https://..."
                  value={manualWebsite}
                  onChange={(e) => setManualWebsite(e.target.value)}
                />
              </div>

              <div className="finder-field">
                <label className="field-label">Telefon</label>
                <input
                  type="text"
                  className="control"
                  placeholder="+49 ..."
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                />
              </div>

              <div className="finder-field">
                <label className="field-label">E-Mail</label>
                <input
                  type="email"
                  className="control"
                  placeholder="kontakt@..."
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                />
              </div>
            </div>

            {manualError && (
              <div className="finder-alert error">{manualError}</div>
            )}

            <div className="finder-action-row modal-footer">
              <button
                type="button"
                className="button secondary"
                onClick={onClose}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="button primary"
                disabled={importing || !manualName.trim() || !manualCity.trim()}
              >
                {importing ? <Loader2 size={15} className="spin-icon" /> : <Plus size={15} />}
                {importing ? "Speichern…" : "Unternehmen anlegen"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
