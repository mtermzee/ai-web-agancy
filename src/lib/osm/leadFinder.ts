import "server-only";

import type { Company } from "@/types/company";
import { type IndustryPreset, INDUSTRY_CONFIG } from "@/types/osm";

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
  limit = 50,
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
  const targetFetchCount = Math.max(limit * 2, 80);

  let rawElements: Array<{ id: number | string; tags?: Record<string, string> }> = [];
  let detectedCountry = "Deutschland";

  // 1. Geocode City Coordinates using Photon (ultra-fast <100ms)
  let lat = 0;
  let lon = 0;
  try {
    const geoUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanCity)}&limit=1`;
    const geoRes = await fetch(geoUrl, {
      headers: { "User-Agent": "AgencyOS-LeadFinder/2.0" },
      signal: AbortSignal.timeout(3500),
    });
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      const feat = geoData.features?.[0];
      if (feat?.geometry?.coordinates) {
        [lon, lat] = feat.geometry.coordinates;
        if (feat.properties?.country) {
          detectedCountry = feat.properties.country;
        }
      }
    }
  } catch (err) {
    console.warn("[Photon Geocode Error]", err);
  }

  // 2. Query Photon with Industry Tag and Lat/Lon
  const searchTerm = customQuery?.trim() || config.searchQueries[0] || "Business";
  const photonTag = config.photonTag;

  const photonPromises: Promise<void>[] = [];

  // Query primary term near city coordinates
  if (lat !== 0 && lon !== 0) {
    const tagParam = photonTag ? `&osm_tag=${encodeURIComponent(photonTag)}` : "";
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      searchTerm,
    )}&lat=${lat}&lon=${lon}&limit=${targetFetchCount}${tagParam}`;

    photonPromises.push(
      (async () => {
        try {
          const res = await fetch(photonUrl, {
            headers: { "User-Agent": "AgencyOS-LeadFinder/2.0" },
            signal: AbortSignal.timeout(4500),
          });
          if (res.ok) {
            const data = await res.json();
            for (const f of data.features || []) {
              const p = f.properties || {};
              if (!p.name) continue;
              rawElements.push({
                id: p.osm_id || Math.floor(Math.random() * 10000000),
                tags: {
                  name: p.name,
                  "addr:street": p.street || "",
                  "addr:housenumber": p.housenumber || "",
                  "addr:city": p.city || p.district || p.state || cleanCity,
                  "addr:country": p.country || detectedCountry,
                  phone: p.phone || "",
                  website: p.website || "",
                  ...(p.extra || {}),
                },
              });
            }
          }
        } catch (e) {
          console.warn("[Photon Search Error]", e);
        }
      })(),
    );

    // Also query secondary term if available
    if (config.searchQueries[1] && !customQuery) {
      const secondTerm = config.searchQueries[1];
      const secondUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
        secondTerm,
      )}&lat=${lat}&lon=${lon}&limit=${targetFetchCount}${tagParam}`;
      photonPromises.push(
        (async () => {
          try {
            const res = await fetch(secondUrl, {
              headers: { "User-Agent": "AgencyOS-LeadFinder/2.0" },
              signal: AbortSignal.timeout(4500),
            });
            if (res.ok) {
              const data = await res.json();
              for (const f of data.features || []) {
                const p = f.properties || {};
                if (!p.name) continue;
                rawElements.push({
                  id: p.osm_id || Math.floor(Math.random() * 10000000),
                  tags: {
                    name: p.name,
                    "addr:street": p.street || "",
                    "addr:housenumber": p.housenumber || "",
                    "addr:city": p.city || p.district || p.state || cleanCity,
                    "addr:country": p.country || detectedCountry,
                    phone: p.phone || "",
                    website: p.website || "",
                    ...(p.extra || {}),
                  },
                });
              }
            }
          } catch {
            // Ignore secondary error
          }
        })(),
      );
    }
  }

  // 3. Query Nominatim as complementary data source
  const nomQueries = customQuery ? [customQuery] : config.searchQueries.slice(0, 2);
  const nomPromises = nomQueries.map(async (q) => {
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        `${q} in ${cleanCity}`,
      )}&format=json&addressdetails=1&extratags=1&limit=50`;
      const res = await fetch(nomUrl, {
        headers: { "User-Agent": "AgencyOS-LeadFinder/2.0 (contact@agencyos.local)" },
        signal: AbortSignal.timeout(4500),
      });
      if (res.ok) {
        const nomData = await res.json();
        if (Array.isArray(nomData)) {
          for (const item of nomData) {
            rawElements.push({
              id: item.osm_id || Math.floor(Math.random() * 10000000),
              tags: {
                name: item.name || item.display_name?.split(",")[0] || "",
                ...(item.extratags || {}),
                "addr:street": item.address?.road || "",
                "addr:housenumber": item.address?.house_number || "",
                "addr:city":
                  item.address?.city ||
                  item.address?.town ||
                  item.address?.village ||
                  cleanCity,
                "addr:country": item.address?.country || detectedCountry,
              },
            });
          }
        }
      }
    } catch (e) {
      console.warn("[Nominatim Fetch Error]", e);
    }
  });

  await Promise.allSettled([...photonPromises, ...nomPromises]);

  // 4. Parse, Deduplicate and Filter
  const seen = new Set<string>();
  const results: Company[] = [];

  for (const el of rawElements) {
    const company = mapOsmElementToCompany(el, cleanCity, detectedCountry, industryLabel);
    if (!company) continue;

    const dedupKey = `${company.name.toLowerCase().trim()}_${company.address.toLowerCase().trim()}`;
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
