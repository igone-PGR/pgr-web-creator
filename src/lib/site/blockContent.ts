// Strongly-typed content shapes per block type.
// Keeps AI generation predictable and components type-safe.

export interface NavContent {
  brand: string;
  links: { label: string; href: string }[];
  cta?: { label: string; href: string };
}

export interface HeroContent {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  image?: string; // URL
  imageAlt?: string;
}

export interface ServicesContent {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  items: {
    title: string;
    description: string;
    icon?: string; // lucide icon name
    image?: string;
  }[];
}

export interface AboutContent {
  eyebrow?: string;
  title: string;
  body: string; // markdown-lite (paragraphs split by \n\n)
  image?: string;
  imageAlt?: string;
  bullets?: string[];
}

export interface CtaContent {
  title: string;
  subtitle?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export interface FooterContent {
  brand: string;
  tagline?: string;
  columns?: { title: string; links: { label: string; href: string }[] }[];
  contact?: { email?: string; phone?: string; address?: string };
  socials?: { label: string; href: string }[];
  copyright?: string;
}

export interface CategoriesContent {
  eyebrow?: string;
  title: string;
  items: { title: string; description?: string; image?: string }[];
}

export interface StatsContent {
  title?: string;
  items: { value: string; label: string }[];
}

export interface ProcessContent {
  eyebrow?: string;
  title: string;
  steps: { title: string; description: string }[];
}

export interface GalleryContent {
  eyebrow?: string;
  title?: string;
  images: { src: string; alt?: string; caption?: string }[];
}

export interface TestimonialsContent {
  eyebrow?: string;
  title?: string;
  items: { quote: string; author: string; role?: string; avatar?: string }[];
}

export interface FaqContent {
  eyebrow?: string;
  title: string;
  items: { question: string; answer: string }[];
}

export interface HoursContent {
  title?: string;
  rows: { day: string; hours: string }[];
  note?: string;
}

export interface ContactContent {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface MapContent {
  title?: string;
  address: string;
  embedUrl?: string; // optional iframe src
}
