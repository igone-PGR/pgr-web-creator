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

// ─── Tool 2: blocks ──────────────────────────────────────────────────────────

const LINK_SCHEMA = {
  type: "object",
  properties: { label: { type: "string" }, href: { type: "string" } },
  required: ["label", "href"],
  additionalProperties: false,
};

const CTA_SCHEMA = {
  type: "object",
  properties: { label: { type: "string" }, href: { type: "string" } },
  required: ["label", "href"],
  additionalProperties: false,
};

// Union content schema: every possible field across all block types is optional here.
// The system prompt tells the model which fields belong to which block type.
const CONTENT_SCHEMA = {
  type: "object",
  properties: {
    // common
    eyebrow: { type: "string" },
    title: { type: "string" },
    subtitle: { type: "string" },
    // nav / footer
    brand: { type: "string" },
    tagline: { type: "string" },
    links: { type: "array", items: LINK_SCHEMA },
    cta: CTA_SCHEMA,
    columns: {
      type: "array",
      items: {
        type: "object",
        properties: { title: { type: "string" }, links: { type: "array", items: LINK_SCHEMA } },
        required: ["title", "links"],
        additionalProperties: false,
      },
    },
    socials: { type: "array", items: LINK_SCHEMA },
    copyright: { type: "string" },
    // hero / cta
    primaryCta: CTA_SCHEMA,
    secondaryCta: CTA_SCHEMA,
    image: { type: "string" },
    imageAlt: { type: "string" },
    // about
    body: { type: "string" },
    bullets: { type: "array", items: { type: "string" } },
    // services / categories (items)
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          icon: { type: "string" },
          image: { type: "string" },
          // stats
          value: { type: "string" },
          label: { type: "string" },
          // testimonials
          quote: { type: "string" },
          author: { type: "string" },
          role: { type: "string" },
          // faq
          question: { type: "string" },
          answer: { type: "string" },
        },
        additionalProperties: false,
      },
    },
    // process
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: { title: { type: "string" }, description: { type: "string" } },
        required: ["title", "description"],
        additionalProperties: false,
      },
    },
    // gallery
    images: {
      type: "array",
      items: {
        type: "object",
        properties: { src: { type: "string" }, alt: { type: "string" }, caption: { type: "string" } },
        required: ["src"],
        additionalProperties: false,
      },
    },
    // hours
    rows: {
      type: "array",
      items: {
        type: "object",
        properties: { day: { type: "string" }, hours: { type: "string" } },
        required: ["day", "hours"],
        additionalProperties: false,
      },
    },
    note: { type: "string" },
    // contact / map
    email: { type: "string" },
    phone: { type: "string" },
    address: { type: "string" },
    embedUrl: { type: "string" },
    // footer.contact
    contact: {
      type: "object",
      properties: { email: { type: "string" }, phone: { type: "string" }, address: { type: "string" } },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

const BLOCKS_TOOL = {
  type: "function",
  function: {
    name: "compose_site_blocks",
    description: "Compose the ordered list of website blocks with copy and structured content.",
    parameters: {
      type: "object",
      properties: {
        blocks: {
          type: "array",
          minItems: 6,
          maxItems: 14,
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["nav", "hero", "categories", "about", "services", "stats", "process", "gallery", "testimonials", "cta", "faq", "hours", "contact", "map", "footer"],
              },
              variant: { type: "string", enum: ["a", "b"] },
              content: CONTENT_SCHEMA,
            },
            required: ["type", "variant", "content"],
            additionalProperties: false,
          },
        },
      },
      required: ["blocks"],
      additionalProperties: false,
    },
  },
};

// ─── Prompts ─────────────────────────────────────────────────────────────────

function langName(code: string): string {
  return ({ es: "español", en: "inglés", fr: "francés" } as Record<string, string>)[code] || "español";
}

function buildIdentityPrompts(input: z.infer<typeof BodySchema>) {
  const lang = langName(input.language);

  const moodCatalog = Object.entries(MOODS)
    .map(([id, m]) => `- ${id} (${m.label}): ${m.description}`)
    .join("\n");

  const system = `Eres un director creativo experto en branding para PYMES. Tu trabajo es destilar la esencia de un negocio y elegir la dirección visual adecuada.

Idioma de salida: ${lang}.

Catálogo de moods disponibles:
${moodCatalog}

Reglas:
- "brandPositioning" debe ser una declaración clara de posicionamiento, no un slogan.
- "toneOfVoice" son 2-5 adjetivos que describen cómo habla la marca (ej. "cercano", "experto", "directo").
- "audience" describe al cliente objetivo en una frase.
- "keyMessages" son exactamente 3 propuestas de valor que la web debe transmitir.
- "recommendedMood" debe encajar con el sector, el tono y la audiencia. NO repitas siempre el mismo mood.
- "rationale" justifica brevemente la elección (uso interno, no aparece en la web).`;

  const user = `Negocio:
- Nombre: ${input.businessName}
- Sector: ${input.sector}
- Descripción: ${input.description}
- Slogan del cliente: ${input.slogan || "ninguno"}
- Servicios: ${input.servicesList?.length ? input.servicesList.map((s) => s.name).join(", ") : "no especificados"}
- Ubicación: ${input.address || "no especificada"}

Define la identidad y elige el mood.`;

  return { system, user };
}

