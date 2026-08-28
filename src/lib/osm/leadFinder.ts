import "server-only";

import type { Company } from "@/types/company";
import { type IndustryPreset, INDUSTRY_CONFIG } from "@/types/osm";

const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

function sanitizeWebsite(url?: string): string | undefined {
  if (!url) return undefined;
  let clean = url.trim();
  if (!clean || clean.length < 4) return undefined;
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = `https://${clean}`;
  }
  return clean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function mapOsmElementToCompany(
  el: { id: number | string; tags?: Record<string, string> },
  cityFallback: string,
  countryFallback: string,
  industryLabel: string,
): Company | null {
  const t = el.tags || {};
  const name = (t.name || t["brand"] || t["operator"] || "").trim();
  if (!name || name.length < 2) return null;

  const rawWebsite =
    t.website ||
    t["contact:website"] ||
    t.url ||
    t["contact:url"] ||
    undefined;
  const website = sanitizeWebsite(rawWebsite);
  const hasWebsite = Boolean(website);

  const phone = (
    t.phone ||
    t["contact:phone"] ||
    t["phone:mobile"] ||
    t["contact:mobile"] ||
    ""
  ).trim();
  const email = (t.email || t["contact:email"] || "").trim();

  const street = (t["addr:street"] || "").trim();
  const housenumber = (t["addr:housenumber"] || "").trim();
  const address = street ? `${street} ${housenumber}`.trim() : "";
  const city = (t["addr:city"] || cityFallback).trim();
  const country = (t["addr:country"] || countryFallback || "International")
    .replace(/^DE$/i, "Deutschland")
    .replace(/^AT$/i, "Österreich")
    .replace(/^CH$/i, "Schweiz")
    .replace(/^US$/i, "United States")
    .replace(/^GB$/i, "United Kingdom")
    .replace(/^UK$/i, "United Kingdom")
    .replace(/^FR$/i, "France")
    .replace(/^ES$/i, "Spain")
    .replace(/^IT$/i, "Italy")
    .replace(/^CA$/i, "Canada")
    .replace(/^AU$/i, "Australia")
    .replace(/^AE$/i, "United Arab Emirates");

  const id = `${slugify(name)}-${slugify(city)}-${String(el.id).slice(-6)}`;

  return {
    id,
    name,
    industry: industryLabel,
    address,
    city,
    country,
    phone,
    email,
    website,
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
      : [
          "Keine eigene Website auffindbar",
          "Neukunden finden den Betrieb nur über Brancheneinträge",
          "Keine Möglichkeit zur digitalen Termin- oder Angebotsanfrage",
        ],
    strengths: ["Lokaler Betriebseintrag auf OpenStreetMap"],
    aiSummary: hasWebsite
      ? `Lokaler ${industryLabel}-Betrieb in ${city} (${country}). Website zur KI-Analyse bereit.`
      : `Lokaler ${industryLabel}-Betrieb in ${city} (${country}) ohne eigene Website. Hohes Neukunden-Potenzial für einen professionellen Webauftritt.`,
    opportunity: hasWebsite
      ? "Website-Audit durchführen und Schwachstellen im Design/Mobile aufdecken."
      : "Neubau einer modernen, mobiloptimierten Website mit klarer Kontakt- und Terminführung.",
    recommendation: hasWebsite
      ? "Klicke auf 'Run Gemini analysis' für eine detaillierte Auswertung."
      : "Erstelle ein schnelles Webseiten-Konzept oder Mockup und kontaktiere den Inhaber direkt.",
    suggestedStructure: [
      "Hero-Bereich & Nutzenversprechen",
      "Leistungen & Angebote",
      "Über uns & Team",
      "Kundenstimmen & Vertrauen",
      "Kontakt & Anfahrt",
    ],
    salesAngle: hasWebsite
      ? "Modernisierung und Conversion-Optimierung."
      : "Professioneller Erstauftritt zur planbaren Neukundengewinnung.",
    mockupReady: false,
  };
}

