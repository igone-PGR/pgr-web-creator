export interface ColorPalette {
  bg: string;
  bgAlt: string;
  card: string;
  text1: string;
  text2: string;
  border: string;
  accent: string;
  accentText: string;
  accentDark: string;
}

export interface WebContent {
  heroHeadline: string;
  heroSubtitle: string;
  heroCta: string;
  heroStats: { value: string; label: string }[];
  categories: { title: string; icon: string }[];
  aboutTitle: string;
  aboutText: string;
  aboutHighlights: { title: string; description: string }[];
  servicesTitle: string;
  servicesSubtitle: string;
  services: { name: string; description: string }[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaCta: string;
  ctaStats: { value: string; label: string }[];
  features: { title: string; description: string }[];
  featuresTitle: string;
  featuresSubtitle: string;
  testimonials: { name: string; text: string; rating: number }[];
  faq: { question: string; answer: string }[];
  contactTitle: string;
  contactSubtitle: string;
  footerTagline: string;
  colors: ColorPalette;
}

export const DEFAULT_COLORS: ColorPalette = {
  bg: "#fafaf9",
  bgAlt: "#f3f2ef",
  card: "#ffffff",
  text1: "#1a1a17",
  text2: "#6b6b63",
  border: "#e8e7e3",
  accent: "#1B5E3B",
  accentText: "#ffffff",
  accentDark: "#143D2B",
};

export const DEFAULT_CONTENT: WebContent = {
  heroHeadline: "Bienvenidos a tu negocio",
  heroSubtitle: "Un espacio donde la calidad y la atención se unen para ofrecerte la mejor experiencia.",
  heroCta: "Descúbrenos",
  heroStats: [{ value: "98%", label: "Clientes satisfechos" }],
  categories: [
    { title: "Calidad premium", icon: "star" },
    { title: "Atención personalizada", icon: "heart" },
    { title: "Experiencia", icon: "award" },
    { title: "Confianza", icon: "shield" },
  ],
  aboutTitle: "Nuestra historia",
  aboutText: "Somos un equipo apasionado dedicado a ofrecer la mejor experiencia a nuestros clientes.",
  aboutHighlights: [
    { title: "Profesionalidad", description: "Equipo cualificado y dedicado." },
    { title: "Cercanía", description: "Trato personal y humano." },
    { title: "Resultados", description: "Compromiso con la excelencia." },
  ],
  servicesTitle: "Nuestros servicios",
  servicesSubtitle: "Descubre todo lo que podemos hacer por ti",
  services: [
    { name: "Servicio principal", description: "Nuestra especialidad estrella." },
    { name: "Asesoramiento", description: "Te guiamos profesionalmente." },
    { name: "Experiencia exclusiva", description: "Momentos únicos para ti." },
  ],
  ctaTitle: "Transforma tu experiencia con nuestros servicios",
  ctaSubtitle: "Contacta con nosotros y descubre cómo podemos ayudarte.",
  ctaCta: "Empieza ahora",
  ctaStats: [{ value: "500+", label: "Clientes" }, { value: "10+", label: "Años" }],
  features: [
    { title: "Calidad premium", description: "Cuidamos cada detalle." },
    { title: "Atención personalizada", description: "Nos adaptamos a ti." },
    { title: "Experiencia contrastada", description: "Años de dedicación." },
  ],
  featuresTitle: "¿Por qué elegirnos?",
  featuresSubtitle: "Descubre lo que nos hace diferentes",
  testimonials: [
    { name: "María G.", text: "Excelente servicio, muy profesionales.", rating: 5 },
  ],
  faq: [
    { question: "¿Cómo puedo contactaros?", answer: "Puedes escribirnos por email o WhatsApp." },
    { question: "¿Cuáles son vuestros horarios?", answer: "Consulta nuestra sección de contacto." },
  ],
  contactTitle: "Contacto",
  contactSubtitle: "Estamos aquí para ayudarte",
  footerTagline: "Donde la excelencia se encuentra con la pasión.",
  colors: DEFAULT_COLORS,
};
