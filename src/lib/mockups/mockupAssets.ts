import type { MockupContent, MockupTheme } from "@/types/mockup";
import type { Company } from "@/types/company";

export type IndustryAssetPreset = {
  defaultTheme: MockupTheme;
  heroImage: string;
  aboutImage: string;
  serviceImages: string[];
  defaultKicker: string;
  defaultHeroTitle: string;
  defaultHeroDesc: string;
  defaultHeroCta: string;
  defaultServices: Array<{ title: string; description: string; tag?: string }>;
  defaultAboutTitle: string;
  defaultAboutText: string;
  defaultAboutPoints: string[];
  defaultTestimonials: Array<{ quote: string; author: string; role: string; rating: number }>;
  defaultCtaTitle: string;
  defaultCtaText: string;
  defaultCtaBtn: string;
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
  const norm = industry.toLowerCase();

  // 1. Dentist / Kieferorthopäde
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
      defaultKicker: `Zahnarztpraxis in ${city}`,
      defaultHeroTitle: "Ihr Lächeln in besten Händen – schmerzfrei & modern.",
      defaultHeroDesc:
        "Persönliche Betreuung, modernste Behandlungsmethoden und eine entspannte Atmosphäre für Ihre ganze Familie. Jetzt unkompliziert Wunschtermin sichern.",
      defaultHeroCta: "Online Termin vereinbaren",
      defaultServices: [
        {
          title: "Vorsorge & Prophylaxe",
          description: "Professionelle Zahnreinigung für dauerhaft gesunde Zähne und frisches Zahnfleisch.",
          tag: "Basis-Vorsorge",
        },
        {
          title: "Ästhetische Zahnheilkunde",
          description: "Schonende Zahnaufhellung (Bleaching), Veneers und unsichtbare Zahnschienen.",
          tag: "Ästhetik",
        },
        {
          title: "Implantologie & Zahnersatz",
          description: "Hochwertige, passgenaue Implantate aus biokompatibler Keramik mit natürlichem Gefühl.",
          tag: "Spezialgebiet",
        },
      ],
      defaultAboutTitle: `Ihre Wohlfühlpraxis in ${city}`,
      defaultAboutText:
        "Wir verbinden jahrelange Erfahrung mit modernster digitaler Diagnostik (3D-Röntgen, Intraoral-Scan ohne Würgereiz). Bei uns steht der Mensch im Mittelpunkt – von der einfühlsamen Beratung bis zur Nachsorge.",
      defaultAboutPoints: [
        "Digitaler Scan statt unangenehmer Abdruckmasse",
        "Einfühlsame Behandlung speziell für Angstpatienten",
        "Flexible Abend- und Samstags-Sprechstunden",
      ],
      defaultTestimonials: [
        {
          quote:
            "Endlich eine Praxis, bei der man keine Angst haben muss! Freundliches Team, keine Wartezeit und ein tolles Ergebnis.",
          author: "Laura M.",
          role: `Patientin aus ${city}`,
          rating: 5,
        },
        {
          quote:
            "Die professionelle Zahnreinigung und Beratung waren erstklassig. Sehr moderne Ausstattung und transparente Kosten.",
          author: "Markus S.",
          role: "Patient",
          rating: 5,
        },
      ],
      defaultCtaTitle: "Bereit für ein gesundes, strahlendes Lächeln?",
      defaultCtaText:
        "Vereinbaren Sie Ihren Termin ganz einfach in unter 60 Sekunden online – ohne langes Telefonieren.",
      defaultCtaBtn: "Jetzt 24/7 Termin buchen",
    };
  }

  // 2. Friseur / Barbershop / Salon
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
      defaultKicker: `Salon & Barber in ${city}`,
      defaultHeroTitle: "Dein Look. Deine Ausstrahlung. Perfektion im Detail.",
      defaultHeroDesc:
        "Meisterhafte Haarschnitte, brillante Colorationen und erstklassiges Styling in entspannter Salon-Atmosphäre. Gönn dir deine Auszeit.",
      defaultHeroCta: "Online Termin buchen",
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
      defaultAboutTitle: "Leidenschaft für Haare & Style",
      defaultAboutText:
        "Bei uns trifft handwerkliche Präzision auf die neuesten Trend-Techniken. Wir nehmen uns Zeit für deine Wünsche und verwenden ausschließlich hochwertige Pflegeprodukte.",
      defaultAboutPoints: [
        "Erfahrene Top-Stylisten & Meisterqualifikation",
        "Kostenlose Getränke & entspanntes Salon-Ambiente",
        "Exklusive Premium-Pflegeprodukte",
      ],
      defaultTestimonials: [
        {
          quote:
            "Der beste Haarschnitt, den ich je hatte! Super Beratung bei der Balayage-Farbe – absolut empfehlenswert.",
          author: "Sophie K.",
          role: "Stammkundin",
          rating: 5,
        },
        {
          quote: "Präziser Fade-Cut und erstklassige Bartpflege. Entspannte Atmosphäre und immer top pünktlich.",
          author: "David B.",
          role: `Kunde aus ${city}`,
          rating: 5,
        },
      ],
      defaultCtaTitle: "Sichere dir deinen Wunsch-Stylingtermin",
      defaultCtaText: "Wähle deine Lieblingsbehandlung und deinen Wunsch-Stylisten direkt im Online-Kalender.",
      defaultCtaBtn: "Freien Termin auswählen",
    };
  }

  // 3. Restaurant / Café / Gastronomie
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
      defaultKicker: `Kulinarik & Gastfreundschaft in ${city}`,
      defaultHeroTitle: "Frische Zutaten, echte Leidenschaft & unvergesslicher Geschmack.",
      defaultHeroDesc:
        "Genießen Sie handgemachte Spezialitäten, saisonale Highlights und erlesene Weine in gemütlicher Wohlfühl-Atmosphäre.",
      defaultHeroCta: "Tisch online reservieren",
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
          title: "Events & Feierlichkeiten",
          description: "Der perfekte Rahmen für Geburtstage, Firmenfeiern und Hochzeiten bis zu 80 Personen.",
          tag: "Private Dining",
        },
      ],
      defaultAboutTitle: "Aus Liebe zur guten Küche",
      defaultAboutText:
        "Unser Küchenteam zaubert mit viel Hingabe traditionelle Rezepturen neu interpretiert auf den Teller. Bei uns schmecken Sie die Sorgfalt bei jeder Zutat.",
      defaultAboutPoints: [
        "100% frische Zubereitung ohne Fertigprodukte",
        "Gemütlicher Außenbereich & sonnige Terrasse",
        "Vegetarische & vegane Gaumenfreuden",
      ],
      defaultTestimonials: [
        {
          quote:
            "Hervorragendes Essen, aufmerksamer Service und ein tolles Ambiente. Ein absoluter Geheimtipp!",
          author: "Christian W.",
          role: `Gast aus ${city}`,
          rating: 5,
        },
        {
          quote: "Wir haben unsere Firmenfeier hier veranstaltet. Alles hat perfekt geklappt – vielen Dank!",
          author: "Elena R.",
          role: "Event-Gast",
          rating: 5,
        },
      ],
      defaultCtaTitle: "Lust auf einen genussvollen Abend?",
      defaultCtaText: "Reservieren Sie Ihren Tisch bequem online mit sofortiger Bestätigung.",
      defaultCtaBtn: "Jetzt Tisch reservieren",
    };
  }

  // 4. Handwerk / Bau / Schreiner / Elektro / Sanitär
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
      defaultKicker: `Meisterbetrieb für ${city} & Umgebung`,
      defaultHeroTitle: "Zuverlässige Handwerksqualität – sauber, pünktlich & meisterhaft.",
      defaultHeroDesc:
        "Von der persönlichen Fachberatung bis zur termingerechten Umsetzung: Wir realisieren Ihre Projekte mit höchster Präzision und fairen Festpreisen.",
      defaultHeroCta: "Kostenloses Angebot anfragen",
      defaultServices: [
        {
          title: "Planung & Fachberatung",
          description: "Individuelle Konzeption direkt vor Ort mit transparenter Kostenschätzung.",
          tag: "Persönlich",
        },
        {
          title: "Präzise Ausführung",
          description: "Saubere Handwerksarbeit durch erfahrene Gesellen und modernstes Equipment.",
          tag: "Meisterqualität",
        },
        {
          title: "Wartung & Notdienst",
          description: "Schnelle Hilfe bei Reparaturen und zuverlässige Instandhaltung.",
          tag: "Service",
        },
      ],
      defaultAboutTitle: "Qualität, auf die Sie bauen können",
      defaultAboutText:
        "Als regionaler Handwerks-Meisterbetrieb legen wir großen Wert auf langlebige Materialien, Termintreue und transparente Absprachen ohne versteckte Kosten.",
      defaultAboutPoints: [
        "Transparente Festpreis-Garantie ohne Überraschungen",
        "Erfahrene Meister und qualifizierte Fachkräfte",
        "Saubere Baustellen und pünktliche Fertigstellung",
      ],
      defaultTestimonials: [
        {
          quote:
            "Pünktlich, sauber und extrem professionell ausgeführt. So wünscht man sich Handwerker heute!",
          author: "Thomas M.",
          role: `Hausbesitzer in ${city}`,
          rating: 5,
        },
        {
          quote: "Von der ersten Beratung bis zur Abnahme alles top. Klare Weiterempfehlung!",
          author: "Sabine H.",
          role: "Kundin",
          rating: 5,
        },
      ],
      defaultCtaTitle: "Haben Sie ein konkretes Projekt im Kopf?",
      defaultCtaText: "Beschreiben Sie kurz Ihr Vorhaben und erhalten Sie innerhalb von 24h ein unverbindliches Angebot.",
      defaultCtaBtn: "Projekt jetzt unverbindlich anfragen",
    };
  }

  // 5. Autowerkstatt / Kfz
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
      defaultKicker: `Kfz-Meisterwerkstatt in ${city}`,
      defaultHeroTitle: "Ihr Fahrzeug in Profi-Händen – schnell, fair & meisterhaft.",
      defaultHeroDesc:
        "Inspektion nach Herstellervorgaben, HU/AU, Bremsenservice und Elektronik-Diagnose für alle Marken mit voller Herstellergarantie.",
      defaultHeroCta: "Werkstatt-Termin anfragen",
      defaultServices: [
        {
          title: "HU / AU Hauptuntersuchung",
          description: "Täglich TÜV/DEKRA Prüfungen im Haus inklusive Vorab-Check.",
          tag: "TÜV-Prüfung",
        },
        {
          title: "Inspektion & Wartung",
          description: "Nach Herstellervorgaben mit Erhalt der vollen Werksgarantie und digitalem Serviceheft.",
          tag: "Alle Marken",
        },
        {
          title: "Bremsen & Fahrwerk",
          description: "Präzise Diagnose, Marken-Ersatzteile in Erstausrüsterqualität und Festpreis.",
          tag: "Sicherheit",
        },
      ],
      defaultAboutTitle: "Transparenz & Meisterkompetenz",
      defaultAboutText:
        "Wir reparieren nur, was wirklich nötig ist, und sprechen jeden Arbeitsschritt vorab mit Ihnen ab. Modernste Diagnosegeräte garantieren schnelle Fehlersuche.",
      defaultAboutPoints: [
        "Kostenloser Ersatzwagen während der Reparatur",
        "Transparenter Kostenvoranschlag vor Reparaturbeginn",
        "24 Monate Garantie auf Original-Markenersatzteile",
      ],
      defaultTestimonials: [
        {
          quote:
            "Super schneller Service bei der Inspektion. Sehr freundlich und viel günstiger als die Vertragswerkstatt!",
          author: "Michael T.",
          role: `Autofahrer aus ${city}`,
          rating: 5,
        },
        {
          quote: "Fahrzeug morgens abgegeben, nachmittags fertig mit TÜV. Perfekter Ablauf!",
          author: "Sandra P.",
          role: "Kundin",
          rating: 5,
        },
      ],
      defaultCtaTitle: "Wann steht Ihr nächster Werkstatt-Check an?",
      defaultCtaText: "Wählen Sie Ihren Wunschtermin online oder rufen Sie uns direkt an.",
      defaultCtaBtn: "Online Werkstatt-Termin buchen",
    };
  }

  // 6. Kanzlei / Anwalt / Steuerberater
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
      defaultKicker: `Kanzlei für Recht & Beratung in ${city}`,
      defaultHeroTitle: "Kompetente Rechtsberatung – durchsetzungsstark & persönlich.",
      defaultHeroDesc:
        "Wir vertreten Ihre rechtlichen und wirtschaftlichen Interessen mit höchster fachlicher Expertise, strategischem Weitblick und absoluter Diskretion.",
      defaultHeroCta: "Vertrauliche Erstberatung anfragen",
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
      defaultAboutTitle: "Ihr verlässlicher Rechtsbeistand",
      defaultAboutText:
        "Wir verstehen uns als moderne Kanzlei, die komplexe juristische Sachverhalte verständlich auf den Punkt bringt und pragmatische, wirtschaftlich sinnvolle Lösungen findet.",
      defaultAboutPoints: [
        "Schnelle Ersteinschätzung innerhalb von 24 Stunden",
        "Transparente Honorarstruktur ohne versteckte Gebühren",
        "Digitale Aktenführung & persönliche Betreuung",
      ],
      defaultTestimonials: [
        {
          quote:
            "Sehr kompetente und zielorientierte Beratung. Herr Rechtsanwalt hat meinen Fall hervorragend gelöst.",
          author: "Dr. Andreas K.",
          role: `Mandant aus ${city}`,
          rating: 5,
        },
        {
          quote: "Hervorragende Unterstützung bei Vertragsverhandlungen. Absolut empfehlenswert!",
          author: "Monika W.",
          role: "Unternehmerin",
          rating: 5,
        },
      ],
      defaultCtaTitle: "Haben Sie ein rechtliches Anliegen?",
      defaultCtaText: "Kontaktieren Sie uns für eine unverbindliche und diskrete Ersteinschätzung.",
      defaultCtaBtn: "Erstberatungs-Termin vereinbaren",
    };
  }

  // 7. General Business / Fallback
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
    defaultKicker: `Ihr Partner in ${city}`,
    defaultHeroTitle: "Professionelle Qualität, persönlicher Service & maßgeschneiderte Lösungen.",
    defaultHeroDesc:
      "Wir sind Ihr verlässlicher Ansprechpartner vor Ort. Entdecken Sie erstklassige Leistungen, transparente Abläufe und echte Kundenorientierung.",
    defaultHeroCta: "Jetzt unverbindlich anfragen",
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
    defaultAboutTitle: `Über uns in ${city}`,
    defaultAboutText:
      "Mit Leidenschaft und Fachkompetenz setzen wir uns tagtäglich für die Zufriedenheit unserer Kunden ein. Lernen Sie uns kennen!",
    defaultAboutPoints: [
      "Persönliche Beratung auf Augenhöhe",
      "Zuverlässige und transparente Preisgestaltung",
      "Langjährige Erfahrung und regionales Vertrauen",
    ],
    defaultTestimonials: [
      {
        quote: "Zuverlässiger Partner mit hervorragendem Service. Jederzeit gerne wieder!",
        author: "Klaus B.",
        role: `Kunde aus ${city}`,
        rating: 5,
      },
      {
        quote: "Sehr gute Kommunikation und erstklassige Qualität. Absolut zufrieden!",
        author: "Petra N.",
        role: "Kundin",
        rating: 5,
      },
    ],
    defaultCtaTitle: "Starten Sie jetzt mit uns durch",
    defaultCtaText: "Nehmen Sie Kontakt auf und wir melden uns schnellstmöglich bei Ihnen.",
    defaultCtaBtn: "Jetzt Kontakt aufnehmen",
  };
}

