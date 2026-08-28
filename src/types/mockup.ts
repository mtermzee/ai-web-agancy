export type MockupTheme =
  | "clean-blue"
  | "craft-gold"
  | "dark-luxury"
  | "emerald-fresh"
  | "vibrant-orange";

export type MockupService = {
  title: string;
  description: string;
  tag?: string;
  image?: string;
  iconName?: string;
};

export type MockupTestimonial = {
  quote: string;
  author: string;
  role: string;
  rating: number;
};

export type MockupContent = {
  theme: MockupTheme;
  heroKicker: string;
  heroTitle: string;
  heroDescription: string;
  heroCta: string;
  heroSecondaryCta: string;
  heroImage: string;
  servicesTitle: string;
  servicesSubtitle: string;
  services: MockupService[];
  aboutTitle: string;
  aboutText: string;
  aboutImage: string;
  aboutPoints: string[];
  testimonialsTitle: string;
  testimonials: MockupTestimonial[];
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
};
