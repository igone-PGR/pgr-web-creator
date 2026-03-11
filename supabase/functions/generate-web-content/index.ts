import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
});

const colorPaletteSchema = {
  type: "object" as const,
  properties: {
    bg: { type: "string" as const, description: "Page background color (hex)" },
    bgAlt: { type: "string" as const, description: "Alternate section background (hex)" },
    card: { type: "string" as const, description: "Card/surface background (hex)" },
    text1: { type: "string" as const, description: "Primary text color (hex)" },
    text2: { type: "string" as const, description: "Secondary/muted text color (hex)" },
    border: { type: "string" as const, description: "Border color (hex)" },
    accent: { type: "string" as const, description: "Primary accent/brand color (hex)" },
    accentText: { type: "string" as const, description: "Text color on accent background (hex)" },
  },
  required: ["bg", "bgAlt", "card", "text1", "text2", "border", "accent", "accentText"],
};

const designSchema = {
  type: "object" as const,
  properties: {
    heroStyle: { type: "string" as const, enum: ["fullscreen", "split", "minimal-center", "text-left-image-right", "gradient-overlay"] },
    layoutStyle: { type: "string" as const, enum: ["editorial", "bold", "minimal", "organic", "brutalist"] },
    navStyle: { type: "string" as const, enum: ["transparent", "solid", "minimal", "centered", "hidden"] },
    footerStyle: { type: "string" as const, enum: ["minimal", "columns", "centered", "banner"] },
    fontPair: {
      type: "object" as const,
      properties: {
        heading: { type: "string" as const },
        body: { type: "string" as const },
      },
      required: ["heading", "body"],
    },
    sectionOrder: { type: "array" as const, items: { type: "string" as const } },
    serviceLayout: { type: "string" as const, enum: ["cards", "list", "numbered-large", "timeline"] },
    photoLayout: { type: "string" as const, enum: ["masonry", "fullbleed-alternating", "grid", "overlap-collage"] },
    animationStyle: { type: "string" as const, enum: ["fade-up", "slide-in", "scale-pop", "stagger-cascade"] },
    heroHeight: { type: "string" as const, enum: ["full", "tall", "medium"] },
    borderRadius: { type: "string" as const, enum: ["sharp", "rounded", "pill"] },
    accentGradient: { type: ["string", "null"] as const },
    decorativeElements: { type: "boolean" as const },
    colors: colorPaletteSchema,
    darkMode: { type: "boolean" as const, description: "Whether to use a dark color scheme" },
  },
  required: ["heroStyle", "layoutStyle", "navStyle", "footerStyle", "fontPair", "sectionOrder", "serviceLayout", "photoLayout", "animationStyle", "heroHeight", "borderRadius", "accentGradient", "decorativeElements", "colors", "darkMode"],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { businessName, description, sector, address, phone, email, slogan, businessHours, servicesList, hasPhotos, photoCount, language } = GenerateContentSchema.parse(body);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    const langMap: Record<string, string> = {
      es: "español", en: "inglés (English)", fr: "francés (Français)", multi: "multilingüe (secciones en español con traducción al inglés y francés)",
    };
    const langInstruction = `IDIOMA: Escribe TODOS los textos de la web en ${langMap[language || "es"] || "español"}.`;

    const systemPrompt = `Eres un diseñador web y copywriter de élite. Tu trabajo es crear webs RADICALMENTE DIFERENTES y memorables para cada negocio.
CADA WEB DEBE SER TOTALMENTE ÚNICA. No hay plantilla. Tú decides TODO: colores, si es oscura o clara, la estructura, el orden de las secciones, qué secciones incluir o excluir.

${langInstruction}

REGLAS DE DISEÑO LIBRE:
- Elige una paleta de colores COMPLETA y ÚNICA para cada negocio. No uses siempre los mismos colores.
- Decide si el sitio es oscuro o claro según la personalidad del negocio.
- Un bar de copas nocturno → paleta oscura, neones. Una floristería → tonos cálidos naturales. Un estudio de diseño → monocromático minimalista. Un restaurante mexicano → colores vibrantes saturados.
- Varía SIEMPRE el orden de las secciones. No pongas siempre hero→features→about.
- Puedes OMITIR secciones que no aporten (ej: si no tiene sentido "features" para un bar, no la incluyas).
- Secciones disponibles: hero, features, about, photos, services, contact. Usa mínimo 3, máximo 6.
- Varía navStyle: "transparent" (sin fondo), "solid" (fondo sólido), "minimal" (solo logo+cta), "centered" (logo centrado), "hidden" (sin nav visible).
- Varía footerStyle: "minimal" (una línea), "columns" (info organizada en columnas), "centered" (centrado con tagline), "banner" (gran banner de cierre).
- Experimenta con combinaciones tipográficas arriesgadas.
- Los colores del accent deben tener buen contraste con accentText.
- Los textos de servicios deben ser concisos y de tamaño estándar, NUNCA como cabeceras grandes.
- Piensa como un diseñador de Dribbble/Awwwards: cada web debe sorprender.
Responde SOLO con el JSON solicitado, sin explicaciones.`;

    const servicesContext = servicesList?.length
      ? `\n- Servicios: ${servicesList.map((s) => `${s.name} (${s.description})`).join(", ")}`
      : "";

    const photosContext = hasPhotos
      ? `\n- El cliente ha subido ${photoCount} fotos de su negocio. Diseña el layout para que las fotos sean PROTAGONISTAS.`
      : `\n- No hay fotos propias. Usa un diseño que funcione sin imágenes del negocio (tipografía potente, colores, formas).`;

    const userPrompt = `Diseña una web ÚNICA para este negocio:

- Nombre: ${businessName}
- Sector: ${sector}
- Descripción: ${description}
- Dirección: ${address || "No proporcionada"}
- Teléfono: ${phone || "No proporcionado"}
- Email: ${email}
- Slogan: ${slogan || "No proporcionado"}
- Horario: ${businessHours || "No proporcionado"}${servicesContext}${photosContext}

DECISIONES DE DISEÑO que debes tomar:

1. PALETA DE COLORES (colors): Crea una paleta COMPLETA y ÚNICA.
   - bg: color de fondo principal
   - bgAlt: fondo de secciones alternas
   - card: fondo de tarjetas
   - text1: color de texto principal
   - text2: color de texto secundario
   - border: color de bordes
   - accent: color de acento/marca (el más importante, define la identidad)
   - accentText: texto sobre el acento
   IMPORTANTE: Los colores deben ser COHERENTES entre sí y reflejar la personalidad del negocio.

2. darkMode: true/false - ¿es un sitio oscuro o claro? Decide según el negocio.

3. heroStyle: elige el que mejor encaje
   · "fullscreen": imagen a pantalla completa con texto superpuesto
   · "split": mitad texto, mitad imagen
   · "minimal-center": texto centrado, muy limpio
   · "text-left-image-right": asimétrico
   · "gradient-overlay": fondo con degradado de color intenso

4. layoutStyle: "editorial" | "bold" | "minimal" | "organic" | "brutalist"

5. navStyle: "transparent" | "solid" | "minimal" | "centered" | "hidden"

6. footerStyle: "minimal" | "columns" | "centered" | "banner"

7. fontPair: combinaciones NO genéricas.
   Headings: "Space Grotesk", "Playfair Display", "Syne", "DM Serif Display", "Outfit", "Unbounded"
   Body: "Inter", "DM Sans", "Plus Jakarta Sans"

8. sectionOrder: el ORDEN y SELECCIÓN de secciones. No uses siempre el mismo. Mínimo 3 secciones.

9. serviceLayout: "cards" | "list" | "numbered-large" | "timeline"
10. photoLayout: "masonry" | "fullbleed-alternating" | "grid" | "overlap-collage"
11. animationStyle: "fade-up" | "slide-in" | "scale-pop" | "stagger-cascade"
12. heroHeight: "full" | "tall" | "medium"
13. borderRadius: "sharp" | "rounded" | "pill"
14. accentGradient: CSS gradient o null
15. decorativeElements: true/false

Devuelve textos Y todas las decisiones de diseño.`;

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
              description: "Generate unique web content and design decisions",
              parameters: {
                type: "object",
                properties: {
                  heroHeadline: { type: "string" },
                  heroSubtitle: { type: "string" },
                  heroCta: { type: "string" },
                  aboutTitle: { type: "string" },
                  aboutText: { type: "string" },
                  features: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                      },
                      required: ["title", "description"],
                    },
                  },
                  servicesTitle: { type: "string" },
                  services: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                      },
                      required: ["name", "description"],
                    },
                  },
                  contactTitle: { type: "string" },
                  contactSubtitle: { type: "string" },
                  footerTagline: { type: "string" },
                  design: designSchema,
                },
                required: [
                  "heroHeadline", "heroSubtitle", "heroCta",
                  "aboutTitle", "aboutText", "features",
                  "servicesTitle", "services",
                  "contactTitle", "contactSubtitle", "footerTagline",
                  "design",
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
        return new Response(
          JSON.stringify({ error: "Demasiadas solicitudes. Inténtalo de nuevo en unos segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos agotados. Contacta con soporte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI gateway error:", status);
      return new Response(
        JSON.stringify({ error: "Error al generar el contenido. Inténtalo de nuevo." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    let content;
    if (toolCall?.function?.arguments) {
      content = typeof toolCall.function.arguments === "string"
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

    return new Response(JSON.stringify({ success: true, content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Datos del negocio inválidos. Revisa los campos e inténtalo de nuevo." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.error("generate-web-content error:", e);
    return new Response(
      JSON.stringify({ error: "Error al generar el contenido. Inténtalo de nuevo." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