function buildBlocksPrompts(
  input: z.infer<typeof BodySchema>,
  brief: any,
  mood: MoodId,
) {
  const lang = langName(input.language);
  const pool = input.imagePool;

  const contactEmail = input.businessEmail || input.email;
  const contactPhone = input.businessPhone || input.phone || "";
  const services = input.servicesList?.length
    ? input.servicesList.map((s) => `- ${s.name}: ${s.description}`).join("\n")
    : "(no proporcionados — invéntalos coherentes con el sector y la descripción)";

  const socials: string[] = [];
  if (input.instagram) socials.push(`Instagram: https://instagram.com/${input.instagram.replace("@", "")}`);
  if (input.facebook) socials.push(`Facebook: ${input.facebook.startsWith("http") ? input.facebook : `https://${input.facebook}`}`);
  if (input.linkedin) socials.push(`LinkedIn: ${input.linkedin.startsWith("http") ? input.linkedin : `https://${input.linkedin}`}`);

  const imageGuide = `IMÁGENES DISPONIBLES (URLs reales, NUNCA inventes otras):
- Hero (1-3): ${pool.hero.slice(0, 3).join(" | ") || "(ninguna)"}
- About (1-2): ${pool.about.slice(0, 2).join(" | ") || "(ninguna)"}
- Gallery (3-5): ${pool.gallery.slice(0, 6).join(" | ") || "(ninguna)"}
Si un bloque necesita una imagen y no hay disponible, omite el campo o el bloque entero.`;

  const system = `Eres un director de arte web. Vas a componer una landing page completa eligiendo bloques de una biblioteca tipada.

Idioma: ${lang}. Mood elegido: ${mood} (ya está aplicado por design tokens; no decidas colores).

BIBLIOTECA DE BLOQUES (cada uno con variantes "a" o "b"):
1. nav        — content: { brand: string, links: [{label,href}], cta?: {label,href} }
2. hero       — content: { eyebrow?, title, subtitle?, primaryCta?:{label,href}, secondaryCta?:{label,href}, image?, imageAlt? }
3. categories — content: { eyebrow?, title, items: [{title, description?, image?}] (4-6) }
4. about      — content: { eyebrow?, title, body (markdown-lite, párrafos con \\n\\n), image?, imageAlt?, bullets?: string[] (2-4) }
5. services   — content: { eyebrow?, title, subtitle?, items: [{title, description, icon?, image?}] (3-6). icon es nombre lucide ej "Sparkles","BookOpen","Calculator","Heart","Users","TrendingUp","Building2","Scissors","UtensilsCrossed","Dumbbell","Briefcase" }
6. stats      — content: { title?, items: [{value, label}] (3-4) }
7. process    — content: { eyebrow?, title, steps: [{title, description}] (3-5) }
8. gallery    — content: { eyebrow?, title?, images: [{src, alt?, caption?}] (3-5) }
9. testimonials — content: { eyebrow?, title?, items: [{quote, author, role?}] (2-3) }
10. cta       — content: { title, subtitle?, primaryCta:{label,href}, secondaryCta?:{label,href} }
11. faq       — content: { eyebrow?, title, items: [{question, answer}] (3-5) }
12. hours     — content: { title?, rows: [{day, hours}] (3-7), note? }
13. contact   — content: { eyebrow?, title, subtitle?, email?, phone?, address? }
14. map       — content: { title?, address }
15. footer    — content: { brand, tagline?, columns?: [{title, links:[{label,href}]}] (1-3), contact?:{email?,phone?,address?}, socials?:[{label,href}], copyright? }

REGLAS DE COMPOSICIÓN:
- Empieza SIEMPRE por "nav" y termina SIEMPRE por "footer".
- Usa "hero" como segundo bloque.
- Elige entre 6 y 14 bloques en total. Cada tipo aparece máximo 1 vez (excepto si tiene mucho sentido). Mejor pocos bloques de gran calidad que muchos vacíos.
- Selecciona variantes ("a" o "b") alternando para evitar monotonía visual.
- Adapta los bloques al sector: restauración suele incluir hours+map+gallery; consultoría incluye process+stats+faq; estética incluye gallery+services; fitness incluye stats+process+testimonials.
- Solo incluye "hours" si hay horario disponible. Solo "map" si hay dirección. Solo "contact" con datos reales.
- "testimonials" pueden inventarse (es habitual), suenan creíbles y específicos del sector. NO uses nombres famosos.
- Los enlaces de nav/footer deben apuntar a anclas internas: #sobre-nosotros, #servicios, #contacto. La href del CTA principal va a #contacto.
- Todo el copy debe estar en ${lang}, ser específico del negocio (no genérico), y reflejar el tono: ${brief.toneOfVoice.join(", ")}.
- Mensajes clave a transmitir: ${brief.keyMessages.join(" | ")}.
- NO inventes URLs de imagen. Usa solo las del pool proporcionado.

Devuelve SOLO la llamada a la herramienta compose_site_blocks.`;

  const user = `Negocio:
- Nombre: ${input.businessName}
- Sector: ${input.sector}
- Descripción: ${input.description}
- Slogan: ${input.slogan || "(generar uno apropiado)"}
- Posicionamiento: ${brief.brandPositioning}
- Audiencia: ${brief.audience}

Servicios:
${services}

Contacto:
- Email: ${contactEmail}
- Teléfono: ${contactPhone || "(no disponible)"}
- Dirección: ${input.address || "(no disponible)"}
- Horario: ${input.businessHours || "(no disponible)"}
- Redes: ${socials.length ? socials.join(", ") : "(ninguna)"}

${imageGuide}

Compón la landing.`;

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

    // ── Step 2: blocks ───────────────────────────────────────────────────────
    const bp = buildBlocksPrompts(input, brief, moodId);
    const blocksResult = await callAiTool(bp.system, bp.user, BLOCKS_TOOL, apiKey);

    const cleanedBlocks = sanitizeBlocks(blocksResult.blocks || [], input.imagePool);
    if (cleanedBlocks.length < 4) {
      throw new Error("AI returned too few valid blocks");
    }

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
