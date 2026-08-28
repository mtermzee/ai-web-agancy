import "server-only";

import { GoogleGenAI } from "@google/genai";
import { generateDefaultMockupContent, getIndustryPreset } from "@/lib/mockups/mockupAssets";
import type { Company } from "@/types/company";
import type { MockupContent, MockupStyle, MockupTheme } from "@/types/mockup";

function getApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY
  );
}

export function isGeminiConfiguredForMockup(): boolean {
  return Boolean(getApiKey());
}

const mockupResponseSchema = {
  type: "OBJECT",
  properties: {
    theme: {
      type: "STRING",
      enum: ["clean-blue", "craft-gold", "dark-luxury", "emerald-fresh", "vibrant-orange"],
    },
    heroKicker: { type: "STRING" },
    heroTitle: { type: "STRING" },
    heroDescription: { type: "STRING" },
    heroCta: { type: "STRING" },
    heroSecondaryCta: { type: "STRING" },
    stats: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          value: { type: "STRING" },
          label: { type: "STRING" },
        },
        required: ["value", "label"],
      },
    },
    servicesTitle: { type: "STRING" },
    servicesSubtitle: { type: "STRING" },
    services: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          description: { type: "STRING" },
          tag: { type: "STRING" },
        },
        required: ["title", "description", "tag"],
      },
    },
    processTitle: { type: "STRING" },
    processSubtitle: { type: "STRING" },
    processSteps: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          stepNumber: { type: "STRING" },
          title: { type: "STRING" },
          description: { type: "STRING" },
        },
        required: ["stepNumber", "title", "description"],
      },
    },
    aboutTitle: { type: "STRING" },
    aboutText: { type: "STRING" },
    aboutPoints: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    testimonialsTitle: { type: "STRING" },
    testimonials: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          quote: { type: "STRING" },
          author: { type: "STRING" },
          role: { type: "STRING" },
          rating: { type: "NUMBER" },
        },
        required: ["quote", "author", "role", "rating"],
      },
    },
    faqTitle: { type: "STRING" },
    faqSubtitle: { type: "STRING" },
    faqs: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          answer: { type: "STRING" },
        },
        required: ["question", "answer"],
      },
    },
    ctaTitle: { type: "STRING" },
    ctaText: { type: "STRING" },
    ctaButton: { type: "STRING" },
  },
  required: [
    "theme",
    "heroKicker",
    "heroTitle",
    "heroDescription",
    "heroCta",
    "heroSecondaryCta",
    "stats",
    "servicesTitle",
    "servicesSubtitle",
    "services",
    "processTitle",
    "processSubtitle",
    "processSteps",
    "aboutTitle",
    "aboutText",
    "aboutPoints",
    "testimonialsTitle",
    "testimonials",
    "faqTitle",
    "faqSubtitle",
    "faqs",
    "ctaTitle",
    "ctaText",
    "ctaButton",
  ],
};

function extractJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

