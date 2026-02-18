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
}

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
};
