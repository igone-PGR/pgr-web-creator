// generate-site-v2: brief + tokens + blocks pipeline.
// 2 chained AI calls with tool-calling:
//   1) IDENTITY: brand brief + recommended mood -> design tokens
//   2) BLOCKS: ordered block instances (type/variant/content)
// Returns a GeneratedSite (version: 2) ready to render via SiteRenderer.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Input validation ────────────────────────────────────────────────────────

const ServiceSchema = z.object({
  name: z.string().max(100),
  description: z.string().max(500),
});

const ImagePoolSchema = z.object({
  hero: z.array(z.string()).default([]),
  about: z.array(z.string()).default([]),
  gallery: z.array(z.string()).default([]),
  all: z.array(z.string()).default([]),
});

const BodySchema = z.object({
  businessName: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  sector: z.string().min(1).max(100),
  slogan: z.string().max(300).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  businessHours: z.string().max(500).optional().nullable(),
  email: z.string().email().max(255),
  businessEmail: z.string().max(255).optional().nullable(),
  businessPhone: z.string().max(30).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  servicesList: z.array(ServiceSchema).max(50).optional().default([]),
  instagram: z.string().max(100).optional().nullable(),
  facebook: z.string().max(200).optional().nullable(),
  linkedin: z.string().max(200).optional().nullable(),
  imagePool: ImagePoolSchema,
  logoUrl: z.string().max(2000).optional().nullable(),
  language: z.string().max(10).optional().default("es"),
});

// ─── Mood presets (mirror of src/lib/site/moods.ts) ──────────────────────────

const MOODS = {
  minimal: {
    label: "Minimal",
    description: "Limpio, mucho espacio en blanco, sans moderna, paleta monocroma con un único acento sobrio.",
    tokens: {
      mood: "minimal", moodIntensity: "balanced",
      colors: { bg: "#FFFFFF", surface: "#FAFAFA", surfaceAlt: "#F4F4F5", text: "#0A0A0A", textMuted: "#71717A", border: "#E4E4E7", accent: "#0A0A0A", accentText: "#FFFFFF", inverse: "#0A0A0A", inverseText: "#FAFAFA" },
      fonts: { display: "Geist", body: "Geist", displayWeights: [500, 600, 700], bodyWeights: [400, 500] },
      radius: { sm: "4px", md: "8px", lg: "12px", pill: "9999px" },
      spacing: { section: "6rem", container: "1200px" },
      shadows: { card: "0 1px 2px 0 rgb(0 0 0 / 0.04)", elevated: "0 4px 12px -2px rgb(0 0 0 / 0.08)" },
    },
  },
  editorial: {
    label: "Editorial",
    description: "Sensación de revista premium. Serif elegante para títulos, paleta crema y tinta, jerarquía tipográfica fuerte.",
    tokens: {
      mood: "editorial", moodIntensity: "balanced",
      colors: { bg: "#FBF8F3", surface: "#FFFFFF", surfaceAlt: "#F2EDE3", text: "#1A1714", textMuted: "#6B6258", border: "#E5DFD3", accent: "#7A2E1F", accentText: "#FBF8F3", inverse: "#1A1714", inverseText: "#FBF8F3" },
      fonts: { display: "Fraunces", body: "Inter", displayWeights: [400, 500, 700], bodyWeights: [400, 500] },
      radius: { sm: "2px", md: "4px", lg: "8px", pill: "9999px" },
      spacing: { section: "7rem", container: "1180px" },
      shadows: { card: "0 2px 6px -1px rgb(26 23 20 / 0.06)", elevated: "0 12px 32px -8px rgb(26 23 20 / 0.16)" },
    },
  },
  warm: {
    label: "Cálido",
    description: "Paleta cálida y orgánica, formas redondeadas, sensación cercana y acogedora. Tipografía amigable.",
    tokens: {
      mood: "warm", moodIntensity: "balanced",
      colors: { bg: "#FFF8F1", surface: "#FFFFFF", surfaceAlt: "#FCEFDC", text: "#2A1F14", textMuted: "#7A6553", border: "#F1E2CD", accent: "#E26D2C", accentText: "#FFFFFF", inverse: "#2A1F14", inverseText: "#FFF8F1" },
      fonts: { display: "DM Serif Display", body: "DM Sans", displayWeights: [400], bodyWeights: [400, 500, 700] },
      radius: { sm: "12px", md: "20px", lg: "28px", pill: "9999px" },
      spacing: { section: "6rem", container: "1200px" },
      shadows: { card: "0 4px 12px -2px rgb(226 109 44 / 0.12)", elevated: "0 16px 40px -12px rgb(226 109 44 / 0.22)" },
    },
  },
  bold: {
    label: "Bold",
    description: "Alto contraste, acento vibrante, tipografía pesada y geométrica, sensación moderna y disruptiva.",
    tokens: {
      mood: "bold", moodIntensity: "strong",
      colors: { bg: "#0E0E0F", surface: "#17171A", surfaceAlt: "#1F1F23", text: "#FAFAFA", textMuted: "#A1A1AA", border: "#2A2A2F", accent: "#D7FF3D", accentText: "#0E0E0F", inverse: "#FAFAFA", inverseText: "#0E0E0F" },
      fonts: { display: "Space Grotesk", body: "Inter", displayWeights: [600, 700], bodyWeights: [400, 500, 600] },
      radius: { sm: "4px", md: "8px", lg: "16px", pill: "9999px" },
      spacing: { section: "7rem", container: "1240px" },
      shadows: { card: "0 0 0 1px rgb(255 255 255 / 0.04)", elevated: "0 24px 48px -16px rgb(0 0 0 / 0.6)" },
    },
  },
} as const;

