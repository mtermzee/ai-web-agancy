export type MockupTheme =
  | "clean-blue"
  | "craft-gold"
  | "dark-luxury"
  | "emerald-fresh"
  | "vibrant-orange"
  | "royal-purple"
  | "rose-luxury"
  | "slate-minimal";

export type MockupStyle =
  | "conversion"
  | "premium"
  | "local-trust"
  | "modern-tech";

export type MockupService = {
  title: string;
  description: string;
  tag?: string;
  image?: string;
  iconName?: string;
};

export type MockupStat = {
  value: string;
  label: string;
};

export type MockupStep = {
  stepNumber: string;
  title: string;
  description: string;
};

export type MockupFaq = {
  question: string;
  answer: string;
};

export type MockupTestimonial = {
  quote: string;
  author: string;
  role: string;
  rating: number;
};

export type MockupContent = {
  theme: MockupTheme;
  styleVariant?: MockupStyle;
  heroKicker: string;
  heroTitle: string;
  heroDescription: string;
  heroCta: string;
  heroSecondaryCta: string;
  heroImage: string;
  stats?: MockupStat[];
  servicesTitle: string;
  servicesSubtitle: string;
  services: MockupService[];
  processTitle?: string;
  processSubtitle?: string;
  processSteps?: MockupStep[];
  aboutTitle: string;
  aboutText: string;
  aboutImage: string;
  aboutPoints: string[];
  testimonialsTitle: string;
  testimonials: MockupTestimonial[];
  faqTitle?: string;
  faqSubtitle?: string;
  faqs?: MockupFaq[];
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
};