export async function searchOpenStreetMapLeads({
  city,
  industry,
  customQuery,
  onlyWithoutWebsite = false,
  limit = 20,
}: {
  city: string;
  industry: IndustryPreset;
  customQuery?: string;
  onlyWithoutWebsite?: boolean;
  limit?: number;
}): Promise<Company[]> {
  const cleanCity = city.trim();
  if (!cleanCity) return [];

  const config = INDUSTRY_CONFIG[industry] || INDUSTRY_CONFIG.all;
  const industryLabel = customQuery?.trim() || config.defaultCategory;
  const fetchLimit = Math.min(60, limit * 2);

  let rawElements: Array<{ id: number | string; tags?: Record<string, string> }> = [];
  let detectedCountry = "Deutschland";

  // 1. First strategy: Multi-language Nominatim query (worldwide)
  const queries = customQuery
    ? [customQuery]
    : config.searchQueries;

  for (const q of queries.slice(0, 3)) {
    try {
      const searchTerms = `${q} in ${cleanCity}`;
      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        searchTerms,
      )}&format=json&addressdetails=1&extratags=1&limit=${fetchLimit}`;
      
      const nomRes = await fetch(nomUrl, {
        headers: { "User-Agent": "AgencyOS-LeadFinder/1.0 (contact@agencyos.local)" },
        signal: AbortSignal.timeout(4500),
      });

      if (nomRes.ok) {
        const nomData = await nomRes.json();
        if (Array.isArray(nomData) && nomData.length > 0) {
          for (const item of nomData) {
            if (item.address?.country) {
              detectedCountry = item.address.country;
            }
            rawElements.push({
              id: item.osm_id || Math.floor(Math.random() * 1000000),
              tags: {
                name: item.name || item.display_name?.split(",")[0] || "",
                ...(item.extratags || {}),
                "addr:street": item.address?.road || "",
                "addr:housenumber": item.address?.house_number || "",
                "addr:city":
                  item.address?.city ||
                  item.address?.town ||
                  item.address?.village ||
                  item.address?.county ||
                  cleanCity,
                "addr:country": item.address?.country || detectedCountry,
              },
            });
          }
        }
      }
    } catch (nomError) {
      console.warn("[Nominatim Query Error]", nomError);
    }
  }

  // 2. Second strategy: If Nominatim returned fewer than 5, try Overpass bounding box
  if (rawElements.length < 5) {
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        cleanCity,
      )}&format=json&limit=1`;
      const geoRes = await fetch(geoUrl, {
        headers: { "User-Agent": "AgencyOS-LeadFinder/1.0" },
        signal: AbortSignal.timeout(3000),
      });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (Array.isArray(geoData) && geoData.length > 0) {
          if (geoData[0].display_name) {
            detectedCountry = geoData[0].display_name.split(",").slice(-1)[0]?.trim() || detectedCountry;
          }
          const [south, north, west, east] = geoData[0].boundingbox;
          const tagFilters = config.osmTags;
          const nodeQueries = tagFilters
            .map((tag) => `node[${tag}](${south},${west},${north},${east});`)
            .join("\n  ");
          const ql = `[out:json][timeout:10];(${nodeQueries});out center tags ${fetchLimit};`;

          for (const mirror of OVERPASS_MIRRORS) {
            try {
              const opRes = await fetch(
                `${mirror}?data=${encodeURIComponent(ql)}`,
                {
                  headers: { "User-Agent": "AgencyOS-LeadFinder/1.0" },
                  signal: AbortSignal.timeout(5000),
                },
              );
              if (!opRes.ok) continue;
              const opData = await opRes.json();
              if (Array.isArray(opData.elements) && opData.elements.length > 0) {
                rawElements.push(...opData.elements);
                break;
              }
            } catch {
              // Try next mirror
            }
          }
        }
      }
    } catch (overpassErr) {
      console.warn("[Overpass Query Error]", overpassErr);
    }
  }

  // 3. Parse, Filter & Deduplicate
  const seen = new Set<string>();
  const results: Company[] = [];

  for (const el of rawElements) {
    const company = mapOsmElementToCompany(el, cleanCity, detectedCountry, industryLabel);
    if (!company) continue;

    const dedupKey = `${company.name.toLowerCase()}_${company.address.toLowerCase()}`;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);

    if (onlyWithoutWebsite && company.hasWebsite) {
      continue;
    }

    results.push(company);
    if (results.length >= limit) break;
  }

  return results;
}