type MoodId = keyof typeof MOODS;

// ─── AI gateway helper ───────────────────────────────────────────────────────

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

async function callAiTool(systemPrompt: string, userPrompt: string, tool: any, apiKey: string) {
  const resp = await fetch(AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: tool.function.name } },
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    const err: any = new Error(`AI gateway error ${resp.status}: ${errText}`);
    err.status = resp.status;
    throw err;
  }

  const data = await resp.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) {
    console.error("No tool_call returned:", JSON.stringify(data).slice(0, 1000));
    throw new Error("AI did not return structured tool output");
  }
  return JSON.parse(args);
}

// ─── Tool 1: identity (brief + mood) ─────────────────────────────────────────

const IDENTITY_TOOL = {
  type: "function",
  function: {
    name: "define_brand_identity",
    description: "Define the brand identity (positioning, tone, audience, key messages) and pick the best visual mood.",
    parameters: {
      type: "object",
      properties: {
        brandPositioning: { type: "string", description: "1-2 sentence positioning statement in the target language." },
        toneOfVoice: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
        audience: { type: "string", description: "Buyer persona summary in 1 sentence." },
        keyMessages: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
        recommendedMood: { type: "string", enum: ["minimal", "editorial", "warm", "bold"] },
        rationale: { type: "string", description: "Why this mood fits this brand (1-2 sentences, internal use)." },
      },
      required: ["brandPositioning", "toneOfVoice", "audience", "keyMessages", "recommendedMood", "rationale"],
      additionalProperties: false,
    },
  },
};

// ─── Tool 2: skeleton (just type + variant order) ────────────────────────────

const SKELETON_TOOL = {
  type: "function",
  function: {
    name: "compose_skeleton",
    description: "Choose the ordered list of block types and visual variants (no copy yet).",
    parameters: {
      type: "object",
      properties: {
        blocks: {
          type: "array",
          minItems: 6,
          maxItems: 12,
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["nav", "hero", "categories", "about", "services", "stats", "process", "gallery", "testimonials", "cta", "faq", "hours", "contact", "map", "footer"] },
              variant: { type: "string", enum: ["a", "b"] },
            },
            required: ["type", "variant"],
            additionalProperties: false,
          },
        },
      },
      required: ["blocks"],
      additionalProperties: false,
    },
  },
};

