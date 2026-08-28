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
  { label: string; osmTags: string[]; searchQueries: string[]; defaultCategory: string }
> = {
  dentist: {
    label: "Zahnarzt / Dental Clinic / Orthodontist",
    osmTags: ['"amenity"="dentist"', '"healthcare"="dentist"'],
    searchQueries: ["Dentist", "Zahnarzt", "Dental Clinic", "Orthodontist"],
    defaultCategory: "Zahnarzt / Dental",
  },
  doctor: {
    label: "Arzt / Medical Doctor / Clinic",
    osmTags: ['"amenity"="doctors"', '"healthcare"="doctor"', '"amenity"="clinic"'],
    searchQueries: ["Doctor", "Arzt", "Clinic", "Medical Practice"],
    defaultCategory: "Arzt / Medical",
  },
  physiotherapy: {
    label: "Physiotherapie / Physical Therapy / Osteopathy",
    osmTags: [
      '"healthcare"="physiotherapist"',
      '"amenity"="physiotherapist"',
      '"healthcare:speciality"="physiotherapy"',
    ],
    searchQueries: ["Physiotherapy", "Physical Therapy", "Physiotherapeut", "Chiropractor"],
    defaultCategory: "Physiotherapie",
  },
  hairdresser: {
    label: "Friseur / Hair Salon / Barbershop",
    osmTags: ['"shop"="hairdresser"'],
    searchQueries: ["Hair salon", "Friseur", "Barbershop", "Hairdresser"],
    defaultCategory: "Friseur / Salon",
  },
  restaurant: {
    label: "Restaurant / Café / Bar / Bakery",
    osmTags: ['"amenity"="restaurant"', '"amenity"="cafe"'],
    searchQueries: ["Restaurant", "Café", "Pizzeria", "Bakery"],
    defaultCategory: "Gastronomie / Food",
  },
  craftsman: {
    label: "Handwerk & Bau (Plumber, Electrician, Carpenter, etc.)",
    osmTags: ['"craft"'],
    searchQueries: ["Plumber", "Electrician", "Schreinerei", "Dachdecker", "Contractor"],
    defaultCategory: "Handwerk & Services",
  },
  car_repair: {
    label: "Autowerkstatt / Auto Repair / Mechanic",
    osmTags: ['"shop"="car_repair"', '"craft"="car_repair"'],
    searchQueries: ["Auto repair", "Autowerkstatt", "Car mechanic", "Tire shop"],
    defaultCategory: "Autowerkstatt",
  },
  lawyer: {
    label: "Kanzlei / Law Firm / Accountant / Notary",
    osmTags: ['"office"="lawyer"', '"office"="notary"', '"office"="accountant"'],
    searchQueries: ["Law firm", "Rechtsanwalt", "Attorney", "Accountant"],
    defaultCategory: "Kanzlei / Legal",
  },
  fitness: {
    label: "Fitnessstudio / Gym / Yoga / Studio",
    osmTags: ['"leisure"="fitness_centre"', '"leisure"="sports_centre"'],
    searchQueries: ["Gym", "Fitnessstudio", "Yoga Studio", "CrossFit"],
    defaultCategory: "Fitness & Gym",
  },
  beauty: {
    label: "Kosmetik / Beauty Salon / Nail Spa",
    osmTags: ['"shop"="beauty"', '"amenity"="spa"'],
    searchQueries: ["Beauty salon", "Kosmetikstudio", "Nail salon", "Spa"],
    defaultCategory: "Beauty & Spa",
  },
  hotel: {
    label: "Hotel / Resort / Guest House",
    osmTags: ['"tourism"="hotel"', '"tourism"="guest_house"'],
    searchQueries: ["Hotel", "Resort", "Guest house", "Pension"],
    defaultCategory: "Hotel & Hospitality",
  },
  all: {
    label: "Alle lokalen Betriebe & Geschäfte (All Businesses)",
    osmTags: ['"shop"', '"amenity"'],
    searchQueries: ["Business", "Store", "Shop", "Geschäft"],
    defaultCategory: "Dienstleistung",
  },
};
