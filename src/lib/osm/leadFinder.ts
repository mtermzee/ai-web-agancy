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
  const targetFetchCount = Math.max(limit * 2, 100);

  let detectedCountry = "Deutschland";

  // 1. Geocode City Coordinates & Metro Extent
  let lat = 0;
  let lon = 0;
  let minLon = -180;
  let maxLat = 90;
  let maxLon = 180;
  let minLat = -90;

  try {
    const geoUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanCity)}&limit=1`;
    const geoRes = await fetch(geoUrl, {
      headers: { "User-Agent": "AgencyOS-LeadFinder/3.0 (contact@agencyos.local)" },
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
          // Generous metro box (~20km radius)
          minLon = lon - 0.18;
          maxLon = lon + 0.18;
          minLat = lat - 0.14;
          maxLat = lat + 0.14;
        }
      }
    }
  } catch (err) {
    console.warn("[Photon Geocode Error]", err);
  }

  type RawFeature = {
    geometry: { coordinates: [number, number] };
    properties: {
      name?: string;
      street?: string;
      housenumber?: string;
      postcode?: string;
      city?: string;
      district?: string;
      state?: string;
      country?: string;
      osm_id?: number;
      osm_type?: "N" | "W" | "R";
      phone?: string;
      email?: string;
      website?: string;
      extra?: Record<string, unknown>;
    };
  };

  const rawFeatures: RawFeature[] = [];

  if (lat !== 0 && lon !== 0) {
    const fetchPromises: Promise<void>[] = [];

    // Query Strategy A: Direct Tag-Only Queries (finds ALL POIs with this category near city)
    const tagList = customQuery ? [] : config.photonTags || [];
    for (const tag of tagList.slice(0, 3)) {
      const tagUrl = `https://photon.komoot.io/api/?lat=${lat}&lon=${lon}&limit=${targetFetchCount}&osm_tag=${encodeURIComponent(
        tag,
      )}`;
      fetchPromises.push(
        (async () => {
          try {
            const res = await fetch(tagUrl, {
              headers: { "User-Agent": "AgencyOS-LeadFinder/3.0 (contact@agencyos.local)" },
              signal: AbortSignal.timeout(4500),
            });
            if (res.ok) {
              const data = await res.json();
              for (const f of (data.features as RawFeature[]) || []) {
                if (f.properties?.name) rawFeatures.push(f);
              }
            }
          } catch {
            // Ignore
          }
        })(),
      );
    }

    // Query Strategy B: Keyword Sweeps near city
    const queryList = customQuery ? [customQuery] : config.searchQueries.slice(0, 3);
    for (const q of queryList) {
      const qUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
        q,
      )}&lat=${lat}&lon=${lon}&limit=${targetFetchCount}`;
      fetchPromises.push(
        (async () => {
          try {
            const res = await fetch(qUrl, {
              headers: { "User-Agent": "AgencyOS-LeadFinder/3.0 (contact@agencyos.local)" },
              signal: AbortSignal.timeout(4500),
            });
            if (res.ok) {
              const data = await res.json();
              for (const f of (data.features as RawFeature[]) || []) {
                if (f.properties?.name) rawFeatures.push(f);
              }
            }
          } catch {
            // Ignore
          }
        })(),
      );
    }

    await Promise.allSettled(fetchPromises);
  }

  // Filter features to keep only those within the city metro boundary
  const filteredFeatures: RawFeature[] = [];
  const featureDedup = new Set<string>();

  for (const f of rawFeatures) {
    const p = f.properties || {};
    if (!p.name) continue;

    const [fLon, fLat] = f.geometry?.coordinates || [0, 0];
    const itemCity = (p.city || p.district || p.state || "").trim().toLowerCase();
    const targetCityNorm = cleanCity.toLowerCase().trim();

    // Generous bounding box margin (+0.04 deg ~4.5km) to include all city districts & suburbs
    const isInsideBbox =
      fLat >= Math.min(minLat, maxLat) - 0.05 &&
      fLat <= Math.max(minLat, maxLat) + 0.05 &&
      fLon >= Math.min(minLon, maxLon) - 0.05 &&
      fLon <= Math.max(minLon, maxLon) + 0.05;

    const isCityMatch =
      itemCity.includes(targetCityNorm) ||
      targetCityNorm.includes(itemCity);

    if (!isInsideBbox && !isCityMatch) {
      continue;
    }

    const key = `${p.name.toLowerCase().trim()}_${p.osm_id || Math.round(fLat * 1000)}`;
    if (featureDedup.has(key)) continue;
    featureDedup.add(key);

    filteredFeatures.push(f);
  }

  // 3. Batch Enrich Features via Official OSM API to get 100% full tags (Phone, Web, Email, Postcode)
  const nodeIds: number[] = [];
  const wayIds: number[] = [];

  for (const f of filteredFeatures) {
    const p = f.properties;
    if (p.osm_id) {
      if (p.osm_type === "N") nodeIds.push(p.osm_id);
      else if (p.osm_type === "W") wayIds.push(p.osm_id);
    }
  }

  const tagMap = new Map<string, Record<string, string>>();
  const enrichPromises: Promise<void>[] = [];

  // Batch query nodes in parallel chunks of 40
  if (nodeIds.length > 0) {
    for (let i = 0; i < nodeIds.length; i += 40) {
      const chunk = nodeIds.slice(i, i + 40);
      enrichPromises.push(
        (async () => {
          try {
            const res = await fetch(
              `https://api.openstreetmap.org/api/0.6/nodes.json?nodes=${chunk.join(",")}`,
              {
                headers: { "User-Agent": "AgencyOS-LeadFinder/3.0 (contact@agencyos.local)" },
                signal: AbortSignal.timeout(4000),
              },
            );
            if (res.ok) {
              const data = await res.json();
              for (const el of (data.elements as Array<{ id: number; tags?: Record<string, string> }>) || []) {
                if (el.tags) tagMap.set(`N${el.id}`, el.tags);
              }
            }
          } catch {
            // Ignore timeout
          }
        })(),
      );
    }
  }

  // Batch query ways in parallel chunks of 40
  if (wayIds.length > 0) {
    for (let i = 0; i < wayIds.length; i += 40) {
      const chunk = wayIds.slice(i, i + 40);
      enrichPromises.push(
        (async () => {
          try {
            const res = await fetch(
              `https://api.openstreetmap.org/api/0.6/ways.json?ways=${chunk.join(",")}`,
              {
                headers: { "User-Agent": "AgencyOS-LeadFinder/3.0 (contact@agencyos.local)" },
                signal: AbortSignal.timeout(4000),
              },
            );
            if (res.ok) {
              const data = await res.json();
              for (const el of (data.elements as Array<{ id: number; tags?: Record<string, string> }>) || []) {
                if (el.tags) tagMap.set(`W${el.id}`, el.tags);
              }
            }
          } catch {
            // Ignore timeout
          }
        })(),
      );
    }
  }

  await Promise.allSettled(enrichPromises);

  // 4. Merge enriched OSM tags into company objects
  const rawElements: Array<{ id: number | string; tags?: Record<string, string> }> = [];

  for (const f of filteredFeatures) {
    const p = f.properties;
    const key = `${p.osm_type || "N"}${p.osm_id}`;
    const rawTags = tagMap.get(key) || {};

    const phone =
      rawTags.phone ||
      rawTags["contact:phone"] ||
      rawTags["phone:mobile"] ||
      rawTags["contact:mobile"] ||
      rawTags["contact:telephone"] ||
      rawTags["tel"] ||
      p.phone ||
      (p.extra?.phone as string) ||
      "";

    const website =
      rawTags.website ||
      rawTags["contact:website"] ||
      rawTags.url ||
      rawTags["contact:url"] ||
      rawTags["brand:website"] ||
      rawTags["website:de"] ||
      p.website ||
      (p.extra?.website as string) ||
      "";

    const email =
      rawTags.email ||
      rawTags["contact:email"] ||
      rawTags["email:contact"] ||
      p.email ||
      (p.extra?.email as string) ||
      "";

    const street = rawTags["addr:street"] || p.street || "";
    const housenumber = rawTags["addr:housenumber"] || p.housenumber || "";
    const postcode = rawTags["addr:postcode"] || p.postcode || "";
    const city = rawTags["addr:city"] || p.city || cleanCity;

    rawElements.push({
      id: p.osm_id || Math.floor(Math.random() * 10000000),
      tags: {
        name: p.name || "",
        "addr:street": street,
        "addr:housenumber": housenumber,
        "addr:postcode": postcode,
        "addr:city": city,
        "addr:country": p.country || detectedCountry,
        phone,
        email,
        website,
        ...(p.extra || {}),
        ...rawTags,
      },
    });
  }

  // 5. Parse, Deduplicate and Filter
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