// ─── Tool 3: per-block content schemas (one tool per block type) ─────────────

const LINK = { type: "object", properties: { label: { type: "string" }, href: { type: "string" } }, required: ["label", "href"], additionalProperties: false };
const CTA = LINK;

const FILL_SCHEMAS: Record<string, any> = {
  nav: {
    type: "object",
    properties: {
      brand: { type: "string" },
      links: { type: "array", minItems: 2, maxItems: 5, items: LINK },
      cta: CTA,
    },
    required: ["brand", "links"],
    additionalProperties: false,
  },
  hero: {
    type: "object",
    properties: {
      eyebrow: { type: "string" },
      title: { type: "string" },
      subtitle: { type: "string" },
      primaryCta: CTA,
      secondaryCta: CTA,
      image: { type: "string" },
      imageAlt: { type: "string" },
    },
    required: ["title"],
    additionalProperties: false,
  },
  categories: {
    type: "object",
    properties: {
      eyebrow: { type: "string" },
      title: { type: "string" },
      items: {
        type: "array", minItems: 3, maxItems: 6,
        items: {
          type: "object",
          properties: { title: { type: "string" }, description: { type: "string" }, image: { type: "string" } },
          required: ["title"],
          additionalProperties: false,
        },
      },
    },
    required: ["title", "items"],
    additionalProperties: false,
  },
  about: {
    type: "object",
    properties: {
      eyebrow: { type: "string" },
      title: { type: "string" },
      body: { type: "string" },
      image: { type: "string" },
      imageAlt: { type: "string" },
      bullets: { type: "array", maxItems: 5, items: { type: "string" } },
    },
    required: ["title", "body"],
    additionalProperties: false,
  },
  services: {
    type: "object",
    properties: {
      eyebrow: { type: "string" },
      title: { type: "string" },
      subtitle: { type: "string" },
      items: {
        type: "array", minItems: 3, maxItems: 6,
        items: {
          type: "object",
          properties: { title: { type: "string" }, description: { type: "string" }, icon: { type: "string" } },
          required: ["title", "description"],
          additionalProperties: false,
        },
      },
    },
    required: ["title", "items"],
    additionalProperties: false,
  },
  stats: {
    type: "object",
    properties: {
      title: { type: "string" },
      items: {
        type: "array", minItems: 3, maxItems: 4,
        items: {
          type: "object",
          properties: { value: { type: "string" }, label: { type: "string" } },
          required: ["value", "label"],
          additionalProperties: false,
        },
      },
    },
    required: ["items"],
    additionalProperties: false,
  },
  process: {
    type: "object",
    properties: {
      eyebrow: { type: "string" },
      title: { type: "string" },
      steps: {
        type: "array", minItems: 3, maxItems: 5,
        items: {
          type: "object",
          properties: { title: { type: "string" }, description: { type: "string" } },
          required: ["title", "description"],
          additionalProperties: false,
        },
      },
    },
    required: ["title", "steps"],
    additionalProperties: false,
  },
  gallery: {
    type: "object",
    properties: {
      eyebrow: { type: "string" },
      title: { type: "string" },
      images: {
        type: "array", minItems: 3, maxItems: 5,
        items: {
          type: "object",
          properties: { src: { type: "string" }, alt: { type: "string" }, caption: { type: "string" } },
          required: ["src"],
          additionalProperties: false,
        },
      },
    },
    required: ["images"],
    additionalProperties: false,
  },
  testimonials: {
    type: "object",
    properties: {
      eyebrow: { type: "string" },
      title: { type: "string" },
      items: {
        type: "array", minItems: 2, maxItems: 3,
        items: {
          type: "object",
          properties: { quote: { type: "string" }, author: { type: "string" }, role: { type: "string" } },
          required: ["quote", "author"],
          additionalProperties: false,
        },
      },
    },
    required: ["items"],
    additionalProperties: false,
  },
  cta: {
    type: "object",
    properties: {
      title: { type: "string" },
      subtitle: { type: "string" },
      primaryCta: CTA,
      secondaryCta: CTA,
    },
    required: ["title", "primaryCta"],
    additionalProperties: false,
  },
  faq: {
    type: "object",
    properties: {
      eyebrow: { type: "string" },
      title: { type: "string" },
      items: {
        type: "array", minItems: 3, maxItems: 6,
        items: {
          type: "object",
          properties: { question: { type: "string" }, answer: { type: "string" } },
          required: ["question", "answer"],
          additionalProperties: false,
        },
      },
    },
    required: ["title", "items"],
    additionalProperties: false,
  },
  hours: {
    type: "object",
    properties: {
      title: { type: "string" },
      rows: {
        type: "array", minItems: 2, maxItems: 7,
        items: {
          type: "object",
          properties: { day: { type: "string" }, hours: { type: "string" } },
          required: ["day", "hours"],
          additionalProperties: false,
        },
      },
      note: { type: "string" },
    },
    required: ["rows"],
    additionalProperties: false,
  },
  contact: {
    type: "object",
    properties: {
      eyebrow: { type: "string" },
      title: { type: "string" },
      subtitle: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      address: { type: "string" },
    },
    required: ["title"],
    additionalProperties: false,
  },
  map: {
    type: "object",
    properties: { title: { type: "string" }, address: { type: "string" } },
    required: ["address"],
    additionalProperties: false,
  },
  footer: {
    type: "object",
    properties: {
      brand: { type: "string" },
      tagline: { type: "string" },
      columns: {
        type: "array", maxItems: 3,
        items: {
          type: "object",
          properties: { title: { type: "string" }, links: { type: "array", items: LINK } },
          required: ["title", "links"],
          additionalProperties: false,
        },
      },
      contact: {
        type: "object",
        properties: { email: { type: "string" }, phone: { type: "string" }, address: { type: "string" } },
        additionalProperties: false,
      },
      socials: { type: "array", items: LINK },
      copyright: { type: "string" },
    },
    required: ["brand"],
    additionalProperties: false,
  },
};

