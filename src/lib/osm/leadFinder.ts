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

function getIndustryIntelligence(
  industry: string,
  city: string,
  country: string,
  hasWebsite: boolean,
) {
  const norm = industry.toLowerCase();

  if (norm.includes("zahn") || norm.includes("dentist") || norm.includes("kiefer")) {
    return {
      problems: hasWebsite
        ? [
            "Online-Terminbuchung (Doctolib/Jameda) nicht prominent integriert",
            "Leistungsübersicht für Ästhetik & Prophylaxe verbesserungswürdig",
            "Mobile Ladezeit und responsive Navigation optimierbar",
          ]
        : [
            "Keine eigene Praxishomepage auffindbar",
            "Patienten können keine Online-Termine oder Notfallinfos abrufen",
            "Neupatienten finden die Praxis nur über Branchenverzeichnisse",
          ],
      strengths: [
        "Lokaler Praxiseintrag mit verifizierter Adresse",
        "Hohe lokale Nachfrage nach zahnmedizinischen Leistungen",
      ],
      aiSummary: hasWebsite
        ? `Zahnarztpraxis in ${city} (${country}). Website zur KI-Analyse & Optimierung bereit.`
        : `Zahnarztpraxis in ${city} (${country}) ohne eigene Website. Starkes Neukunden-Potenzial für Praxishomepage mit 24/7 Terminbuchung.`,
      opportunity: hasWebsite
        ? "Praxishomepage modernisieren, Online-Terminvergabe einbinden und Vertrauen bei Neupatienten aufbauen."
        : "Neubau einer Premium-Praxishomepage mit digitalem Terminkalender, Team-Vorstellung und Leistungs-Führung.",
      recommendation:
        "Modernen Webauftritt mit Online-Terminbuchung und Patienten-Testimonials vorbereiten.",
      suggestedStructure: [
        "Hero: Schmerzfreie Behandlung & Online-Terminbuchung",
        "Behandlungsspektrum (Prophylaxe, Ästhetik, Implantologie)",
        "Praxisteam & Moderne Ausstattung",
        "Patientenbewertungen & Vertrauenssignale",
        "Kontakt, Öffnungszeiten & Notdienst-Info",
      ],
      salesAngle:
        "Reduzierung von Telefonanrufen am Empfang durch 24/7 Online-Terminvergabe und Gewinnung lukrativer Privatpatienten.",
    };
  }

  if (
    norm.includes("friseur") ||
    norm.includes("hair") ||
    norm.includes("barber") ||
    norm.includes("salon")
  ) {
    return {
      problems: hasWebsite
        ? [
            "Kein direkter digitaler Buchungskalender (Treatwell/Planity-Alternative)",
            "Preisliste und Lookbook nicht mobiloptimiert",
            "Instagram-Kanal nicht direkt im Webauftritt verknüpft",
          ]
        : [
            "Keine eigene Salon-Website vorhanden",
            "Kunden können Öffnungszeiten, Preise und freie Termine nicht online einsehen",
            "Umsatzverlust durch fehlende 24/7 Buchungsmöglichkeit",
          ],
      strengths: [
        "Lokaler Salon mit fester Stammkundschaft",
        "Hohes Potenzial für visuelle Vorher/Nachher-Präsentation",
      ],
      aiSummary: hasWebsite
        ? `Friseursalon/Barbershop in ${city} (${country}). Website zur KI-Analyse bereit.`
        : `Friseur/Barbershop in ${city} (${country}) ohne eigene Webpräsenz. Hohes Potenzial für Buchungs-Landingpage.`,
      opportunity:
        "Stylisches Lookbook mit 24/7 Online-Terminbuchung und automatischer Terminerinnerung.",
      recommendation:
        "Modernes Salon-Mockup mit Vorher/Nachher-Galerie und Buchungs-Funnel erstellen.",
      suggestedStructure: [
        "Hero: Salon-Vibe & Sofort-Termin-Button",
        "Leistungen & Transparente Preisliste",
        "Vorher/Nachher-Lookbook & Instagram-Feed",
        "Stylisten-Team & Salon-Ambiente",
        "Online-Buchung & Anfahrt",
      ],
      salesAngle:
        "Vollere Terminkalender rund um die Uhr und weniger Terminausfälle durch automatische Terminbestätigung.",
    };
  }

  if (
    norm.includes("restaurant") ||
    norm.includes("caf") ||
    norm.includes("pizz") ||
    norm.includes("gastro") ||
    norm.includes("bar")
  ) {
    return {
      problems: hasWebsite
        ? [
            "Speisekarte nur als unleserliches PDF oder Bild hinterlegt",
            "Keine digitale Tischreservierung eingebunden",
            "Öffnungszeiten und Feiertagsregelung nicht eindeutig",
          ]
        : [
            "Keine eigene Restaurant-Website vorhanden",
            "Gäste können Speisekarte und Öffnungszeiten unterwegs nicht mobil prüfen",
            "Abhängigkeit von Lieferando/Google ohne direkte Bestellmöglichkeit",
          ],
      strengths: [
        "Lokale Gastronomie mit festem Standort",
        "Hohe tägliche Nachfrage nach digitaler Speisekarte & Reservierung",
      ],
      aiSummary: hasWebsite
        ? `Gastronomiebetrieb in ${city} (${country}). Website zur KI-Analyse bereit.`
        : `Gastronomiebetrieb in ${city} (${country}) ohne eigene Website. Idealer Lead für mobiloptimierte Speisekarte & Reservierung.`,
      opportunity:
        "Mobil-optimierte digitale Speisekarte mit Online-Tischreservierung und Event-Bereich.",
      recommendation:
        "Appetitanregendes Gastronomie-Mockup mit digitaler Speisekarte und Reservierungs-Widget erstellen.",
      suggestedStructure: [
        "Hero: Atmosphäre, Spezialitäten & Tisch reservieren",
        "Digitale Speise- & Getränkekarte (mobil lesbar)",
        "Galerie & kulinarische Highlights",
        "Events, Feiern & Catering-Anfrage",
        "Öffnungszeiten, Anfahrt & Tischreservierung",
      ],
      salesAngle:
        "Höhere Auslastung unter der Woche und direkte Tischbuchungen ohne Provisionsabgaben an Dritte.",
    };
  }

  if (
    norm.includes("handwerk") ||
    norm.includes("craft") ||
    norm.includes("schrein") ||
    norm.includes("elektro") ||
    norm.includes("bau") ||
    norm.includes("plumb")
  ) {
    return {
      problems: hasWebsite
        ? [
            "Kein digitaler Angebots- oder Projektanfrage-Konfigurator",
            "Referenzprojekte und Meisterbetrieb-Qualität werden nicht visualisiert",
            "Mitarbeiter- und Azubi-Bewerbungsseite fehlt",
          ]
        : [
            "Kein professioneller Webauftritt vorhanden",
            "Interessenten können keine Online-Projektanfragen stellen",
            "Meisterbetrieb-Qualität und Referenzen sind digital unsichtbar",
          ],
      strengths: [
        "Fachbetrieb mit regionalem Einzugsgebiet",
        "Sehr hohe Auftragswert-Spanne bei Neukunden",
      ],
      aiSummary: hasWebsite
        ? `Handwerksbetrieb in ${city} (${country}). Website zur KI-Analyse bereit.`
        : `Handwerksbetrieb in ${city} (${country}) ohne eigene Website. Starkes Potenzial für Neukundengewinnung & Mitarbeiter-Recruiting.`,
      opportunity:
        "Neubau eines 3-Schritte-Projektanfrage-Funnels zur Vorqualifizierung lukrativer Privat- und Gewerbeaufträge.",
      recommendation:
        "Seriöses Handwerker-Mockup mit Referenz-Showcase und Schnell-Anfrageformular erstellen.",
      suggestedStructure: [
        "Hero: Meisterbetrieb, Qualitätsversprechen & Projekt anfragen",
        "Leistungsspektrum & Fachgebiete",
        "Referenzprojekte (Vorher/Nachher)",
        "3-Schritte-Anfrage-Konfigurator",
        "Karriere/Jobs & Kontakt",
      ],
      salesAngle:
        "Vorselektion qualifizierter Kundenaufträge, weniger Zeitverlust durch Büroaufwand und Recruiting von Fachkräften.",
    };
  }

  if (
    norm.includes("auto") ||
    norm.includes("kfz") ||
    norm.includes("mechanic") ||
    norm.includes("repair") ||
    norm.includes("werkstatt")
  ) {
    return {
      problems: hasWebsite
        ? [
            "Keine digitale Werkstatt-Terminvereinbarung für HU/AU und Inspektion",
            "Keine transparente Leistungs- und Festpreisübersicht",
            "Notfall- und Abschlepp-Kontakt nicht mobil hervorgehoben",
          ]
        : [
            "Keine eigene Werkstatt-Website auffindbar",
            "Kunden können Werkstatt-Termine nicht digital anfragen",
            "Keine Darstellung von Meisterqualifikation und Spezialisierungen",
          ],
      strengths: [
        "Lokale Kfz-Werkstatt mit Werkstatt-Infrastruktur",
        "Hohe Nachfrage nach verlässlichen Inspektions- und Reparaturpartnern",
      ],
      aiSummary: hasWebsite
        ? `Autowerkstatt in ${city} (${country}). Website zur KI-Analyse bereit.`
        : `Autowerkstatt/Kfz-Service in ${city} (${country}) ohne eigene Website. Großes Potenzial für Online-Terminanfragen.`,
      opportunity:
        "Moderne Werkstatt-Homepage mit Termin-Anfrage für HU/AU, Inspektion und Reifenwechsel.",
      recommendation:
        "Werkstatt-Mockup mit Online-Terminanfrage und Festpreis-Kalkulator vorbereiten.",
      suggestedStructure: [
        "Hero: Meisterbetrieb, Sofort-Hilfe & Termin vereinbaren",
        "Werkstattleistungen (HU/AU, Inspektion, Bremsen, Reifen)",
        "Fahrzeugmarken & Spezial-Diagnose",
        "Kundenbewertungen & Qualitätssiegel",
        "Kontakt, Öffnungszeiten & Notfall-Hotline",
      ],
      salesAngle:
        "Mehr planbare Werkstattauslastung für margenstarke Inspektionen und automatische Terminerinnerung für HU/AU.",
    };
  }

  if (
    norm.includes("kanzlei") ||
    norm.includes("anwalt") ||
    norm.includes("law") ||
    norm.includes("steuer") ||
    norm.includes("notar")
  ) {
    return {
      problems: hasWebsite
        ? [
            "Kein DSGVO-konformes Erstberatungs-Anfrageformular",
            "Komplexe Rechtsgebiete nicht verständlich aufbereitet",
            "Kanzleiprofil und Erfolge wirken veraltet",
          ]
        : [
            "Keine Kanzlei-Website auffindbar",
            "Mandanten können keine digitale Ersteinschätzung oder Kontaktanfrage stellen",
            "Fehlende digitale Positionierung in lukrativen Rechtsgebieten",
          ],
      strengths: [
        "Qualifizierte Kanzlei mit regionalem Vertrauensstatus",
        "Hoher Wert einzelner Mandatsanfragen",
      ],
      aiSummary: hasWebsite
        ? `Kanzlei in ${city} (${country}). Website zur KI-Analyse bereit.`
        : `Kanzlei in ${city} (${country}) ohne eigene Website. Starker Hebel für Mandantengewinnung in Spezialgebieten.`,
      opportunity:
        "Repräsentativer Webauftritt mit Fokus auf Mandantengewinnung und digitaler Erstberatungs-Anfrage.",
      recommendation:
        "Hochwertiges Kanzlei-Mockup mit Fachgebiets-Übersicht und Mandanten-Anfrage erstellen.",
      suggestedStructure: [
        "Hero: Fachanwaltliche Expertise & Vertrauliche Erstberatung",
        "Rechtsgebiete & Spezialisierungen",
        "Anwälte / Partner Profile & Vita",
        "Mandantenstimmen & Fachpublikationen",
        "Erstberatung anfragen & Anfahrt",
      ],
      salesAngle:
        "Gewinnung von Premium-Mandaten durch klare Positionierung und Vertrauensaufbau vor dem ersten Telefonat.",
    };
  }

  // Default for all other businesses
  return {
    problems: hasWebsite
      ? [
          "Website ist noch nicht vollständig auf mobile Endgeräte optimiert",
          "Kontakt- und Angebotsanfrage-Funnel lässt sich modernisieren",
          "Lokale Auffindbarkeit und Ladezeit ausbaufähig",
        ]
      : [
          "Keine eigene Unternehmens-Website vorhanden",
          "Potenzielle Neukunden können Angebot nicht digital prüfen",
          "Kein direkter Kanal zur digitalen Kontaktaufnahme",
        ],
    strengths: [
      "Etablierter lokaler Betrieb mit physischem Standort",
      "Solide Basis für einen schnellen Webseiten-Neubau",
    ],
    aiSummary: hasWebsite
      ? `Lokaler ${industry}-Betrieb in ${city} (${country}). Website zur KI-Analyse bereit.`
      : `Lokaler ${industry}-Betrieb in ${city} (${country}) ohne eigene Website. Hohes Neukunden-Potenzial für einen modernen Webauftritt.`,
    opportunity: hasWebsite
      ? "Website modernisieren, Schwachstellen im Design/Mobile aufdecken und Conversion steigern."
      : "Neubau einer modernen, mobiloptimierten Website mit klarer Kontakt- und Leistungsführung.",
    recommendation:
      "Klicke auf 'Run Gemini analysis' für ein individuelles KI-Audit oder erstelle direkt ein Mockup.",
    suggestedStructure: [
      "Hero-Bereich: Starkes Nutzenversprechen & Call-to-Action",
      "Leistungen & Angebote im Überblick",
      "Über uns, Team & Werte",
      "Kundenstimmen & Qualitätssiegel",
      "Kontakt, Öffnungszeiten & Anfahrt",
    ],
    salesAngle:
      "Modernisierung des Markenauftritts und planbare Neukundengewinnung über Google & Mobilgeräte.",
  };
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

  // Extract Website from all known tags
  const rawWebsite =
    t.website ||
    t["contact:website"] ||
    t.url ||
    t["contact:url"] ||
    t["brand:website"] ||
    t["website:de"] ||
    t["website:en"] ||
    undefined;
  const website = sanitizeWebsite(rawWebsite);
  const hasWebsite = Boolean(website);

  // Extract Phone from all known tags
  const phone = (
    t.phone ||
    t["contact:phone"] ||
    t["phone:mobile"] ||
    t["contact:mobile"] ||
    t["contact:telephone"] ||
    t["tel"] ||
    t["telephone"] ||
    t["phone:office"] ||
    ""
  ).trim();

  // Extract Email from all known tags
  const email = (
    t.email ||
    t["contact:email"] ||
    t["email:contact"] ||
    ""
  ).trim();

  // Extract full Address with Postcode
  const street = (t["addr:street"] || t.street || "").trim();
  const housenumber = (t["addr:housenumber"] || t.housenumber || "").trim();
  const postcode = (t["addr:postcode"] || t.postcode || "").trim();
  const rawCity = (t["addr:city"] || t.city || t.district || cityFallback).trim();
  const city = rawCity || cityFallback;

  let address = "";
  if (street) {
    address = housenumber ? `${street} ${housenumber}` : street;
  } else if (postcode) {
    address = `${postcode} ${city}`;
  } else {
    address = `${city} Zentrum`;
  }

  const country = (t["addr:country"] || t.country || countryFallback || "International")
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

  // Generate Industry-Specific Intelligence
  const intelligence = getIndustryIntelligence(industryLabel, city, country, hasWebsite);

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
      overall: hasWebsite ? 52 : 0,
      design: hasWebsite ? 48 : 0,
      mobile: hasWebsite ? 50 : 0,
      seo: hasWebsite ? 45 : 0,
      performance: hasWebsite ? 58 : 0,
      conversion: hasWebsite ? 40 : 0,
    },
    problems: intelligence.problems,
    strengths: intelligence.strengths,
    aiSummary: intelligence.aiSummary,
    opportunity: intelligence.opportunity,
    recommendation: intelligence.recommendation,
    suggestedStructure: intelligence.suggestedStructure,
    salesAngle: intelligence.salesAngle,
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

  // 1. Geocode City Coordinates and Bounding Box
  let lat = 0;
  let lon = 0;
  let minLon = -180;
  let maxLat = 90;
  let maxLon = 180;
  let minLat = -90;

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

        const extent = feat.properties?.extent; // [min_lon, max_lat, max_lon, min_lat]
        if (Array.isArray(extent) && extent.length === 4) {
          [minLon, maxLat, maxLon, minLat] = extent;
        } else {
          // Fallback bounding box (~14km radius)
          minLon = lon - 0.15;
          maxLon = lon + 0.15;
          minLat = lat - 0.12;
          maxLat = lat + 0.12;
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

              // STRICT GEOFENCE: Check coordinates vs city bounding box & city name
              const [fLon, fLat] = f.geometry?.coordinates || [0, 0];
              const itemCity = (p.city || p.district || p.state || "").trim().toLowerCase();
              const targetCityNorm = cleanCity.toLowerCase().trim();

              const isInsideBbox =
                fLat >= Math.min(minLat, maxLat) - 0.03 &&
                fLat <= Math.max(minLat, maxLat) + 0.03 &&
                fLon >= Math.min(minLon, maxLon) - 0.03 &&
                fLon <= Math.max(minLon, maxLon) + 0.03;

              const isCityMatch =
                itemCity.includes(targetCityNorm) ||
                targetCityNorm.includes(itemCity);

              // Discard items from unrelated cities outside bounding box
              if (!isInsideBbox && !isCityMatch) {
                continue;
              }

              rawElements.push({
                id: p.osm_id || Math.floor(Math.random() * 10000000),
                tags: {
                  name: p.name,
                  "addr:street": p.street || "",
                  "addr:housenumber": p.housenumber || "",
                  "addr:postcode": p.postcode || "",
                  "addr:city": p.city || cleanCity,
                  "addr:country": p.country || detectedCountry,
                  phone:
                    p.phone ||
                    (p.extra?.phone as string) ||
                    (p.extra?.["contact:phone"] as string) ||
                    "",
                  email:
                    p.email ||
                    (p.extra?.email as string) ||
                    (p.extra?.["contact:email"] as string) ||
                    "",
                  website:
                    p.website ||
                    (p.extra?.website as string) ||
                    (p.extra?.["contact:website"] as string) ||
                    "",
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

    // Query secondary term
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

                const [fLon, fLat] = f.geometry?.coordinates || [0, 0];
                const itemCity = (p.city || p.district || p.state || "").trim().toLowerCase();
                const targetCityNorm = cleanCity.toLowerCase().trim();

                const isInsideBbox =
                  fLat >= Math.min(minLat, maxLat) - 0.03 &&
                  fLat <= Math.max(minLat, maxLat) + 0.03 &&
                  fLon >= Math.min(minLon, maxLon) - 0.03 &&
                  fLon <= Math.max(minLon, maxLon) + 0.03;

                const isCityMatch =
                  itemCity.includes(targetCityNorm) ||
                  targetCityNorm.includes(itemCity);

                if (!isInsideBbox && !isCityMatch) {
                  continue;
                }

                rawElements.push({
                  id: p.osm_id || Math.floor(Math.random() * 10000000),
                  tags: {
                    name: p.name,
                    "addr:street": p.street || "",
                    "addr:housenumber": p.housenumber || "",
                    "addr:postcode": p.postcode || "",
                    "addr:city": p.city || cleanCity,
                    "addr:country": p.country || detectedCountry,
                    phone:
                      p.phone ||
                      (p.extra?.phone as string) ||
                      (p.extra?.["contact:phone"] as string) ||
                      "",
                    email:
                      p.email ||
                      (p.extra?.email as string) ||
                      (p.extra?.["contact:email"] as string) ||
                      "",
                    website:
                      p.website ||
                      (p.extra?.website as string) ||
                      (p.extra?.["contact:website"] as string) ||
                      "",
                    ...(p.extra || {}),
                  },
                });
              }
            }
          } catch {
            // Ignore
          }
        })(),
      );
    }
  }

  // 3. Query Nominatim with bounded viewbox
  const nomQueries = customQuery ? [customQuery] : config.searchQueries.slice(0, 2);
  const bboxClause =
    minLon !== -180
      ? `&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1`
      : "";

  const nomPromises = nomQueries.map(async (q) => {
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        `${q} in ${cleanCity}`,
      )}&format=json&addressdetails=1&extratags=1&limit=50${bboxClause}`;
      const res = await fetch(nomUrl, {
        headers: { "User-Agent": "AgencyOS-LeadFinder/2.0 (contact@agencyos.local)" },
        signal: AbortSignal.timeout(4500),
      });
      if (res.ok) {
        const nomData = await res.json();
        if (Array.isArray(nomData)) {
          for (const item of nomData) {
            const itemCity = (
              item.address?.city ||
              item.address?.town ||
              item.address?.village ||
              cleanCity
            ).trim();

            rawElements.push({
              id: item.osm_id || Math.floor(Math.random() * 10000000),
              tags: {
                name: item.name || item.display_name?.split(",")[0] || "",
                ...(item.extratags || {}),
                "addr:street": item.address?.road || "",
                "addr:housenumber": item.address?.house_number || "",
                "addr:postcode": item.address?.postcode || "",
                "addr:city": itemCity,
                "addr:country": item.address?.country || detectedCountry,
                phone:
                  item.extratags?.phone ||
                  item.extratags?.["contact:phone"] ||
                  item.extratags?.["phone:mobile"] ||
                  "",
                email:
                  item.extratags?.email ||
                  item.extratags?.["contact:email"] ||
                  "",
                website:
                  item.extratags?.website ||
                  item.extratags?.["contact:website"] ||
                  item.extratags?.url ||
                  "",
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