export function generateDefaultMockupContent(company: Company): MockupContent {
  const preset = getIndustryPreset(company.industry, company.city);

  return {
    theme: preset.defaultTheme,
    heroKicker: `${company.name} · ${company.industry} in ${company.city}`,
    heroTitle: preset.defaultHeroTitle,
    heroDescription: preset.defaultHeroDesc,
    heroCta: preset.defaultHeroCta,
    heroSecondaryCta: "Leistungen entdecken",
    heroImage: preset.heroImage,
    servicesTitle: "Unsere Kernleistungen",
    servicesSubtitle: `Maßgeschneiderte Lösungen von ${company.name} in ${company.city}`,
    services: preset.defaultServices.map((s, idx) => ({
      ...s,
      image: preset.serviceImages[idx] || preset.serviceImages[0],
    })),
    aboutTitle: preset.defaultAboutTitle,
    aboutText: preset.defaultAboutText,
    aboutImage: preset.aboutImage,
    aboutPoints: preset.defaultAboutPoints,
    testimonialsTitle: "Was unsere Kunden über uns sagen",
    testimonials: preset.defaultTestimonials,
    ctaTitle: preset.defaultCtaTitle,
    ctaText: preset.defaultCtaText,
    ctaButton: preset.defaultCtaBtn,
  };
}
