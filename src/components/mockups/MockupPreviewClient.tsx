"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Laptop,
  Loader2,
  MapPin,
  Maximize2,
  MessageSquare,
  Palette,
  Pencil,
  Phone,
  RotateCcw,
  Save,
  Share2,
  Smartphone,
  Sparkles,
  Star,
  Tablet,
  X,
} from "lucide-react";
import { useCompanyStore } from "@/components/providers/CompanyStoreProvider";
import {
  generateDefaultMockupContent,
  THEME_CONFIG,
} from "@/lib/mockups/mockupAssets";
import type { Company } from "@/types/company";
import type { MockupContent, MockupTheme } from "@/types/mockup";

type DeviceMode = "desktop" | "tablet" | "mobile";

export function MockupPreviewClient({ initialCompany }: { initialCompany: Company }) {
  const { getCompany, markMockupReady } = useCompanyStore();
  const company = getCompany(initialCompany.id) ?? initialCompany;

  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [theme, setTheme] = useState<MockupTheme>("clean-blue");
  const [content, setContent] = useState<MockupContent>(() =>
    generateDefaultMockupContent(company),
  );
  const [generating, setGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize theme and content from localStorage or default preset
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(`agencyos-mockup-${company.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as MockupContent;
          setContent(parsed);
          if (parsed.theme) setTheme(parsed.theme);
          return;
        } catch {
          // fallback
        }
      }
    }
    const defaultContent = generateDefaultMockupContent(company);
    setContent(defaultContent);
    setTheme(defaultContent.theme);
  }, [company.id]);

  // Save changes to localStorage
  const updateAndSaveContent = (next: MockupContent) => {
    setContent(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`agencyos-mockup-${company.id}`, JSON.stringify(next));
    }
  };

  const currentTheme = THEME_CONFIG[theme] || THEME_CONFIG["clean-blue"];

  const handleGenerateAI = async () => {
    if (generating) return;
    setGenerating(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    try {
      const res = await fetch("/api/ai/generate-mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, companyId: company.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok || !data.mockupContent) {
        throw new Error(data.error || `KI-Generierung fehlgeschlagen (${res.status})`);
      }

      updateAndSaveContent(data.mockupContent);
      if (data.mockupContent.theme) {
        setTheme(data.mockupContent.theme);
      }
      markMockupReady(company.id);
      setFeedbackMessage("KI-Konzept erfolgreich neu generiert!");
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "KI-Generierung fehlgeschlagen";
      setErrorMessage(msg);
      console.error("AI generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyPitchLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className={`mockup-studio-page ${isFullscreen ? "fullscreen-mode" : ""}`}>
      {/* Studio Header Bar */}
      <div className="studio-topbar">
        <div className="topbar-left">
          <Link href={`/companies/${company.id}`} className="button secondary compact">
            <ArrowLeft size={14} /> Zurück zu {company.name}
          </Link>
          <div className="company-badge-info">
            <span className="studio-company-name">{company.name}</span>
            <span className="studio-company-city">
              {company.industry} · {company.city}
            </span>
          </div>
        </div>

        {/* Center: Device Switcher */}
        <div className="device-switcher-pill">
          <button
            className={`device-btn ${device === "desktop" ? "active" : ""}`}
            onClick={() => setDevice("desktop")}
            title="Desktop Ansicht (100%)"
          >
            <Laptop size={15} />
            <span>Desktop</span>
          </button>
          <button
            className={`device-btn ${device === "tablet" ? "active" : ""}`}
            onClick={() => setDevice("tablet")}
            title="Tablet Ansicht (768px)"
          >
            <Tablet size={15} />
            <span>Tablet</span>
          </button>
          <button
            className={`device-btn ${device === "mobile" ? "active" : ""}`}
            onClick={() => setDevice("mobile")}
            title="Smartphone Ansicht (390px)"
          >
            <Smartphone size={15} />
            <span>Mobile</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="topbar-right">
          <button
            className="button secondary compact"
            onClick={handleCopyPitchLink}
            title="Teilbaren Pitch-Link kopieren"
          >
            <Share2 size={14} />
            <span>{copiedLink ? "Link kopiert! ✓" : "Pitch-Link"}</span>
          </button>

          <button
            className="button primary compact"
            onClick={() => void handleGenerateAI()}
            disabled={generating}
          >
            {generating ? (
              <Loader2 size={14} className="spin-icon" />
            ) : (
              <Sparkles size={14} />
            )}
            <span>{generating ? "KI generiert…" : "Mit KI neu generieren"}</span>
          </button>

          <button
            className="button secondary compact icon-only"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Vollbild beenden" : "Vollbild"}
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Theme Bar & Customization Row */}
      <div className="studio-control-strip">
        <div className="theme-selector-group">
          <span className="control-strip-label">
            <Palette size={13} /> Design Theme:
          </span>
          {(Object.keys(THEME_CONFIG) as MockupTheme[]).map((tKey) => {
            const t = THEME_CONFIG[tKey];
            return (
              <button
                key={tKey}
                className={`theme-chip ${theme === tKey ? "active" : ""}`}
                onClick={() => setTheme(tKey)}
                style={{
                  borderColor: theme === tKey ? t.primary : "#e2e8f0",
                }}
              >
                <span
                  className="theme-color-dot"
                  style={{ background: t.primary }}
                />
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>

        <div className="edit-mode-toggle">
          <button
            className={`button secondary compact ${isEditing ? "active-edit" : ""}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Pencil size={13} />
            <span>{isEditing ? "Bearbeitung beenden" : "Texte live bearbeiten"}</span>
          </button>
        </div>
      </div>

      {/* Feedback & Error Banners */}
      {(feedbackMessage || errorMessage) && (
        <div
          style={{
            padding: "8px 24px",
            background: feedbackMessage ? "#f0fdf4" : "#fef2f2",
            borderBottom: `1px solid ${feedbackMessage ? "#bbf7d0" : "#fecaca"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "13px",
          }}
        >
          <span style={{ color: feedbackMessage ? "#166534" : "#991b1b", fontWeight: 600 }}>
            {feedbackMessage ? `✨ ${feedbackMessage}` : `⚠️ ${errorMessage}`}
          </span>
          <button
            onClick={() => {
              setFeedbackMessage(null);
              setErrorMessage(null);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: feedbackMessage ? "#166534" : "#991b1b",
              fontSize: "16px",
              padding: "0 4px",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Studio Frame Container */}
      <div className="studio-canvas-container">
        <div
          className={`mockup-viewport-frame device-${device}`}
          style={
            {
              "--theme-primary": currentTheme.primary,
              "--theme-accent": currentTheme.accent,
              "--theme-bg": currentTheme.bg,
              "--theme-card-bg": currentTheme.cardBg,
              "--theme-text": currentTheme.text,
              "--theme-muted": currentTheme.mutedText,
              "--theme-border": currentTheme.border,
            } as React.CSSProperties
          }
        >
          {/* Simulated Browser Bar */}
          <div className="mockup-browser-chrome">
            <div className="chrome-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <div className="chrome-url-bar">
              🔒 https://www.{company.name.toLowerCase().replace(/[^a-z0-9]/g, "")}-{company.city.toLowerCase()}.de
            </div>
            <div className="chrome-actions">
              <span className="preview-pill">Live Vorschau</span>
            </div>
          </div>

          {/* Generated Website Body */}
          <div
            className="mock-website-root"
            style={{ background: currentTheme.bg, color: currentTheme.text }}
          >
            {/* 1. Header / Navbar */}
            <header
              className="mock-site-nav"
              style={{
                background: currentTheme.cardBg,
                borderColor: currentTheme.border,
              }}
            >
              <div className="mock-nav-container">
                <div className="mock-nav-logo">
                  <div
                    className="mock-logo-icon"
                    style={{ background: currentTheme.primary }}
                  >
                    {company.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="mock-logo-text">{company.name}</span>
                </div>

                {device !== "mobile" && (
                  <nav className="mock-nav-links">
                    <a href="#services" style={{ color: currentTheme.text }}>
                      Leistungen
                    </a>
                    <a href="#about" style={{ color: currentTheme.text }}>
                      Über uns
                    </a>
                    <a href="#reviews" style={{ color: currentTheme.text }}>
                      Bewertungen
                    </a>
                    <a href="#contact" style={{ color: currentTheme.text }}>
                      Kontakt
                    </a>
                  </nav>
                )}

                <a
                  href="#contact"
                  className="mock-cta-btn"
                  style={{
                    background: currentTheme.primary,
                    color: "#ffffff",
                  }}
                >
                  {content.heroCta}
                </a>
              </div>
            </header>

            {/* 2. Hero Section */}
            <section className="mock-hero-section">
              <div className="mock-hero-container">
                <div className="mock-hero-content">
                  <div
                    className="mock-kicker-pill"
                    style={{
                      background: `${currentTheme.primary}18`,
                      color: currentTheme.primary,
                      border: `1px solid ${currentTheme.primary}35`,
                    }}
                  >
                    <span
                      className="kicker-pulse"
                      style={{ background: currentTheme.primary }}
                    />
                    {isEditing ? (
                      <input
                        className="inline-input"
                        value={content.heroKicker}
                        onChange={(e) =>
                          setContent({ ...content, heroKicker: e.target.value })
                        }
                      />
                    ) : (
                      content.heroKicker
                    )}
                  </div>

                  <h1 className="mock-hero-h1">
                    {isEditing ? (
                      <textarea
                        className="inline-textarea"
                        value={content.heroTitle}
                        onChange={(e) =>
                          setContent({ ...content, heroTitle: e.target.value })
                        }
                      />
                    ) : (
                      content.heroTitle
                    )}
                  </h1>

                  <p
                    className="mock-hero-p"
                    style={{ color: currentTheme.mutedText }}
                  >
                    {isEditing ? (
                      <textarea
                        className="inline-textarea"
                        value={content.heroDescription}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            heroDescription: e.target.value,
                          })
                        }
                      />
                    ) : (
                      content.heroDescription
                    )}
                  </p>

                  <div className="mock-hero-btn-row">
                    <a
                      href="#contact"
                      className="mock-primary-cta"
                      style={{
                        background: currentTheme.primary,
                        color: "#ffffff",
                      }}
                    >
                      {content.heroCta} <ChevronRight size={16} />
                    </a>
                    <a
                      href="#services"
                      className="mock-secondary-cta"
                      style={{
                        borderColor: currentTheme.border,
                        color: currentTheme.text,
                        background: currentTheme.cardBg,
                      }}
                    >
                      {content.heroSecondaryCta}
                    </a>
                  </div>

                  {/* Trust Micro-Row */}
                  <div className="mock-hero-trust-bar">
                    <div className="trust-item">
                      <div className="stars-row">
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      </div>
                      <span>
                        <strong>4.9 / 5</strong> aus 50+ Kundenstimmen
                      </span>
                    </div>
                    <div className="trust-item">
                      <CheckCircle2 size={14} color={currentTheme.primary} />
                      <span>Geprüfter Meister- & Fachbetrieb</span>
                    </div>
                  </div>
                </div>

                {/* Hero Visual Card */}
                <div className="mock-hero-visual">
                  <div
                    className="hero-img-wrapper"
                    style={{ borderColor: currentTheme.border }}
                  >
                    <img
                      src={content.heroImage}
                      alt={company.name}
                      className="hero-img"
                    />
                    <div
                      className="floating-glass-card"
                      style={{
                        background: `${currentTheme.cardBg}eb`,
                        borderColor: currentTheme.border,
                      }}
                    >
                      <div
                        className="floating-icon"
                        style={{ background: currentTheme.primary, color: "#ffffff" }}
                      >
                        ✓
                      </div>
                      <div>
                        <strong>24/7 Sofort-Anfrage</strong>
                        <span>Terminbestätigung in unter 60 Sek.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Services Grid Section */}
            <section
              id="services"
              className="mock-services-section"
              style={{
                background: currentTheme.cardBg,
                borderColor: currentTheme.border,
              }}
            >
              <div className="section-header-centered">
                <span
                  className="section-sub-kicker"
                  style={{ color: currentTheme.primary }}
                >
                  LEISTUNGEN
                </span>
                <h2>{content.servicesTitle}</h2>
                <p style={{ color: currentTheme.mutedText }}>
                  {content.servicesSubtitle}
                </p>
              </div>

              <div className="mock-services-grid">
                {content.services.map((srv, idx) => (
                  <div
                    key={idx}
                    className="mock-service-card"
                    style={{
                      background: currentTheme.bg,
                      borderColor: currentTheme.border,
                    }}
                  >
                    {srv.image && (
                      <div className="service-card-img-wrap">
                        <img
                          src={srv.image}
                          alt={srv.title}
                          className="service-card-img"
                        />
                        {srv.tag && (
                          <span
                            className="service-tag-badge"
                            style={{
                              background: currentTheme.primary,
                              color: "#ffffff",
                            }}
                          >
                            {srv.tag}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="service-card-body">
                      <h3>
                        {isEditing ? (
                          <input
                            className="inline-input"
                            value={srv.title}
                            onChange={(e) => {
                              const next = [...content.services];
                              next[idx].title = e.target.value;
                              setContent({ ...content, services: next });
                            }}
                          />
                        ) : (
                          srv.title
                        )}
                      </h3>
                      <p style={{ color: currentTheme.mutedText }}>
                        {isEditing ? (
                          <textarea
                            className="inline-textarea"
                            value={srv.description}
                            onChange={(e) => {
                              const next = [...content.services];
                              next[idx].description = e.target.value;
                              setContent({ ...content, services: next });
                            }}
                          />
                        ) : (
                          srv.description
                        )}
                      </p>
                      <a
                        href="#contact"
                        className="service-card-link"
                        style={{ color: currentTheme.primary }}
                      >
                        Jetzt anfragen <ChevronRight size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. About Us & Trust Section */}
            <section id="about" className="mock-about-section">
              <div className="mock-about-container">
                <div className="mock-about-img-col">
                  <div
                    className="about-img-wrap"
                    style={{ borderColor: currentTheme.border }}
                  >
                    <img
                      src={content.aboutImage}
                      alt="Über uns"
                      className="about-img"
                    />
                  </div>
                </div>

                <div className="mock-about-content-col">
                  <span
                    className="section-sub-kicker"
                    style={{ color: currentTheme.primary }}
                  >
                    ÜBER UNS
                  </span>
                  <h2>
                    {isEditing ? (
                      <input
                        className="inline-input"
                        value={content.aboutTitle}
                        onChange={(e) =>
                          setContent({ ...content, aboutTitle: e.target.value })
                        }
                      />
                    ) : (
                      content.aboutTitle
                    )}
                  </h2>

                  <p
                    className="about-p"
                    style={{ color: currentTheme.mutedText }}
                  >
                    {isEditing ? (
                      <textarea
                        className="inline-textarea"
                        value={content.aboutText}
                        onChange={(e) =>
                          setContent({ ...content, aboutText: e.target.value })
                        }
                      />
                    ) : (
                      content.aboutText
                    )}
                  </p>

                  <div className="about-points-list">
                    {content.aboutPoints.map((point, idx) => (
                      <div key={idx} className="about-point-item">
                        <div
                          className="point-icon-box"
                          style={{
                            background: `${currentTheme.primary}20`,
                            color: currentTheme.primary,
                          }}
                        >
                          <CheckCircle2 size={16} />
                        </div>
                        <span>
                          {isEditing ? (
                            <input
                              className="inline-input"
                              value={point}
                              onChange={(e) => {
                                const next = [...content.aboutPoints];
                                next[idx] = e.target.value;
                                setContent({ ...content, aboutPoints: next });
                              }}
                            />
                          ) : (
                            point
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Testimonials & Google Ratings */}
            <section
              id="reviews"
              className="mock-testimonials-section"
              style={{
                background: currentTheme.cardBg,
                borderColor: currentTheme.border,
              }}
            >
              <div className="section-header-centered">
                <span
                  className="section-sub-kicker"
                  style={{ color: currentTheme.primary }}
                >
                  BEWERTUNGEN
                </span>
                <h2>{content.testimonialsTitle}</h2>
                <div className="google-badge-inline">
                  <span>Google Bewertungen</span>
                  <div className="stars-mini">
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                  </div>
                  <strong>5.0 Sterne</strong>
                </div>
              </div>

              <div className="mock-testimonials-grid">
                {content.testimonials.map((test, idx) => (
                  <div
                    key={idx}
                    className="mock-testimonial-card"
                    style={{
                      background: currentTheme.bg,
                      borderColor: currentTheme.border,
                    }}
                  >
                    <div className="stars-row">
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    </div>
                    <p className="test-quote">
                      {isEditing ? (
                        <textarea
                          className="inline-textarea"
                          value={test.quote}
                          onChange={(e) => {
                            const next = [...content.testimonials];
                            next[idx].quote = e.target.value;
                            setContent({ ...content, testimonials: next });
                          }}
                        />
                      ) : (
                        `„${test.quote}“`
                      )}
                    </p>
                    <div className="test-author-row">
                      <div
                        className="author-avatar"
                        style={{
                          background: currentTheme.primary,
                          color: "#ffffff",
                        }}
                      >
                        {test.author.slice(0, 1)}
                      </div>
                      <div>
                        <strong>{test.author}</strong>
                        <span style={{ color: currentTheme.mutedText }}>
                          {test.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. Contact & Direct Booking Banner */}
            <section
              id="contact"
              className="mock-cta-banner-section"
              style={{
                background: currentTheme.primary,
                color: "#ffffff",
              }}
            >
              <div className="cta-banner-content">
                <h2>
                  {isEditing ? (
                    <input
                      className="inline-input white"
                      value={content.ctaTitle}
                      onChange={(e) =>
                        setContent({ ...content, ctaTitle: e.target.value })
                      }
                    />
                  ) : (
                    content.ctaTitle
                  )}
                </h2>
                <p>
                  {isEditing ? (
                    <textarea
                      className="inline-textarea white"
                      value={content.ctaText}
                      onChange={(e) =>
                        setContent({ ...content, ctaText: e.target.value })
                      }
                    />
                  ) : (
                    content.ctaText
                  )}
                </p>

                <div className="cta-banner-action-box">
                  <div className="direct-contact-pills">
                    {company.phone && (
                      <a
                        href={`tel:${company.phone}`}
                        className="contact-pill-white"
                      >
                        <Phone size={15} /> {company.phone}
                      </a>
                    )}
                    <span className="contact-pill-white">
                      <MapPin size={15} /> {company.address || company.city}
                    </span>
                  </div>

                  <button
                    className="banner-cta-button"
                    onClick={() =>
                      alert(
                        `Termin- oder Angebotsanfrage für ${company.name} erfolgreich simuliert!`,
                      )
                    }
                  >
                    {content.ctaButton}
                  </button>
                </div>
              </div>
            </section>

            {/* 7. Footer */}
            <footer
              className="mock-site-footer"
              style={{
                background: currentTheme.cardBg,
                borderColor: currentTheme.border,
              }}
            >
              <div className="footer-top-row">
                <div>
                  <div className="mock-nav-logo">
                    <div
                      className="mock-logo-icon"
                      style={{ background: currentTheme.primary }}
                    >
                      {company.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="mock-logo-text">{company.name}</span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: currentTheme.mutedText,
                      marginTop: 6,
                    }}
                  >
                    {company.address ? `${company.address}, ` : ""}
                    {company.city} ({company.country})
                  </p>
                </div>

                <div className="footer-links-row">
                  <a href="#services" style={{ color: currentTheme.mutedText }}>
                    Leistungen
                  </a>
                  <a href="#about" style={{ color: currentTheme.mutedText }}>
                    Über uns
                  </a>
                  <a href="#contact" style={{ color: currentTheme.mutedText }}>
                    Kontakt
                  </a>
                  <span style={{ color: currentTheme.mutedText }}>Impressum</span>
                  <span style={{ color: currentTheme.mutedText }}>Datenschutz</span>
                </div>
              </div>
              <div
                className="footer-bottom-copy"
                style={{
                  borderColor: currentTheme.border,
                  color: currentTheme.mutedText,
                }}
              >
                © {new Date().getFullYear()} {company.name}. Alle Rechte
                vorbehalten. Konzipiert von AgencyOS.
              </div>
            </footer>
          </div>

          {/* Loading Overlay */}
          {generating && (
            <div className="mockup-generating-overlay">
              <div className="generating-card">
                <Loader2 size={36} className="spin-icon" color="#0284c7" />
                <h3>Gemini KI generiert dein Website-Konzept…</h3>
                <p>
                  Analysiere {company.name} in {company.city}, erstelle
                  branchenspezifische Headlines, Leistungs-Karten und Kunden-Testimonials.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
