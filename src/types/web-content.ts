export interface ColorPalette {
  bg: string;         // page background
  bgAlt: string;      // alternate section background
  card: string;       // card/surface background
  text1: string;      // primary text
  text2: string;      // secondary/muted text
  border: string;     // borders
  accent: string;     // primary accent color
  accentText: string; // text on accent bg (usually white or dark)
}

export interface DesignDecisions {
  heroStyle: "fullscreen" | "split" | "minimal-center" | "text-left-image-right" | "gradient-overlay";
  layoutStyle: "editorial" | "bold" | "minimal" | "organic" | "brutalist";
  navStyle: "transparent" | "solid" | "minimal" | "centered" | "hidden";
  footerStyle: "minimal" | "columns" | "centered" | "banner";
  fontPair: { heading: string; body: string };
  sectionOrder: string[];
  serviceLayout: "cards" | "list" | "numbered-large" | "timeline";
  photoLayout: "masonry" | "fullbleed-alternating" | "grid" | "overlap-collage";
  animationStyle: "fade-up" | "slide-in" | "scale-pop" | "stagger-cascade";
  heroHeight: "full" | "tall" | "medium";
  borderRadius: "sharp" | "rounded" | "pill";
  accentGradient: string | null;
  decorativeElements: boolean;
  colors: ColorPalette;
  darkMode: boolean;
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

export const DEFAULT_COLORS: ColorPalette = {
  bg: "#fafaf9",
  bgAlt: "#f3f2ef",
  card: "#ffffff",
  text1: "#1a1a17",
  text2: "#6b6b63",
  border: "#e8e7e3",
  accent: "#FF6B4A",
  accentText: "#ffffff",
};

export const DEFAULT_DESIGN: DesignDecisions = {
  heroStyle: "fullscreen",
  layoutStyle: "editorial",
  navStyle: "transparent",
  footerStyle: "minimal",
  fontPair: { heading: "Space Grotesk", body: "Inter" },
  sectionOrder: ["hero", "features", "about", "photos", "services", "contact"],
  serviceLayout: "cards",
  photoLayout: "grid",
  animationStyle: "fade-up",
  heroHeight: "tall",
  borderRadius: "rounded",
  accentGradient: null,
  decorativeElements: false,
  colors: DEFAULT_COLORS,
  darkMode: false,
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