export async function generateMockupWithGemini(
  company: Company,
  styleVariant?: MockupStyle,
): Promise<MockupContent> {
  const apiKey = getApiKey();
  const fallback = generateDefaultMockupContent(company);
  const preset = getIndustryPreset(company.industry, company.city);

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY ist nicht auf dem Server konfiguriert.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";

  const styleInstructions =
    styleVariant === "premium"
      ? "GEWÜNSCHTER STIL: Premium & Luxury. Fokus auf Exklusivität, meisterhafte Qualität, anspruchsvolle Ästhetik, diskreten High-End Service. Theme-Empfehlung: 'dark-luxury'."
      : styleVariant === "local-trust"
      ? "GEWÜNSCHTER STIL: Regionaler Meisterbetrieb. Fokus auf Kundennähe, langjährige Tradition, geprüfte Meisterqualität, Verlässlichkeit. Theme-Empfehlung: 'craft-gold'."
      : styleVariant === "modern-tech"
      ? "GEWÜNSCHTER STIL: Modern & Innovativ. Fokus auf smarte digitale Prozesse, zeitsparende Buchung, innovative Methoden, Schnelligkeit. Theme-Empfehlung: 'emerald-fresh'."
      : "GEWÜNSCHTER STIL: Conversion Booster. Fokus auf klare Problemlösung, sofortige Terminanfragen, hohe Dringlichkeit und maximale Lead-Generierung. Theme-Empfehlung: 'clean-blue'.";

  const prompt = `Du bist ein hochbezahlter Senior Conversion-Copywriter für lokale Premium-Websites.
Erstelle für das folgende lokale Unternehmen ein maßgeschneidertes, verkaufsstarkes Website-Konzept auf Deutsch (oder in der jeweiligen Landessprache des Unternehmens).

${styleInstructions}

UNTERNEHMEN:
- Name: ${company.name}
- Branche: ${company.industry}
- Stadt & Region: ${company.city}, ${company.country}
- Adresse: ${company.address}
- Telefon: ${company.phone || "Auf Anfrage"}
- E-Mail: ${company.email || "Auf Anfrage"}
- Bisherige Website: ${company.website || "Keine Website vorhanden"}
- Bisherige Probleme / Chancen: ${company.problems?.join(", ") || "Keine bekannt"}
- KI-Analyse Zusammenfassung: ${company.aiSummary || "Keine"}
- Empfehlung: ${company.recommendation || "Keine"}
- Verkaufsansatz: ${company.salesAngle || "Direkte Neukundengewinnung & Vertrauensaufbau"}

ANFORDERUNGEN:
1. "theme": Wähle das am besten passende Theme ("clean-blue" | "craft-gold" | "dark-luxury" | "emerald-fresh" | "vibrant-orange").
2. "heroKicker": Kurze prägnante Orts-/Branchen-Zeile (z. B. "Meisterbetrieb für Köln & Umgebung").
3. "heroTitle": Knackige, emotionale und nutzenorientierte Haupt-Headline (max. 12 Wörter).
4. "heroDescription": Überzeugender 2-Satz-Vorteilstext, der das Kernproblem der Kunden löst.
5. "heroCta": Handlungsorientierter Haupt-CTA (z. B. "Jetzt 24/7 Termin sichern" oder "Kostenloses Angebot anfragen").
6. "heroSecondaryCta": Sekundärer Button (z. B. "Leistungen ansehen").
7. "stats": Genau 3 bis 4 aussagekräftige Kennzahlen / Trust-Punkte mit { "value": string, "label": string } (z. B. "15+ Jahre" - "Meistererfahrung", "4.9 ★" - "Google Rating", "< 30 Min" - "Schnelle Reaktionszeit").
8. "servicesTitle": Titel der Leistungssektion.
9. "servicesSubtitle": Kurze Unterzeile.
10. "services": Genau 3 Kernleistungen mit { "title": string, "description": string, "tag": string }.
11. "processTitle": Titel der Schritt-für-Schritt Ablaufsektion (z. B. "In 3 einfachen Schritten zum Wunsch-Ergebnis").
12. "processSubtitle": Kurzer Erklärungssatz.
13. "processSteps": Genau 3 klare, nummerierte Ablaufschritte mit { "stepNumber": "01", "title": string, "description": string }.
14. "aboutTitle": Titel des Über-uns-Bereichs mit regionalem Bezug.
15. "aboutText": 2 prägnante Absätze über Qualität, Erfahrung und Kundennähe.
16. "aboutPoints": Genau 3 bis 4 vertrauensbildende Bulletpoints (z. B. "Transparente Festpreise", "Meisterqualität").
17. "testimonialsTitle": Titel der Bewertungs-Sektion.
18. "testimonials": Genau 2 realistische, begeisterte Kundenstimmen mit { "quote": string, "author": string, "role": string, "rating": 5 }.
19. "faqTitle": Titel des FAQ-Bereichs (z. B. "Häufig gestellte Fragen").
20. "faqSubtitle": Unterzeile zur Einordnung.
21. "faqs": Genau 3 überzeugende Einwand-auflösende Fragen & Antworten mit { "question": string, "answer": string }.
22. "ctaTitle": Dringlicher Abschluss-Call-to-Action.
23. "ctaText": Kurzer Schlusssatz zur Handlungsaufforderung.
24. "ctaButton": Abschluss-Button-Text.

Antworte ausschließlich im validen JSON-Format.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: mockupResponseSchema,
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Gemini hat keine Textausgabe für das Mockup zurückgegeben.");
  }

  let parsed: Partial<MockupContent>;
  try {
    const cleanJson = extractJsonString(text);
    parsed = JSON.parse(cleanJson) as Partial<MockupContent>;
  } catch (parseErr) {
    console.error("[Gemini Mockup Generation] JSON parse error:", parseErr, "\nRaw:", text);
    throw new Error("Gemini JSON-Antwort konnte nicht verarbeitet werden.");
  }

  return {
    theme: parsed.theme || preset.defaultTheme,
    styleVariant: styleVariant || "conversion",
    heroKicker: parsed.heroKicker || fallback.heroKicker,
    heroTitle: parsed.heroTitle || fallback.heroTitle,
    heroDescription: parsed.heroDescription || fallback.heroDescription,
    heroCta: parsed.heroCta || fallback.heroCta,
    heroSecondaryCta: parsed.heroSecondaryCta || fallback.heroSecondaryCta,
    heroImage: preset.heroImage,
    stats:
      parsed.stats && parsed.stats.length >= 2
        ? parsed.stats
        : fallback.stats,
    servicesTitle: parsed.servicesTitle || fallback.servicesTitle,
    servicesSubtitle: parsed.servicesSubtitle || fallback.servicesSubtitle,
    services: (parsed.services && parsed.services.length >= 2
      ? parsed.services
      : fallback.services
    ).map((s, idx) => ({
      title: s.title,
      description: s.description,
      tag: s.tag,
      image: preset.serviceImages[idx] || preset.serviceImages[0],
    })),
    processTitle: parsed.processTitle || fallback.processTitle,
    processSubtitle: parsed.processSubtitle || fallback.processSubtitle,
    processSteps:
      parsed.processSteps && parsed.processSteps.length >= 2
        ? parsed.processSteps
        : fallback.processSteps,
    aboutTitle: parsed.aboutTitle || fallback.aboutTitle,
    aboutText: parsed.aboutText || fallback.aboutText,
    aboutImage: preset.aboutImage,
    aboutPoints:
      parsed.aboutPoints && parsed.aboutPoints.length >= 2
        ? parsed.aboutPoints
        : fallback.aboutPoints,
    testimonialsTitle: parsed.testimonialsTitle || fallback.testimonialsTitle,
    testimonials:
      parsed.testimonials && parsed.testimonials.length >= 1
        ? parsed.testimonials.map((t) => ({ ...t, rating: 5 }))
        : fallback.testimonials,
    faqTitle: parsed.faqTitle || fallback.faqTitle,
    faqSubtitle: parsed.faqSubtitle || fallback.faqSubtitle,
    faqs:
      parsed.faqs && parsed.faqs.length >= 2
        ? parsed.faqs
        : fallback.faqs,
    ctaTitle: parsed.ctaTitle || fallback.ctaTitle,
    ctaText: parsed.ctaText || fallback.ctaText,
    ctaButton: parsed.ctaButton || fallback.ctaButton,
  };
}