function fillToolFor(blockType: string) {
  return {
    type: "function",
    function: {
      name: `fill_${blockType}`,
      description: `Generate the content for the "${blockType}" block.`,
      parameters: FILL_SCHEMAS[blockType],
    },
  };
}
// ─── Prompts ─────────────────────────────────────────────────────────────────

function langName(code: string): string {
  return ({ es: "español", en: "inglés", fr: "francés" } as Record<string, string>)[code] || "español";
}

function buildBusinessContext(input: z.infer<typeof BodySchema>) {
  const contactEmail = input.businessEmail || input.email;
  const contactPhone = input.businessPhone || input.phone || "";
  const services = input.servicesList?.length
    ? input.servicesList.map((s) => `- ${s.name}: ${s.description}`).join("\n")
    : "(no proporcionados — invéntalos coherentes con el sector)";
  const socials: string[] = [];
  if (input.instagram) socials.push(`Instagram: https://instagram.com/${input.instagram.replace("@", "")}`);
  if (input.facebook) socials.push(`Facebook: ${input.facebook.startsWith("http") ? input.facebook : `https://${input.facebook}`}`);
  if (input.linkedin) socials.push(`LinkedIn: ${input.linkedin.startsWith("http") ? input.linkedin : `https://${input.linkedin}`}`);

  return {
    contactEmail,
    contactPhone,
    services,
    socials,
    text: `Negocio:
- Nombre: ${input.businessName}
- Sector: ${input.sector}
- Descripción: ${input.description}
- Slogan: ${input.slogan || "(genera uno apropiado si hace falta)"}
- Dirección: ${input.address || "(no disponible)"}
- Horario: ${input.businessHours || "(no disponible)"}
- Email: ${contactEmail}
- Teléfono: ${contactPhone || "(no disponible)"}
- Redes: ${socials.length ? socials.join(", ") : "(ninguna)"}

Servicios:
${services}`,
  };
}

function buildIdentityPrompts(input: z.infer<typeof BodySchema>) {
  const lang = langName(input.language);
  const moodCatalog = Object.entries(MOODS)
    .map(([id, m]) => `- ${id} (${m.label}): ${m.description}`)
    .join("\n");

  const system = `Eres un director creativo experto en branding para PYMES. Destila la esencia de un negocio y elige la dirección visual.
Idioma de salida: ${lang}.

Catálogo de moods:
${moodCatalog}

Reglas:
- "brandPositioning": declaración clara de posicionamiento (no slogan).
- "toneOfVoice": 2-5 adjetivos.
- "audience": cliente objetivo en una frase.
- "keyMessages": exactamente 3 propuestas de valor.
- "recommendedMood": el que mejor encaje. NO te repitas siempre con el mismo.
- "rationale": justificación breve interna.`;

  const ctx = buildBusinessContext(input);
  const user = `${ctx.text}\n\nDefine la identidad y elige el mood.`;
  return { system, user };
}

function buildSkeletonPrompts(input: z.infer<typeof BodySchema>, brief: any, mood: MoodId) {
  const ctx = buildBusinessContext(input);
  const pool = input.imagePool;
  const hasHours = !!input.businessHours;
  const hasAddress = !!input.address;
  const galleryReady = pool.gallery.length >= 3;

  const system = `Eres un director de arte web. Vas a elegir el ESQUELETO de bloques (solo type+variant, sin copy).

Mood elegido: ${mood}.
Bloques disponibles: nav, hero, categories, about, services, stats, process, gallery, testimonials, cta, faq, hours, contact, map, footer.
Variantes posibles: "a" o "b".

Reglas:
- Empieza SIEMPRE por "nav" y termina SIEMPRE por "footer".
- Segundo bloque SIEMPRE "hero".
- Total entre 7 y 11 bloques. Cada tipo máximo 1 vez.
- Solo incluye "hours" si hay horario disponible (${hasHours ? "SÍ" : "NO"}).
- Solo incluye "map" si hay dirección (${hasAddress ? "SÍ" : "NO"}).
- Solo incluye "gallery" si hay al menos 3 imágenes (${galleryReady ? "SÍ" : "NO"}).
- Adapta al sector "${input.sector}" (restauración: hours+map+gallery; consultoría: process+stats+faq; estética: gallery+services+testimonials; fitness: stats+process+testimonials).
- Alterna variantes "a"/"b" para evitar monotonía visual.`;

  const user = `${ctx.text}

Tono: ${brief.toneOfVoice.join(", ")}.
Posicionamiento: ${brief.brandPositioning}.

Elige el esqueleto.`;
  return { system, user };
}

function buildFillPrompts(
  input: z.infer<typeof BodySchema>,
  brief: any,
  mood: MoodId,
  blockType: string,
  variant: string,
  position: number,
  total: number,
) {
  const lang = langName(input.language);
  const ctx = buildBusinessContext(input);
  const pool = input.imagePool;

  const imageHints: Record<string, string> = {
    hero: `Si usas "image", elige UNA de: ${pool.hero.slice(0, 3).join(" | ") || "(ninguna disponible — omite el campo)"}`,
    about: `Si usas "image", elige UNA de: ${pool.about.slice(0, 2).join(" | ") || "(ninguna disponible — omite el campo)"}`,
    gallery: `Para "images.src" usa SOLO estas URLs (3-5 distintas): ${pool.gallery.slice(0, 6).join(" | ") || "(ninguna disponible)"}`,
    categories: `Si usas "image" en items, elige de: ${pool.gallery.slice(0, 4).join(" | ") || "(ninguna)"}. Mejor omitir si dudas.`,
    services: `Para "icon" usa nombres de iconos lucide-react: Sparkles, BookOpen, Calculator, Heart, Users, TrendingUp, Building2, Scissors, UtensilsCrossed, Dumbbell, Briefcase, Coffee, Leaf, Palette, Camera, Music, Wrench, Award, Shield, Target, Zap, Globe, Phone, Mail, MapPin, Clock.`,
  };

  const blockGuide: Record<string, string> = {
    nav: `Genera el menú. brand = "${input.businessName}". links exactamente 3: [{label:"Sobre nosotros",href:"#sobre-nosotros"},{label:"Servicios",href:"#servicios"},{label:"Contacto",href:"#contacto"}]. cta opcional con href "#contacto".`,
    hero: `Headline impactante (NO genérico) en máx 12 palabras. Subtitle en 1-2 frases. CTAs con href "#contacto" / "#servicios".`,
    categories: `4-6 categorías de público o tipos de cliente que atiende el negocio. Descripciones breves (máx 12 palabras).`,
    about: `Body en 2 párrafos separados por "\\n\\n". Bullets opcionales (2-4) con beneficios concretos.`,
    services: `3-6 servicios. Si el cliente proporcionó servicios, úsalos. Descripciones útiles (no relleno).`,
    stats: `3-4 números creíbles para el sector. Mejor cifras concretas que vagas.`,
    process: `3-5 pasos claros del recorrido del cliente. Títulos cortos, descripciones de 1 frase.`,
    gallery: `3-5 imágenes del pool. Captions opcionales y breves.`,
    testimonials: `2-3 testimonios CREÍBLES (puedes inventarlos), específicos del sector. Nombres realistas españoles, NO famosos. role describe el perfil.`,
    cta: `Llamada a la acción final. Title corto y persuasivo. primaryCta href "#contacto".`,
    faq: `3-6 preguntas reales que un cliente del sector se haría antes de contratar. Respuestas claras (1-3 frases).`,
    hours: `Convierte "${input.businessHours}" en filas day/hours. Si no hay datos, usa horario habitual del sector.`,
    contact: `email="${ctx.contactEmail}", phone="${ctx.contactPhone}", address="${input.address || ""}". Title invitador.`,
    map: `address="${input.address || ""}". Title invitador.`,
    footer: `brand="${input.businessName}". Tagline corto. 1-2 columns con links a anclas. contact con datos reales. socials si hay (${ctx.socials.length}).`,
  };

  const system = `Eres un copywriter web experto. Generas el contenido del bloque "${blockType}" (variante ${variant}) en posición ${position + 1}/${total} de la landing.

Idioma: ${lang}. Mood: ${mood}. Tono: ${brief.toneOfVoice.join(", ")}.

REGLAS:
- Copy específico del negocio, NUNCA genérico ni de relleno.
- Refleja los mensajes clave: ${brief.keyMessages.join(" | ")}.
- Devuelve SOLO la llamada a la herramienta fill_${blockType}.
- NO inventes URLs de imagen. Usa exclusivamente las del pool indicado abajo.

Guía del bloque:
${blockGuide[blockType] || ""}

${imageHints[blockType] || ""}`;

  const user = `${ctx.text}

Posicionamiento: ${brief.brandPositioning}.

Genera el contenido del bloque "${blockType}".`;

  return { system, user };
}

// ─── Block sanitization ──────────────────────────────────────────────────────

function uuid() {
  return crypto.randomUUID();
}

function sanitizeBlocks(rawBlocks: any[], pool: { all: string[] }) {
  const validTypes = new Set(["nav", "hero", "categories", "about", "services", "stats", "process", "gallery", "testimonials", "cta", "faq", "hours", "contact", "map", "footer"]);
  const allowedImages = new Set(pool.all);

  const cleanImg = (url: unknown): string | undefined => {
    if (typeof url !== "string") return undefined;
    if (allowedImages.has(url)) return url;
    // strip if AI invented one
    return undefined;
  };

  return rawBlocks
    .filter((b) => b && validTypes.has(b.type) && (b.variant === "a" || b.variant === "b") && b.content)
    .map((b) => {
      const c = { ...b.content };
      // scrub image fields per block type
      if (b.type === "hero") c.image = cleanImg(c.image);
      if (b.type === "about") c.image = cleanImg(c.image);
      if (b.type === "gallery" && Array.isArray(c.images)) {
        c.images = c.images
          .map((im: any) => ({ ...im, src: cleanImg(im?.src) }))
          .filter((im: any) => im.src);
      }
      if (b.type === "categories" && Array.isArray(c.items)) {
        c.items = c.items.map((it: any) => ({ ...it, image: cleanImg(it?.image) }));
      }
      if (b.type === "services" && Array.isArray(c.items)) {
        c.items = c.items.map((it: any) => ({ ...it, image: cleanImg(it?.image) }));
      }
      return { id: uuid(), type: b.type, variant: b.variant, content: c };
    });
}

// ─── Handler ─────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      console.error("Validation error:", JSON.stringify(parsed.error.flatten()));
      return new Response(JSON.stringify({ error: "Datos inválidos. Revisa los campos." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const input = parsed.data;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    // ── Step 1: identity ─────────────────────────────────────────────────────
    const ip = buildIdentityPrompts(input);
    const identity = await callAiTool(ip.system, ip.user, IDENTITY_TOOL, apiKey);

    const moodId: MoodId = (MOODS as any)[identity.recommendedMood] ? identity.recommendedMood : "minimal";
    const tokens = MOODS[moodId].tokens;

    const brief = {
      brandPositioning: identity.brandPositioning,
      toneOfVoice: identity.toneOfVoice,
      audience: identity.audience,
      keyMessages: identity.keyMessages,
      recommendedMood: moodId,
      rationale: identity.rationale,
    };

    // ── Step 2: skeleton (type + variant only) ───────────────────────────────
    const sp = buildSkeletonPrompts(input, brief, moodId);
    const skeletonResult = await callAiTool(sp.system, sp.user, SKELETON_TOOL, apiKey);
    const skeleton: { type: string; variant: string }[] = (skeletonResult.blocks || [])
      .filter((b: any) => b && FILL_SCHEMAS[b.type] && (b.variant === "a" || b.variant === "b"));

    if (skeleton.length < 4) throw new Error("AI returned too few skeleton blocks");

    // ── Step 3: fill each block in parallel ──────────────────────────────────
    const fills = await Promise.all(
      skeleton.map(async (b, i) => {
        try {
          const fp = buildFillPrompts(input, brief, moodId, b.type, b.variant, i, skeleton.length);
          const content = await callAiTool(fp.system, fp.user, fillToolFor(b.type), apiKey);
          return { type: b.type, variant: b.variant, content };
        } catch (err) {
          console.error(`Failed to fill block ${b.type}:`, err);
          return null;
        }
      }),
    );

    const cleanedBlocks = sanitizeBlocks(fills.filter(Boolean) as any[], input.imagePool);
    if (cleanedBlocks.length < 4) throw new Error("AI returned too few valid blocks");

    const site = {
      version: 2,
      brief,
      tokens,
      blocks: cleanedBlocks,
      meta: {
        businessName: input.businessName,
        sector: input.sector,
        language: input.language,
        generatedAt: new Date().toISOString(),
      },
    };

    return new Response(JSON.stringify({ success: true, site }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    const status = e?.status;
    if (status === 429) {
      return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Inténtalo de nuevo en unos segundos." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (status === 402) {
      return new Response(JSON.stringify({ error: "Créditos de IA agotados. Contacta con soporte." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("generate-site-v2 error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Error al generar el sitio." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
