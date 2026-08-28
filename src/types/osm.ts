export type IndustryPreset =
  | "dentist"
  | "doctor"
  | "physiotherapy"
  | "hairdresser"
  | "restaurant"
  | "craftsman"
  | "car_repair"
  | "lawyer"
  | "fitness"
  | "beauty"
  | "hotel"
  | "all";

export const INDUSTRY_CONFIG: Record<
  IndustryPreset,
  {
    label: string;
    osmTags: string[];
    photonTags: string[];
    searchQueries: string[];
    defaultCategory: string;
  }
> = {
  dentist: {
    label: "Zahnarzt / Dental Clinic / Orthodontist",
    osmTags: ['"amenity"="dentist"', '"healthcare"="dentist"'],
    photonTags: ["amenity:dentist", "healthcare:dentist"],
    searchQueries: ["Zahnarzt", "Dentist", "Zahnklinik", "Kieferorthopäde", "Dental"],
    defaultCategory: "Zahnarzt / Dental",
  },
  doctor: {
    label: "Arzt / Medical Doctor / Clinic",
    osmTags: ['"amenity"="doctors"', '"healthcare"="doctor"', '"amenity"="clinic"'],
    photonTags: ["amenity:doctors", "healthcare:doctor", "amenity:clinic"],
    searchQueries: ["Arzt", "Doctor", "Arztpraxis", "Medical", "Klinik"],
    defaultCategory: "Arzt / Medical",
  },
  physiotherapy: {
    label: "Physiotherapie / Physical Therapy / Osteopathy",
    osmTags: [
      '"healthcare"="physiotherapist"',
      '"amenity"="physiotherapist"',
      '"healthcare:speciality"="physiotherapy"',
    ],
    photonTags: ["healthcare:physiotherapist", "amenity:physiotherapist"],
    searchQueries: ["Physiotherapie", "Physical Therapy", "Osteopathie", "Krankengymnastik"],
    defaultCategory: "Physiotherapie",
  },
  hairdresser: {
    label: "Friseur / Hair Salon / Barbershop",
    osmTags: ['"shop"="hairdresser"'],
    photonTags: ["shop:hairdresser"],
    searchQueries: ["Friseur", "Hair Salon", "Barbershop", "Haarstudio", "Coiffeur"],
    defaultCategory: "Friseur / Salon",
  },
  restaurant: {
    label: "Restaurant / Café / Bar / Bakery",
    osmTags: ['"amenity"="restaurant"', '"amenity"="cafe"'],
    photonTags: ["amenity:restaurant", "amenity:cafe", "amenity:fast_food", "amenity:bar", "amenity:bistro"],
    searchQueries: ["Restaurant", "Café", "Pizzeria", "Gaststätte", "Bistro", "Bar"],
    defaultCategory: "Gastronomie / Food",
  },
  craftsman: {
    label: "Handwerk & Bau (Plumber, Electrician, Carpenter, etc.)",
    osmTags: ['"craft"'],
    photonTags: ["craft", "craft:plumber", "craft:electrician", "craft:carpenter", "craft:painter"],
    searchQueries: ["Handwerk", "Schreinerei", "Elektriker", "Dachdecker", "Plumber", "Contractor"],
    defaultCategory: "Handwerk & Services",
  },
  car_repair: {
    label: "Autowerkstatt / Auto Repair / Mechanic",
    osmTags: ['"shop"="car_repair"', '"craft"="car_repair"'],
    photonTags: ["shop:car_repair", "craft:car_repair"],
    searchQueries: ["Autowerkstatt", "Auto Repair", "Kfz-Meisterbetrieb", "Car mechanic", "Reifenservice"],
    defaultCategory: "Autowerkstatt",
  },
  lawyer: {
    label: "Kanzlei / Law Firm / Accountant / Notary",
    osmTags: ['"office"="lawyer"', '"office"="notary"', '"office"="accountant"'],
    photonTags: ["office:lawyer", "office:notary", "office:accountant"],
    searchQueries: ["Rechtsanwalt", "Anwaltskanzlei", "Law Firm", "Steuerberater", "Notar"],
    defaultCategory: "Kanzlei / Legal",
  },
  fitness: {
    label: "Fitnessstudio / Gym / Yoga / Studio",
    osmTags: ['"leisure"="fitness_centre"', '"leisure"="sports_centre"'],
    photonTags: ["leisure:fitness_centre", "leisure:sports_centre"],
    searchQueries: ["Fitnessstudio", "Gym", "Yoga Studio", "CrossFit", "Fitness"],
    defaultCategory: "Fitness & Gym",
  },
  beauty: {
    label: "Kosmetik / Beauty Salon / Nail Spa",
    osmTags: ['"shop"="beauty"', '"amenity"="spa"'],
    photonTags: ["shop:beauty", "amenity:spa"],
    searchQueries: ["Kosmetikstudio", "Beauty Salon", "Nagelstudio", "Spa", "Wellness"],
    defaultCategory: "Beauty & Spa",
  },
  hotel: {
    label: "Hotel / Resort / Guest House",
    osmTags: ['"tourism"="hotel"', '"tourism"="guest_house"'],
    photonTags: ["tourism:hotel", "tourism:guest_house", "tourism:hostel"],
    searchQueries: ["Hotel", "Pension", "Resort", "Guest House", "Gasthof"],
    defaultCategory: "Hotel & Hospitality",
  },
  all: {
    label: "Alle lokalen Betriebe & Geschäfte (All Businesses)",
    osmTags: ['"shop"', '"amenity"'],
    photonTags: ["shop", "amenity", "office", "craft"],
    searchQueries: ["Geschäft", "Dienstleistung", "Studio", "Praxis", "Business"],
    defaultCategory: "Dienstleistung",
  },
};
