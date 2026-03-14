import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_DARK_COLOR = "#131313";
const HEX_COLOR_REGEX = /^#([0-9a-f]{6})$/i;

const DEFAULT_COLOR_PALETTE = {
  bg: "#FAFAF9",
  bgAlt: "#F3F2EF",
  card: "#FFFFFF",
  text1: "#131313",
  text2: "#5F5F5F",
  border: "#E8E7E3",
  accent: "#F48763",
  accentText: "#FFFFFF",
  accentDark: BASE_DARK_COLOR,
};

const normalizeHex = (value?: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return HEX_COLOR_REGEX.test(trimmed) ? trimmed.toUpperCase() : null;
};

const getContrastText = (hex: string) => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#131313" : "#FFFFFF";
};

const sanitizePalette = (palette: Record<string, unknown> | null | undefined, corporateColors: string[]) => {
  const preferredAccent = normalizeHex(corporateColors[0]);
  const accent = preferredAccent || normalizeHex(palette?.accent) || DEFAULT_COLOR_PALETTE.accent;

  return {
    bg: normalizeHex(palette?.bg) || DEFAULT_COLOR_PALETTE.bg,
    bgAlt: normalizeHex(palette?.bgAlt) || DEFAULT_COLOR_PALETTE.bgAlt,
    card: normalizeHex(palette?.card) || DEFAULT_COLOR_PALETTE.card,
    text1: normalizeHex(palette?.text1) || DEFAULT_COLOR_PALETTE.text1,
    text2: normalizeHex(palette?.text2) || DEFAULT_COLOR_PALETTE.text2,
    border: normalizeHex(palette?.border) || DEFAULT_COLOR_PALETTE.border,
    accent,
    accentText: preferredAccent
      ? getContrastText(accent)
      : normalizeHex(palette?.accentText) || getContrastText(accent),
    accentDark: BASE_DARK_COLOR,
  };
};

const ServiceSchema = z.object({
  name: z.string().max(100),
  description: z.string().max(500),
});

