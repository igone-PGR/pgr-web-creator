export interface DesignDecisions {
  heroStyle: "fullscreen" | "split" | "minimal-center" | "text-left-image-right" | "gradient-overlay";
  layoutStyle: "editorial" | "bold" | "minimal" | "organic" | "brutalist";
  fontPair: { heading: string; body: string };
  sectionOrder: string[]; // e.g. ["hero","features","about","photos","services","contact"]
  serviceLayout: "cards" | "list" | "numbered-large" | "timeline";
  photoLayout: "masonry" | "fullbleed-alternating" | "grid" | "overlap-collage";
  animationStyle: "fade-up" | "slide-in" | "scale-pop" | "stagger-cascade";
  heroHeight: "full" | "tall" | "medium";
  borderRadius: "sharp" | "rounded" | "pill";
  accentGradient: string | null; // e.g. "linear-gradient(135deg, #FF6B4A, #FF3E8A)"
  decorativeElements: boolean; // abstract shapes, blobs, lines
}

export interface WebContent {
  heroHeadline: string;
  heroSubtitle: string;
  heroCta: string;
  aboutTitle: string;
  aboutText: string;
  features: { title: string; description: string }[];
  servicesTitle: string;
  services: { name: string; description: string }[];
  contactTitle: string;
  contactSubtitle: string;
  footerTagline: string;
  design: DesignDecisions;
}

export const DEFAULT_DESIGN: DesignDecisions = {
  heroStyle: "fullscreen",
  layoutStyle: "editorial",
  fontPair: { heading: "Space Grotesk", body: "Inter" },
  sectionOrder: ["hero", "features", "about", "photos", "services", "contact"],
  serviceLayout: "cards",
  photoLayout: "grid",
  animationStyle: "fade-up",
  heroHeight: "tall",
  borderRadius: "rounded",
  accentGradient: null,
  decorativeElements: false,
};

export const DEFAULT_CONTENT: WebContent = {
  heroHeadline: "Bienvenidos a tu negocio",
  heroSubtitle: "Un espacio donde la calidad y la atención se unen para ofrecerte la mejor experiencia.",
  heroCta: "Descúbrenos",
  aboutTitle: "Nuestra historia",
  aboutText: "Somos un equipo apasionado dedicado a ofrecer la mejor experiencia a nuestros clientes. Cada detalle cuenta y trabajamos para que tu visita sea inolvidable.",
  features: [
    { title: "Calidad premium", description: "Cuidamos cada detalle para ofrecerte una experiencia excepcional." },
    { title: "Atención personalizada", description: "Nos adaptamos a tus necesidades con un trato cercano y profesional." },
    { title: "Experiencia contrastada", description: "Años de dedicación nos avalan como referentes en nuestro sector." },
  ],
  servicesTitle: "Nuestros servicios",
  services: [
    { name: "Servicio principal", description: "Nuestra especialidad estrella con la máxima calidad." },
    { name: "Asesoramiento", description: "Te guiamos para encontrar exactamente lo que necesitas." },
    { name: "Experiencia exclusiva", description: "Vive momentos únicos diseñados para ti." },
    { name: "Atención premium", description: "Servicio personalizado que supera expectativas." },
  ],
  contactTitle: "Hablemos",
  contactSubtitle: "Estamos aquí para ayudarte. Escríbenos y te respondemos en menos de 24h.",
  footerTagline: "Donde la excelencia se encuentra con la pasión.",
  design: DEFAULT_DESIGN,
};
