import type { MockupContent, MockupTheme } from "@/types/mockup";
import type { Company } from "@/types/company";

export type IndustryAssetPreset = {
  defaultTheme: MockupTheme;
  heroImage: string;
  aboutImage: string;
  serviceImages: string[];
  defaultServices: Array<{ title: string; description: string; tag?: string }>;
  defaultAboutPoints: string[];
};

export const THEME_CONFIG: Record<
  MockupTheme,
  {
    name: string;
    primary: string;
    accent: string;
    bg: string;
    cardBg: string;
    text: string;
    mutedText: string;
    border: string;
  }
> = {
  "clean-blue": {
    name: "Modern Tech Blue",
    primary: "#0284c7",
    accent: "#38bdf8",
    bg: "#f8fafc",
    cardBg: "#ffffff",
    text: "#0f172a",
    mutedText: "#64748b",
    border: "#e2e8f0",
  },
  "craft-gold": {
    name: "Craft Gold & Wood",
    primary: "#b45309",
    accent: "#f59e0b",
    bg: "#fffbeb",
    cardBg: "#ffffff",
    text: "#451a03",
    mutedText: "#78350f",
    border: "#fde68a",
  },
  "dark-luxury": {
    name: "Dark Luxury & Titanium",
    primary: "#f59e0b",
    accent: "#fbbf24",
    bg: "#090d16",
    cardBg: "#131b2e",
    text: "#f8fafc",
    mutedText: "#94a3b8",
    border: "#1e293b",
  },
  "emerald-fresh": {
    name: "Emerald Fresh & Bio",
    primary: "#059669",
    accent: "#34d399",
    bg: "#f0fdf4",
    cardBg: "#ffffff",
    text: "#064e3b",
    mutedText: "#047857",
    border: "#bbf7d0",
  },
  "vibrant-orange": {
    name: "Vibrant Sunset",
    primary: "#ea580c",
    accent: "#fb923c",
    bg: "#fff7ed",
    cardBg: "#ffffff",
    text: "#7c2d12",
    mutedText: "#9a3412",
    border: "#fed7aa",
  },
};

