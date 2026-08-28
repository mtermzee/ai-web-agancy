"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  Laptop,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Share2,
  Smartphone,
  Sparkles,
  Star,
  Tablet,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import {
  generateDefaultMockupContent,
  STYLE_CONFIG,
  THEME_CONFIG,
} from "@/lib/mockups/mockupAssets";
import type { Company } from "@/types/company";
import type { MockupContent, MockupTheme } from "@/types/mockup";

type DeviceMode = "desktop" | "tablet" | "mobile";

export function ClientPitchView({ company }: { company: Company }) {
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [content, setContent] = useState<MockupContent>(() =>
    generateDefaultMockupContent(company),
  );
  const [theme, setTheme] = useState<MockupTheme>("clean-blue");
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [copied, setCopied] = useState(false);

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Booking / Order Modal state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: "",
    email: company.email || "",
    phone: company.phone || "",
    message: "Hallo, ich habe mir den Website-Entwurf angesehen und möchte gerne die Details zur Umsetzung besprechen.",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(`agencyos-mockup-${company.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as MockupContent;
          setContent(parsed);
          if (parsed.theme) setTheme(parsed.theme);
          return;
        } catch {}
      }
    }
    const def = generateDefaultMockupContent(company);
    setContent(def);
    setTheme(def.theme);
  }, [company.id]);

  const currentTheme = THEME_CONFIG[theme] || THEME_CONFIG["clean-blue"];

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
  };

  return (
    <div className="client-pitch-page-wrapper">
      {/* Top Client Pitch Bar */}
      <div className="client-pitch-topbar">
        <div className="client-pitch-agency-brand">
          <div className="pitch-agency-badge">
            <Sparkles size={14} color="#0284c7" />
            <span>Exklusives Website-Konzept</span>
          </div>
          <div className="pitch-client-title">
            <strong>{company.name}</strong>
            <span>{company.city || "Ihre Region"} · {company.industry || "Dienstleistungen"}</span>
          </div>
        </div>

        {/* Responsive Device Switcher */}
        <div className="client-pitch-device-group">
          <button
            className={`device-btn ${device === "desktop" ? "active" : ""}`}
            onClick={() => setDevice("desktop")}
            title="Desktop Ansicht"
          >
            <Laptop size={15} />
            <span className="hide-on-mobile">Desktop</span>
          </button>
          <button
            className={`device-btn ${device === "tablet" ? "active" : ""}`}
            onClick={() => setDevice("tablet")}
            title="Tablet Ansicht"
          >
            <Tablet size={15} />
            <span className="hide-on-mobile">Tablet</span>
          </button>
          <button
            className={`device-btn ${device === "mobile" ? "active" : ""}`}
            onClick={() => setDevice("mobile")}
            title="Smartphone Ansicht"
          >
            <Smartphone size={15} />
            <span className="hide-on-mobile">Smartphone</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="client-pitch-actions">
          <button
            className={`button secondary compact ${showBeforeAfter ? "active-pill" : ""}`}
            onClick={() => setShowBeforeAfter(!showBeforeAfter)}
          >
            <TrendingUp size={14} />
            <span>Vorher / Nachher</span>
          </button>

          <button className="button secondary compact icon-only" onClick={handleCopyLink} title="Link kopieren">
            <Share2 size={14} />
          </button>

          <button
            className="button primary compact pulse-cta"
            onClick={() => setIsOrderModalOpen(true)}
          >
            <Zap size={14} />
            <span>Dieses Konzept umsetzen</span>
          </button>
        </div>
      </div>

      {copied && (
        <div className="floating-toast">
          ✓ Präsentations-Link in die Zwischenablage kopiert!
        </div>
      )}

      {/* Optional: Before / After Audit Comparison Banner */}
      {showBeforeAfter && (
        <div className="before-after-banner">
          <div className="before-after-container">
            <div className="before-card">
              <span className="comparison-tag bad">❌ Aktuelle Website-Situation</span>
              <h4>{company.hasWebsite ? `Score: ${company.scores.overall}/100` : "Keine moderne Website vorhanden"}</h4>
              <p>
                {company.hasWebsite
                  ? `Optimierungspotenzial bei Mobil-Darstellung (${company.scores.mobile}/100) und Conversion-Leads (${company.scores.conversion}/100).`
                  : "Aktuell gehen wertvolle Kundenanfragen vor Ort an regionale Wettbewerber verloren."}
              </p>
            </div>
            <div className="after-card">
              <span className="comparison-tag good">✨ Neues AI-Website Konzept</span>
              <h4>Score: 98/100 · Mobil-Optimiert & Lead-Stark</h4>
              <p>
                Maßgeschneiderte Schnellanfrage, vertrauensstiftende Meister-Siegel, interaktive FAQ und blitzschnelle Ladezeit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Pitch Viewport */}
      <div className="client-pitch-stage">
        <div className={`mockup-viewport device-${device}`}>
          <div
            className="mockup-page-canvas"
            style={{
              backgroundColor: currentTheme.bg,
              color: currentTheme.text,
            }}
          >
            {/* 1. Header Navigation */}
            <header
              className="mock-nav-header"
              style={{
                background: currentTheme.cardBg,
                borderColor: currentTheme.border,
                color: currentTheme.text,
              }}
            >
              <div className="mock-nav-container">
                <div className="mock-nav-brand">
                  <div
                    className="mock-brand-icon"
                    style={{ background: currentTheme.primary, color: "#ffffff" }}
                  >
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <span className="mock-brand-name">{company.name}</span>
                    <span className="mock-brand-sub" style={{ color: currentTheme.mutedText }}>
                      {company.industry} · {company.city}
                    </span>
                  </div>
                </div>

                <nav className="mock-nav-links" style={{ color: currentTheme.mutedText }}>
                  <a href="#services" style={{ color: currentTheme.text }}>Leistungen</a>
                  <a href="#process">Ablauf</a>
                  <a href="#about">Über uns</a>
                  <a href="#faq">FAQ</a>
                </nav>

                <div className="mock-nav-cta-col">
                  {company.phone && (
                    <a
                      href={`tel:${company.phone}`}
                      className="mock-nav-phone"
                      style={{ color: currentTheme.primary }}
                    >
                      <Phone size={14} />
                      <span>{company.phone}</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOrderModalOpen(true)}
                    className="mock-nav-btn"
                    style={{
                      background: currentTheme.primary,
                      color: "#ffffff",
                    }}
                  >
                    Termin anfragen
                  </button>
                </div>
              </div>
            </header>

            {/* 2. Hero Section */}
            <section className="mock-hero-section" style={{ borderColor: currentTheme.border }}>
              <div className="mock-hero-container">
                <div className="mock-hero-content">
                  <div
                    className="mock-kicker-badge"
                    style={{
                      background: currentTheme.cardBg,
                      borderColor: currentTheme.primary,
                      color: currentTheme.primary,
                    }}
                  >
                    <span>✦</span>
                    <span>{content.heroKicker}</span>
                  </div>

                  <h1 className="mock-hero-h1">{content.heroTitle}</h1>
                  <p className="mock-hero-p" style={{ color: currentTheme.mutedText }}>
                    {content.heroDescription}
                  </p>

                  <div className="mock-hero-btn-row">
                    <button
                      type="button"
                      onClick={() => setIsOrderModalOpen(true)}
                      className="mock-primary-cta"
                      style={{ background: currentTheme.primary, color: "#ffffff" }}
                    >
                      {content.heroCta} <ChevronRight size={16} />
                    </button>
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

                  <div className="mock-trust-pills" style={{ borderColor: currentTheme.border }}>
                    <div className="trust-pill-item">
                      <Star size={14} color="#f59e0b" fill="#f59e0b" />
                      <span>4.9 / 5.0 Google Bewertung</span>
                    </div>
                    <div className="trust-pill-item">
                      <CheckCircle2 size={14} color={currentTheme.primary} />
                      <span>100% Festpreis-Garantie</span>
                    </div>
                  </div>
                </div>

                <div className="mock-hero-visual">
                  <div className="hero-img-wrapper" style={{ borderColor: currentTheme.border }}>
                    <img src={content.heroImage} alt={company.name} className="hero-img" />
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
                        ★
                      </div>
                      <div>
                        <strong>Meisterhafte Qualität</strong>
                        <span>Vor Ort in {company.city}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Stats Bar */}
            {content.stats && content.stats.length > 0 && (
              <section
                className="mock-stats-bar-section"
                style={{ background: currentTheme.cardBg, borderColor: currentTheme.border }}
              >
                <div className="mock-stats-container">
                  {content.stats.map((st, sIdx) => (
                    <div
                      key={sIdx}
                      className="mock-stat-card"
                      style={{ background: currentTheme.bg, borderColor: currentTheme.border }}
                    >
                      <span className="mock-stat-value" style={{ color: currentTheme.primary }}>
                        {st.value}
                      </span>
                      <span className="mock-stat-label" style={{ color: currentTheme.mutedText }}>
                        {st.label}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Services Grid */}
            <section
              id="services"
              className="mock-services-section"
              style={{ background: currentTheme.bg, borderColor: currentTheme.border }}
            >
              <div className="section-header-centered">
                <span className="section-sub-kicker" style={{ color: currentTheme.primary }}>
                  LEISTUNGEN
                </span>
                <h2>{content.servicesTitle}</h2>
                <p style={{ color: currentTheme.mutedText }}>{content.servicesSubtitle}</p>
              </div>

              <div className="mock-services-grid">
                {content.services.map((srv, idx) => (
                  <div
                    key={idx}
                    className="mock-service-card"
                    style={{ background: currentTheme.cardBg, borderColor: currentTheme.border }}
                  >
                    {srv.image && (
                      <div className="service-card-img-wrap">
                        <img src={srv.image} alt={srv.title} className="service-card-img" />
                        {srv.tag && (
                          <span
                            className="service-tag-badge"
                            style={{ background: currentTheme.primary, color: "#ffffff" }}
                          >
                            {srv.tag}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="service-card-body">
                      <h3>{srv.title}</h3>
                      <p style={{ color: currentTheme.mutedText }}>{srv.description}</p>
                      <button
                        type="button"
                        onClick={() => setIsOrderModalOpen(true)}
                        className="service-cta-link"
                        style={{ color: currentTheme.primary }}
                      >
                        Jetzt unverbindlich anfragen →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. 3-Step Process Flow */}
            {content.processSteps && content.processSteps.length > 0 && (
              <section
                id="process"
                className="mock-process-section"
                style={{ background: currentTheme.cardBg, borderColor: currentTheme.border }}
              >
                <div className="section-header-centered">
                  <span className="section-sub-kicker" style={{ color: currentTheme.primary }}>
                    TRANSPARENTER ABLAUF
                  </span>
                  <h2>{content.processTitle || "In 3 einfachen Schritten"}</h2>
                  <p style={{ color: currentTheme.mutedText }}>{content.processSubtitle}</p>
                </div>

                <div className="mock-process-grid">
                  {content.processSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="mock-process-card"
                      style={{ background: currentTheme.bg, borderColor: currentTheme.border }}
                    >
                      <span className="mock-process-number" style={{ color: currentTheme.primary }}>
                        {step.stepNumber}
                      </span>
                      <h3>{step.title}</h3>
                      <p style={{ color: currentTheme.mutedText }}>{step.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 6. About Section */}
            <section id="about" className="mock-about-section">
              <div className="mock-about-container">
                <div className="mock-about-img-col">
                  <div className="about-img-wrap" style={{ borderColor: currentTheme.border }}>
                    <img src={content.aboutImage} alt="Über uns" className="about-img" />
                  </div>
                </div>

                <div className="mock-about-content-col">
                  <span className="section-sub-kicker" style={{ color: currentTheme.primary }}>
                    ÜBER UNS
                  </span>
                  <h2>{content.aboutTitle}</h2>
                  <p className="mock-about-text" style={{ color: currentTheme.mutedText }}>
                    {content.aboutText}
                  </p>

                  {content.aboutPoints && (
                    <ul className="mock-about-checklist">
                      {content.aboutPoints.map((pt, idx) => (
                        <li key={idx}>
                          <CheckCircle2 size={16} color={currentTheme.primary} />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>

            {/* 7. FAQ Accordion */}
            {content.faqs && content.faqs.length > 0 && (
              <section
                id="faq"
                className="mock-faq-section"
                style={{ background: currentTheme.cardBg, borderColor: currentTheme.border }}
              >
                <div className="section-header-centered">
                  <span className="section-sub-kicker" style={{ color: currentTheme.primary }}>
                    FAQ
                  </span>
                  <h2>{content.faqTitle || "Häufig gestellte Fragen"}</h2>
                  <p style={{ color: currentTheme.mutedText }}>{content.faqSubtitle}</p>
                </div>

                <div className="mock-faq-accordion">
                  {content.faqs.map((faq, fIdx) => {
                    const isOpen = openFaqIndex === fIdx;
                    return (
                      <div
                        key={fIdx}
                        className={`mock-faq-item ${isOpen ? "open" : ""}`}
                        style={{
                          background: currentTheme.bg,
                          borderColor: currentTheme.border,
                        }}
                      >
                        <button
                          type="button"
                          className="mock-faq-question"
                          onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                          style={{ color: currentTheme.text }}
                        >
                          <span>{faq.question}</span>
                          <ChevronDown
                            size={18}
                            color={currentTheme.primary}
                            style={{
                              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                            }}
                          />
                        </button>
                        {isOpen && (
                          <div
                            className="mock-faq-answer"
                            style={{ color: currentTheme.mutedText }}
                          >
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 8. Final CTA */}
            <section
              className="mock-cta-banner"
              style={{ background: currentTheme.primary, color: "#ffffff" }}
            >
              <div className="mock-cta-content">
                <h2>{content.ctaTitle}</h2>
                <p>{content.ctaText}</p>
                <div className="mock-cta-btn-wrap">
                  <button
                    type="button"
                    onClick={() => setIsOrderModalOpen(true)}
                    className="mock-cta-white-btn"
                    style={{ color: currentTheme.primary }}
                  >
                    {content.ctaButton}
                  </button>
                  {company.phone && (
                    <a
                      href={`tel:${company.phone}`}
                      className="mock-cta-phone-btn"
                      style={{ borderColor: "rgba(255,255,255,0.4)" }}
                    >
                      <Phone size={15} />
                      <span>{company.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer
              className="mock-footer"
              style={{
                background: currentTheme.cardBg,
                borderColor: currentTheme.border,
                color: currentTheme.mutedText,
              }}
            >
              <div className="mock-footer-inner">
                <p>© {new Date().getFullYear()} {company.name}. Alle Rechte vorbehalten.</p>
                <div className="mock-footer-links">
                  <a href="#services">Leistungen</a>
                  <a href="#about">Über uns</a>
                  <a href="#faq">FAQ</a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Floating Sticky Client Conversion Banner */}
      <div className="client-pitch-floating-bar">
        <div className="pitch-floating-text">
          <strong>Gefällt Ihnen dieser Entwurf für {company.name}?</strong>
          <span>Wir bringen Ihre schlüsselfertige neue Website in nur 7 Tagen live online.</span>
        </div>
        <div className="pitch-floating-actions">
          {company.phone && (
            <a href={`tel:${company.phone}`} className="button secondary compact">
              <Phone size={14} />
              <span>Rückruf anfordern</span>
            </a>
          )}
          <button
            className="button primary compact pulse-cta"
            onClick={() => setIsOrderModalOpen(true)}
          >
            <Zap size={14} />
            <span>Jetzt Angebot sichern</span>
          </button>
        </div>
      </div>

      {/* Pitch Order Modal */}
      {isOrderModalOpen && (
        <div className="mock-modal-backdrop" onClick={() => setIsOrderModalOpen(false)}>
          <div className="mock-booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mock-modal-header">
              <div>
                <h3>🚀 Neues Website-Konzept umsetzen</h3>
                <p>Besprechen Sie die schlüsselfertige Umsetzung direkt mit unserer Agentur.</p>
              </div>
              <button className="mock-close-btn" onClick={() => setIsOrderModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {orderSuccess ? (
              <div className="mock-modal-success">
                <div className="mock-success-circle">✓</div>
                <h4>Anfrage erfolgreich übermittelt!</h4>
                <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
                  Vielen Dank, {orderForm.name || "Herr/Frau Kunde"}. Unser Webdesign-Team wird sich
                  innerhalb von 24 Stunden persönlich bei Ihnen melden.
                </p>
                <button
                  className="button primary full-width"
                  onClick={() => setIsOrderModalOpen(false)}
                >
                  Fenster schließen
                </button>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="mock-form-group">
                  <label>Ihr Name</label>
                  <input
                    className="mock-input"
                    value={orderForm.name}
                    onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                    placeholder="Max Mustermann"
                    required
                  />
                </div>
                <div className="mock-form-group">
                  <label>E-Mail Adresse</label>
                  <input
                    type="email"
                    className="mock-input"
                    value={orderForm.email}
                    onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                    placeholder="kontakt@ihre-firma.de"
                    required
                  />
                </div>
                <div className="mock-form-group">
                  <label>Telefonnummer für Rückfragen</label>
                  <input
                    className="mock-input"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    placeholder="0170 1234567"
                    required
                  />
                </div>
                <div className="mock-form-group">
                  <label>Ihre Nachricht / Wünsche</label>
                  <textarea
                    className="mock-input"
                    rows={3}
                    value={orderForm.message}
                    onChange={(e) => setOrderForm({ ...orderForm, message: e.target.value })}
                  />
                </div>
                <button type="submit" className="button primary full-width" style={{ marginTop: 6 }}>
                  Unverbindliches Angebot erhalten →
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
