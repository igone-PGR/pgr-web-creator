// Demo content for previewing every block in every variant.
// Used by /preview-blocks to validate the system end-to-end.

import type { BlockInstance, GeneratedSite, MoodId } from "@/lib/site/types";
import { getMoodTokens } from "@/lib/site/moods";

const img = (seed: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

// Curated Unsplash IDs that won't 404
const IMG = {
  hero: "photo-1497366216548-37526070297c",
  about: "photo-1556761175-5973dc0f32e7",
  service1: "photo-1554224155-6726b3ff858f",
  gallery1: "photo-1604328698692-f76ea9498e76",
  gallery2: "photo-1497366811353-6870744d04b2",
  gallery3: "photo-1497366754035-f200968a6e72",
  gallery4: "photo-1559136555-9303baea8ebd",
  gallery5: "photo-1542744173-8e7e53415bb0",
};

export function buildDemoSite(mood: MoodId, variant: "a" | "b"): GeneratedSite {
  const tokens = getMoodTokens(mood);
  const v = variant;

  const blocks: BlockInstance[] = [
    {
      id: "nav-1", type: "nav", variant: v,
      content: {
        brand: "Estudio Marín",
        links: [
          { label: "Sobre nosotros", href: "#sobre-nosotros" },
          { label: "Servicios", href: "#servicios" },
          { label: "Contacto", href: "#contacto" },
        ],
        cta: { label: "Reservar consulta", href: "#contacto" },
      },
    },
    {
      id: "hero-1", type: "hero", variant: v,
      content: {
        eyebrow: "Asesoría fiscal & contable",
        title: "Tu negocio merece claridad financiera.",
        subtitle: "Acompañamos a autónomos y PYMES con fiscalidad estratégica, contabilidad mensual y planificación a medida.",
        primaryCta: { label: "Reservar consulta", href: "#contacto" },
        secondaryCta: { label: "Ver servicios", href: "#servicios" },
        image: `https://images.unsplash.com/${IMG.hero}?auto=format&fit=crop&w=1600&h=1000&q=80`,
        imageAlt: "Despacho profesional",
      },
    },
    {
      id: "stats-1", type: "stats", variant: v,
      content: {
        title: "Números que respaldan nuestro trabajo",
        items: [
          { value: "12+", label: "Años de experiencia" },
          { value: "240", label: "Clientes activos" },
          { value: "98%", label: "Renovación anual" },
          { value: "3.4M€", label: "Optimizado en impuestos" },
        ],
      },
    },
    {
      id: "about-1", type: "about", variant: v,
      content: {
        eyebrow: "Quiénes somos",
        title: "Una asesoría sin tecnicismos, con criterio profesional.",
        body: "Llevamos más de una década ayudando a profesionales independientes y pequeñas empresas a tomar decisiones financieras con cabeza.\n\nNuestro enfoque es directo: entender tu negocio, simplificar lo complejo y darte el control real de tus números.",
        image: `https://images.unsplash.com/${IMG.about}?auto=format&fit=crop&w=1200&h=1500&q=80`,
        imageAlt: "Equipo de asesores",
        bullets: [
          "Atención personalizada con un asesor asignado",
          "Reportes mensuales claros y accionables",
          "Disponibilidad por WhatsApp en horario laboral",
        ],
      },
    },
    {
      id: "services-1", type: "services", variant: v,
      content: {
        eyebrow: "Servicios",
        title: "Todo lo que tu negocio necesita en un solo sitio.",
        subtitle: "Servicios diseñados para que dediques tu tiempo a lo que realmente mueve tu empresa.",
        items: [
          { title: "Fiscalidad", description: "Planificación, declaraciones trimestrales e IRPF anual.", icon: "Calculator" },
          { title: "Contabilidad", description: "Llevanza mensual, conciliación bancaria y cierre anual.", icon: "BookOpen" },
          { title: "Laboral", description: "Altas, nóminas, contratos y gestión de incidencias.", icon: "Users" },
          { title: "Constitución", description: "Trámites para crear tu sociedad o darte de alta como autónomo.", icon: "Building2" },
          { title: "Ayudas y subvenciones", description: "Identificamos y tramitamos las ayudas a las que puedes optar.", icon: "Sparkles" },
          { title: "Consultoría", description: "Sesiones estratégicas para entender tus números y crecer.", icon: "TrendingUp" },
        ],
      },
    },
    {
      id: "process-1", type: "process", variant: v,
      content: {
        eyebrow: "Cómo trabajamos",
        title: "Un método claro, sin sorpresas.",
        steps: [
          { title: "Diagnóstico", description: "Una primera reunión gratuita para entender tu situación." },
          { title: "Propuesta", description: "Te presentamos un plan adaptado, con precio cerrado." },
          { title: "Onboarding", description: "Migramos tu información y configuramos tu cuenta." },
          { title: "Acompañamiento", description: "Reuniones periódicas y soporte continuo durante el año." },
        ],
      },
    },
    {
      id: "testimonials-1", type: "testimonials", variant: v,
      content: {
        eyebrow: "Lo que dicen nuestros clientes",
        title: "Confianza construida cliente a cliente.",
        items: [
          { quote: "Por fin entiendo mis números. Y eso ha cambiado cómo tomo decisiones.", author: "Lucía Fernández", role: "Diseñadora freelance" },
          { quote: "Pasé de tres asesorías distintas a una sola que lo gestiona todo. Un alivio.", author: "Carlos Méndez", role: "Director · Mendez & Co." },
          { quote: "Profesionalidad, cercanía y respuestas en horas, no en días.", author: "Ana Ribera", role: "CEO · Ribera Studio" },
        ],
      },
    },
    {
      id: "gallery-1", type: "gallery", variant: v,
      content: {
        eyebrow: "Nuestro despacho",
        title: "Un espacio pensado para conversar.",
        images: [
          { src: `https://images.unsplash.com/${IMG.gallery1}?auto=format&fit=crop&w=1200&h=800&q=80`, alt: "Despacho 1" },
          { src: `https://images.unsplash.com/${IMG.gallery2}?auto=format&fit=crop&w=800&h=800&q=80`, alt: "Despacho 2" },
          { src: `https://images.unsplash.com/${IMG.gallery3}?auto=format&fit=crop&w=800&h=800&q=80`, alt: "Despacho 3" },
          { src: `https://images.unsplash.com/${IMG.gallery4}?auto=format&fit=crop&w=1200&h=900&q=80`, alt: "Despacho 4" },
          { src: `https://images.unsplash.com/${IMG.gallery5}?auto=format&fit=crop&w=1200&h=900&q=80`, alt: "Despacho 5" },
        ],
      },
    },
    {
      id: "categories-1", type: "categories", variant: v,
      content: {
        eyebrow: "Sectores",
        title: "Acompañamos a equipos de todos los tamaños.",
        items: [
          { title: "Autónomos", description: "Profesionales independientes que quieren delegar la parte fiscal." },
          { title: "PYMES", description: "Empresas de hasta 50 empleados con necesidades de gestión integral." },
          { title: "E-commerce", description: "Negocios online con obligaciones fiscales específicas." },
          { title: "Freelancers tech", description: "Desarrolladores y diseñadores con clientes internacionales." },
          { title: "Startups", description: "Compañías en fase de crecimiento que necesitan estructura financiera." },
          { title: "Profesionales liberales", description: "Abogados, médicos, arquitectos y consultores." },
        ],
      },
    },
    {
      id: "faq-1", type: "faq", variant: v,
      content: {
        eyebrow: "Preguntas frecuentes",
        title: "Antes de empezar, lo que probablemente quieres saber.",
        items: [
          { question: "¿Cuánto cuesta vuestro servicio?", answer: "Trabajamos con cuotas mensuales adaptadas al volumen de tu negocio. La primera consulta es gratuita." },
          { question: "¿Trabajáis con autónomos o solo con sociedades?", answer: "Con ambos. Tenemos planes específicos para autónomos y para sociedades limitadas." },
          { question: "¿Cómo es el proceso de cambio de asesoría?", answer: "Nos ocupamos nosotros del traspaso. Solo necesitamos tus datos de acceso a la AEAT y la información del asesor anterior." },
          { question: "¿Tenéis disponibilidad en agosto?", answer: "Sí. Reducimos horario pero mantenemos servicio para urgencias y declaraciones del trimestre." },
        ],
      },
    },
    {
      id: "hours-1", type: "hours", variant: v,
      content: {
        title: "Horario de atención",
        rows: [
          { day: "Lunes a jueves", hours: "9:00 – 18:00" },
          { day: "Viernes", hours: "9:00 – 14:00" },
          { day: "Sábado y domingo", hours: "Cerrado" },
        ],
        note: "Atención online disponible fuera de horario para clientes en plan Premium.",
      },
    },
    {
      id: "cta-1", type: "cta", variant: v,
      content: {
        title: "Hablemos de tu negocio.",
        subtitle: "Una primera consulta de 30 minutos sin compromiso.",
        primaryCta: { label: "Reservar consulta", href: "#contacto" },
        secondaryCta: { label: "Ver servicios", href: "#servicios" },
      },
    },
    {
      id: "contact-1", type: "contact", variant: v,
      content: {
        eyebrow: "Contacto",
        title: "Estamos a una llamada de distancia.",
        subtitle: "Respondemos a todos los mensajes en menos de 24 horas laborables.",
        email: "hola@estudiomarin.es",
        phone: "+34 911 234 567",
        address: "Calle Serrano, 88. 28006 Madrid",
      },
    },
    {
      id: "map-1", type: "map", variant: v,
      content: {
        title: "Visítanos en el centro de Madrid",
        address: "Calle Serrano 88, 28006 Madrid",
      },
    },
    {
      id: "footer-1", type: "footer", variant: v,
      content: {
        brand: "Estudio Marín",
        tagline: "Asesoría fiscal y contable con criterio. Madrid, desde 2012.",
        columns: [
          { title: "Servicios", links: [
            { label: "Fiscalidad", href: "#servicios" },
            { label: "Contabilidad", href: "#servicios" },
            { label: "Laboral", href: "#servicios" },
          ]},
          { title: "Empresa", links: [
            { label: "Sobre nosotros", href: "#sobre-nosotros" },
            { label: "Contacto", href: "#contacto" },
          ]},
        ],
        contact: { email: "hola@estudiomarin.es", phone: "+34 911 234 567", address: "Calle Serrano 88, Madrid" },
        socials: [
          { label: "LinkedIn", href: "#" },
          { label: "Instagram", href: "#" },
        ],
      },
    },
  ];

  return {
    version: 2,
    brief: {
      brandPositioning: "Asesoría premium con cercanía humana.",
      toneOfVoice: ["claro", "profesional", "cercano"],
      audience: "Autónomos y PYMES en Madrid",
      keyMessages: ["Claridad", "Estrategia", "Acompañamiento"],
      recommendedMood: mood,
      rationale: "Demo",
    },
    tokens,
    blocks,
    meta: {
      businessName: "Estudio Marín",
      sector: "Consultoría / Asesoría",
      language: "es",
      generatedAt: new Date().toISOString(),
    },
  };
}