export function getIndustryPreset(industry: string, city: string): IndustryAssetPreset {
  const norm = (industry || "").toLowerCase();

  // 1. Dentist
  if (norm.includes("zahn") || norm.includes("dentist") || norm.includes("kiefer")) {
    return {
      defaultTheme: "clean-blue",
      heroImage:
        "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
      aboutImage:
        "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
      serviceImages: [
        "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
      ],
      defaultServices: [
        {
          title: "Vorsorge & Prophylaxe",
          description: "Professionelle Zahnreinigung für dauerhaft gesunde Zähne und frisches Zahnfleisch.",
          tag: "Basis-Vorsorge",
        },
        {
          title: "Ästhetische Zahnheilkunde",
          description: "Schonendes Bleaching, Veneers und unsichtbare Korrekturschienen.",
          tag: "Ästhetik",
        },
        {
          title: "Implantologie & Zahnersatz",
          description: "Hochwertige, passgenaue Implantate aus biokompatibler Keramik mit natürlichem Tragegefühl.",
          tag: "Spezialgebiet",
        },
      ],
      defaultAboutPoints: [
        "Digitaler 3D-Scan statt unangenehmer Abdruckmasse",
        "Einfühlsame Behandlung speziell für Angstpatienten",
        "Flexible Abend- und Samstags-Sprechstunden",
      ],
    };
  }

  // 2. Hairdresser / Salon
  if (norm.includes("friseur") || norm.includes("hair") || norm.includes("barber") || norm.includes("salon")) {
    return {
      defaultTheme: "dark-luxury",
      heroImage:
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
      aboutImage:
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
      serviceImages: [
        "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80",
      ],
      defaultServices: [
        {
          title: "Precision Haircut & Styling",
          description: "Individuelle Typberatung, typgerechter Schnitt und professionelles Finish.",
          tag: "Signature Cut",
        },
        {
          title: "Balayage, Glossing & Color",
          description: "Natürliche Farbverläufe, schonende Aufhellung und langanhaltende Farbbrillanz.",
          tag: "Trend Color",
        },
        {
          title: "Traditional Beard Care",
          description: "Klassische Heißtuch-Rasur, präzise Konturen und exklusive Bartpflege-Öle.",
          tag: "Barbershop",
        },
      ],
      defaultAboutPoints: [
        "Erfahrene Top-Stylisten & Meisterqualifikation",
        "Kostenlose Getränke & entspanntes Salon-Ambiente",
        "Exklusive Premium-Pflegeprodukte",
      ],
    };
  }

  // 3. Restaurant / Gastro
  if (norm.includes("restaurant") || norm.includes("caf") || norm.includes("pizz") || norm.includes("gastro") || norm.includes("bar")) {
    return {
      defaultTheme: "craft-gold",
      heroImage:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      aboutImage:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
      serviceImages: [
        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80",
      ],
      defaultServices: [
        {
          title: "Saisonale Spezialitäten",
          description: "Täglich frisch zubereitet mit Zutaten aus kontrolliertem regionalem Anbau.",
          tag: "Frisch & Regional",
        },
        {
          title: "Erlesene Weine & Drinks",
          description: "Sorgfältig kuratierte Weinkarte und hausgemachte Signature-Cocktails.",
          tag: "Weinkarte",
        },
        {
          title: "Events & Feiern",
          description: "Der perfekte Rahmen für Geburtstage, Firmenfeiern und Feierlichkeiten bis zu 80 Personen.",
          tag: "Private Dining",
        },
      ],
      defaultAboutPoints: [
        "100% frische Zubereitung ohne Fertigprodukte",
        "Gemütlicher Außenbereich & sonnige Terrasse",
        "Vegetarische & vegane Gaumenfreuden",
      ],
    };
  }

  // 4. Handwerk & Bau
  if (norm.includes("handwerk") || norm.includes("craft") || norm.includes("schrein") || norm.includes("elektro") || norm.includes("bau") || norm.includes("plumb")) {
    return {
      defaultTheme: "craft-gold",
      heroImage:
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80",
      aboutImage:
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      serviceImages: [
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
      ],
      defaultServices: [
        {
          title: "Planung & Fachberatung",
          description: "Individuelle Konzeption direkt vor Ort mit transparenter Kostenschätzung.",
          tag: "Persönlich",
        },
        {
          title: "Meisterhafte Ausführung",
          description: "Saubere Handwerksarbeit durch erfahrene Gesellen und modernstes Equipment.",
          tag: "Meisterqualität",
        },
        {
          title: "Wartung & Notdienst",
          description: "Schnelle Hilfe bei Reparaturen und zuverlässige Instandhaltung.",
          tag: "Service",
        },
      ],
      defaultAboutPoints: [
        "Transparente Festpreis-Garantie ohne Überraschungen",
        "Erfahrene Meister und qualifizierte Fachkräfte",
        "Saubere Baustellen und pünktliche Fertigstellung",
      ],
    };
  }

  // 5. Autowerkstatt
  if (norm.includes("auto") || norm.includes("kfz") || norm.includes("mechanic") || norm.includes("repair") || norm.includes("werkstatt")) {
    return {
      defaultTheme: "dark-luxury",
      heroImage:
        "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80",
      aboutImage:
        "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80",
      serviceImages: [
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=600&q=80",
      ],
      defaultServices: [
        {
          title: "HU / AU Hauptuntersuchung",
          description: "Täglich TÜV/DEKRA Prüfungen im Haus inklusive gründlichem Vorab-Check.",
          tag: "TÜV-Prüfung",
        },
        {
          title: "Inspektion nach Herstellervorgabe",
          description: "Mit vollem Erhalt der Werksgarantie und Eintrag ins digitale Serviceheft.",
          tag: "Alle Marken",
        },
        {
          title: "Bremsen & Elektronik-Diagnose",
          description: "Modernste Computer-Diagnose und Marken-Ersatzteile in Erstausrüsterqualität.",
          tag: "Sicherheit",
        },
      ],
      defaultAboutPoints: [
        "Kostenloser Ersatzwagen während der Reparatur",
        "Transparenter Kostenvoranschlag vor Reparaturbeginn",
        "24 Monate Garantie auf alle Markenersatzteile",
      ],
    };
  }

  // 6. Kanzlei / Anwalt
  if (norm.includes("kanzlei") || norm.includes("anwalt") || norm.includes("law") || norm.includes("steuer") || norm.includes("notar")) {
    return {
      defaultTheme: "clean-blue",
      heroImage:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      aboutImage:
        "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
      serviceImages: [
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80",
      ],
      defaultServices: [
        {
          title: "Strategische Rechtsberatung",
          description: "Präventive Beratung zur Vermeidung von Rechtsstreitigkeiten und Risiken.",
          tag: "Fachanwaltschaft",
        },
        {
          title: "Vertretung & Verhandlung",
          description: "Konsequente Durchsetzung Ihrer Ansprüche vor Gericht und bei Verhandlungen.",
          tag: "Erfolgreich",
        },
        {
          title: "Vertragsgestaltung",
          description: "Rechtssichere und individuelle Verträge nach aktuellem Gesetzesstand.",
          tag: "Rechtssicher",
        },
      ],
      defaultAboutPoints: [
        "Schnelle Ersteinschätzung innerhalb von 24 Stunden",
        "Transparente Honorarstruktur ohne versteckte Gebühren",
        "Digitale Aktenführung & persönliche Betreuung",
      ],
    };
  }

  // Fallback / General
  return {
    defaultTheme: "clean-blue",
    heroImage:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
    aboutImage:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    serviceImages: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80",
    ],
    defaultServices: [
      {
        title: "Individuelle Beratung",
        description: "Persönliche Analyse Ihrer Anforderungen für das beste Resultat.",
        tag: "Persönlich",
      },
      {
        title: "Erstklassige Umsetzung",
        description: "Zuverlässige, termingerechte und hochwertige Ausführung aller Leistungen.",
        tag: "Qualität",
      },
      {
        title: "Laufende Betreuung",
        description: "Wir stehen Ihnen auch nach Abschluss jederzeit mit Rat und Tat zur Seite.",
        tag: "Service",
      },
    ],
    defaultAboutPoints: [
      "Persönliche Beratung auf Augenhöhe",
      "Zuverlässige und transparente Preisgestaltung",
      "Langjährige Erfahrung und regionales Vertrauen",
    ],
  };
}