const GenerateContentSchema = z.object({
  businessName: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  sector: z.string().min(1).max(100),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email().max(255),
  slogan: z.string().max(300).optional().nullable(),
  businessHours: z.string().max(500).optional().nullable(),
  servicesList: z.array(ServiceSchema).max(50).optional().nullable(),
  hasPhotos: z.boolean().optional().default(false),
  photoCount: z.number().int().min(0).max(50).optional().default(0),
  language: z.string().max(10).optional().default("es"),
  corporateColors: z.array(z.string().regex(/^#([0-9a-fA-F]{6})$/)).max(5).optional().default([]),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      businessName,
      description,
      sector,
      address,
      phone,
      email,
      slogan,
      businessHours,
      servicesList,
      hasPhotos,
      photoCount,
      language,
      corporateColors,
    } = GenerateContentSchema.parse(body);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    const langMap: Record<string, string> = {
      es: "español",
      en: "inglés (English)",
      fr: "francés (Français)",
    };
    const langInstruction = `IDIOMA: Escribe TODOS los textos en ${langMap[language || "es"] || "español"}.`;

    const corporateColorsText = corporateColors.length
      ? corporateColors.join(", ")
      : "No proporcionados";

    const systemPrompt = `Eres un copywriter y diseñador web de élite. Generas contenido textual profesional y una paleta de colores ÚNICA para cada negocio.

${langInstruction}

REGLAS:
- Genera textos persuasivos, profesionales y adaptados al sector del negocio.
- Genera la paleta siempre con base oscura fija: accentDark = ${BASE_DARK_COLOR}.
- Si hay colores corporativos del cliente, usa el primero como accent principal.
- Asegura contraste alto entre accent/accentDark y accentText.
- Los testimonios deben sonar naturales y creíbles.
- Las FAQ deben ser relevantes para el tipo de negocio.
- Los textos de servicios deben ser concisos (1-2 frases).
- Genera entre 3-5 FAQ relevantes.
- Genera 3 testimonios creíbles.
- Genera 4 categorías/valores destacados con iconos.
- Iconos disponibles: star, heart, shield, award, zap, check, users, target, sparkles.
Responde SOLO con el JSON solicitado.`;

    const servicesContext = servicesList?.length
      ? `\n- Servicios: ${servicesList.map((s) => `${s.name} (${s.description})`).join(", ")}`
      : "";

    const userPrompt = `Genera contenido web para:
- Nombre: ${businessName}
- Sector: ${sector}
- Descripción: ${description}
- Slogan: ${slogan || "No proporcionado"}
- Dirección: ${address || "No proporcionada"}
- Teléfono: ${phone || "No proporcionado"}
- Email: ${email}
- Horario: ${businessHours || "No proporcionado"}${servicesContext}
- Tiene ${photoCount} fotos propias: ${hasPhotos ? "sí" : "no"}
- Colores corporativos del cliente: ${corporateColorsText}

Genera:
1. Textos para hero, about, servicios, CTA, features, testimonios, FAQ, contacto y footer.
2. Una paleta de colores con: bg, bgAlt, card, text1, text2, border, accent, accentText, accentDark.
   - accentDark debe ser exactamente ${BASE_DARK_COLOR}.
   - accent debe ser el primer color corporativo si está disponible.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_web_content",
              description: "Generate web content and color palette for a business website",
              parameters: {
                type: "object",
                properties: {
                  heroHeadline: { type: "string" },
                  heroSubtitle: { type: "string" },
                  heroCta: { type: "string" },
                  heroStats: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { value: { type: "string" }, label: { type: "string" } },
                      required: ["value", "label"],
                    },
                  },
                  categories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { title: { type: "string" }, icon: { type: "string" } },
                      required: ["title", "icon"],
                    },
                  },
                  aboutTitle: { type: "string" },
                  aboutText: { type: "string" },
                  aboutHighlights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { title: { type: "string" }, description: { type: "string" } },
                      required: ["title", "description"],
                    },
                  },
                  servicesTitle: { type: "string" },
                  servicesSubtitle: { type: "string" },
                  services: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { name: { type: "string" }, description: { type: "string" } },
                      required: ["name", "description"],
                    },
                  },
                  ctaTitle: { type: "string" },
                  ctaSubtitle: { type: "string" },
                  ctaCta: { type: "string" },
                  ctaStats: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { value: { type: "string" }, label: { type: "string" } },
                      required: ["value", "label"],
                    },
                  },
                  featuresTitle: { type: "string" },
                  featuresSubtitle: { type: "string" },
                  features: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { title: { type: "string" }, description: { type: "string" } },
                      required: ["title", "description"],
                    },
                  },
                  testimonials: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { name: { type: "string" }, text: { type: "string" }, rating: { type: "number" } },
                      required: ["name", "text", "rating"],
                    },
                  },
                  faq: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { question: { type: "string" }, answer: { type: "string" } },
                      required: ["question", "answer"],
                    },
                  },
                  contactTitle: { type: "string" },
                  contactSubtitle: { type: "string" },
                  footerTagline: { type: "string" },
                  colors: {
                    type: "object",
                    properties: {
                      bg: { type: "string" },
                      bgAlt: { type: "string" },
                      card: { type: "string" },
                      text1: { type: "string" },
                      text2: { type: "string" },
                      border: { type: "string" },
                      accent: { type: "string" },
                      accentText: { type: "string" },
                      accentDark: { type: "string" },
                    },
                    required: ["bg", "bgAlt", "card", "text1", "text2", "border", "accent", "accentText", "accentDark"],
                  },
                },
                required: [
                  "heroHeadline",
                  "heroSubtitle",
                  "heroCta",
                  "heroStats",
                  "categories",
                  "aboutTitle",
                  "aboutText",
                  "aboutHighlights",
                  "servicesTitle",
                  "servicesSubtitle",
                  "services",
                  "ctaTitle",
                  "ctaSubtitle",
                  "ctaCta",
                  "ctaStats",
                  "featuresTitle",
                  "featuresSubtitle",
                  "features",
                  "testimonials",
                  "faq",
                  "contactTitle",
                  "contactSubtitle",
                  "footerTagline",
                  "colors",
                ],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_web_content" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Inténtalo de nuevo." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados. Contacta con soporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", status);
      return new Response(JSON.stringify({ error: "Error al generar el contenido." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    let content;
    if (toolCall?.function?.arguments) {
      content =
        typeof toolCall.function.arguments === "string"
          ? JSON.parse(toolCall.function.arguments)
          : toolCall.function.arguments;
    } else {
      const msg = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = msg.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response");
      }
    }

    content.colors = sanitizePalette(content.colors, corporateColors);

    return new Response(JSON.stringify({ success: true, content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Datos inválidos. Revisa los campos." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("generate-web-content error:", e);
    return new Response(JSON.stringify({ error: "Error al generar el contenido." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});