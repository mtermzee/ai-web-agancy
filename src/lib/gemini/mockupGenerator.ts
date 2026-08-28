import "server-only";

import { GoogleGenAI } from "@google/genai";
import { generateDefaultMockupContent, getIndustryPreset } from "@/lib/mockups/mockupAssets";
import type { Company } from "@/types/company";
import type { MockupContent, MockupTheme } from "@/types/mockup";

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
    heroKicker: { type: "STRING" },
    heroTitle: { type: "STRING" },
    heroDescription: { type: "STRING" },
    heroCta: { type: "STRING" },
    heroSecondaryCta: { type: "STRING" },
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
    ctaTitle: { type: "STRING" },
    ctaText: { type: "STRING" },
    ctaButton: { type: "STRING" },
  },
  required: [
    "heroKicker",
    "heroTitle",
    "heroDescription",
    "heroCta",
    "heroSecondaryCta",
    "servicesTitle",
    "servicesSubtitle",
    "services",
    "aboutTitle",
    "aboutText",
    "aboutPoints",
    "testimonialsTitle",
    "testimonials",
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

export async function generateMockupWithGemini(company: Company): Promise<MockupContent> {
  const apiKey = getApiKey();
  const fallback = generateDefaultMockupContent(company);
  const preset = getIndustryPreset(company.industry, company.city);

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY ist nicht auf dem Server konfiguriert.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";

  const prompt = `Du bist ein hochbezahlter Senior Conversion-Copywriter für lokale Premium-Websites.
Erstelle für das folgende lokale Unternehmen ein verkaufsstarkes, individuelles und vertrauenerweckendes Website-Konzept auf Deutsch (oder in der jeweiligen Landessprache des Unternehmens).

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
1. "heroKicker": Kurze prägnante Orts-/Branchen-Zeile (z. B. "Meisterbetrieb für Köln & Umgebung").
2. "heroTitle": Knackige, emotionale und nutzenorientierte Haupt-Headline (max. 12 Wörter).
3. "heroDescription": Überzeugender 2-Satz-Vorteilstext, der das Kernproblem der Kunden löst.
4. "heroCta": Klarer, handlungsorientierter Call-to-Action-Button (z. B. "Jetzt 24/7 Termin sichern" oder "Kostenloses Angebot anfragen").
5. "heroSecondaryCta": Sekundärer Button (z. B. "Leistungen ansehen").
6. "servicesTitle": Titel der Leistungssektion.
7. "servicesSubtitle": Kurze Unterzeile.
8. "services": Genau 3 Kernleistungen, jeweils mit { "title": string, "description": string, "tag": string }.
9. "aboutTitle": Titel des Über-uns-Bereichs mit regionalem Bezug.
10. "aboutText": 2 prägnante Absätze über Qualität, Erfahrung und Kundennähe.
11. "aboutPoints": Genau 3 vertrauensbildende Bulletpoints (z. B. "Transparente Festpreise", "Meisterqualität").
12. "testimonialsTitle": Titel der Bewertungs-Sektion.
13. "testimonials": Genau 2 realistische, begeisterte Kundenstimmen mit { "quote": string, "author": string, "role": string, "rating": 5 }.
14. "ctaTitle": Dringlicher Abschluss-Call-to-Action.
15. "ctaText": Kurzer Schlusssatz zur Handlungsaufforderung.
16. "ctaButton": Abschluss-Button-Text.

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
    theme: preset.defaultTheme,
    heroKicker: parsed.heroKicker || fallback.heroKicker,
    heroTitle: parsed.heroTitle || fallback.heroTitle,
    heroDescription: parsed.heroDescription || fallback.heroDescription,
    heroCta: parsed.heroCta || fallback.heroCta,
    heroSecondaryCta: parsed.heroSecondaryCta || fallback.heroSecondaryCta,
    heroImage: preset.heroImage,
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
    ctaTitle: parsed.ctaTitle || fallback.ctaTitle,
    ctaText: parsed.ctaText || fallback.ctaText,
    ctaButton: parsed.ctaButton || fallback.ctaButton,
  };
}