export function generateDefaultMockupContent(company: Company): MockupContent {
  const preset = getIndustryPreset(company.industry, company.city);
  const name = company.name || "Ihr Betrieb";
  const city = company.city || "Ihrer Region";
  const industry = company.industry || "Dienstleistungen";

  return {
    theme: preset.defaultTheme,
    heroKicker: `${name} · ${industry} in ${city}`,
    heroTitle: `${name} – Qualität, Vertrauen & erstklassiger Service in ${city}.`,
    heroDescription: `${name} ist Ihr verlässlicher Partner in ${city}. Wir bieten Ihnen maßgeschneiderte Lösungen, persönliche Beratung und termingerechte Ausführung.`,
    heroCta: "Online Termin / Angebot anfragen",
    heroSecondaryCta: "Leistungen entdecken",
    heroImage: preset.heroImage,
    servicesTitle: "Unsere Leistungen im Überblick",
    servicesSubtitle: `Professionelle Angebote von ${name} für Privat- und Gewerbekunden in ${city}`,
    services: preset.defaultServices.map((s, idx) => ({
      ...s,
      image: preset.serviceImages[idx] || preset.serviceImages[0],
    })),
    aboutTitle: `Über ${name} in ${city}`,
    aboutText: `Als inhabergeführter Fachbetrieb legen wir bei ${name} größten Wert auf Kundenzufriedenheit, transparente Preise und meisterhafte Ausführung. Mit langjähriger Erfahrung sind wir Ihr Ansprechpartner in ${city} und Umgebung.`,
    aboutImage: preset.aboutImage,
    aboutPoints: preset.defaultAboutPoints,
    testimonialsTitle: `Was Kunden über ${name} sagen`,
    testimonials: [
      {
        quote: `Absolut empfehlenswert! Das Team von ${name} arbeitet extrem zuverlässig, freundlich und pünktlich.`,
        author: "Markus B.",
        role: `Kunde aus ${city}`,
        rating: 5,
      },
      {
        quote: `Hervorragende Qualität und transparente Preise bei ${name}. Wir kommen jederzeit gerne wieder!`,
        author: "Sandra K.",
        role: "Kundin",
        rating: 5,
      },
    ],
    ctaTitle: `Bereit für Ihr Projekt mit ${name}?`,
    ctaText: `Kontaktieren Sie ${name} jetzt direkt telefonisch unter ${company.phone || "unserer Rufnummer"} oder senden Sie uns Ihre Anfrage online.`,
    ctaButton: "Jetzt unverbindlich anfragen",
  };
}
