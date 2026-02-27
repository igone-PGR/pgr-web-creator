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
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { businessName, description, sector, address, phone, email, slogan, businessHours, servicesList, hasPhotos, photoCount } = GenerateContentSchema.parse(body);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    const systemPrompt = `Eres un diseñador web y copywriter de élite. Tu trabajo es crear webs únicas y memorables para pequeños negocios en España.
NO REPITAS NUNCA el mismo estilo. Cada web debe tener una PERSONALIDAD VISUAL PROPIA basada en el negocio.
Piensa como un diseñador de Dribbble/Awwwards: layouts creativos, tipografías con carácter, jerarquía visual potente.
Adapta el tono, la energía y la estética al sector y la personalidad del negocio.
Un café hipster necesita un diseño diferente a un bufete de abogados. Una peluquería urbana es diferente a un spa de lujo.
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

IMPORTANTE sobre el diseño:
- heroStyle: elige el que mejor encaje con el negocio y sus fotos
  · "fullscreen": imagen a pantalla completa con texto superpuesto (ideal si hay fotos)
  · "split": mitad texto, mitad imagen, lado a lado
  · "minimal-center": texto centrado sin imagen de fondo, muy limpio
  · "text-left-image-right": asimétrico, texto grande a la izquierda
  · "gradient-overlay": fondo con degradado de color intenso

- layoutStyle: la personalidad general
  · "editorial": elegante, mucho espacio, tipografía grande
  · "bold": colores intensos, contrastes fuertes, impactante
  · "minimal": limpio, mucho blanco, preciso
  · "organic": formas suaves, colores cálidos, natural
  · "brutalist": raw, tipografía oversized, dramático

- fontPair: elige combinaciones que NO sean genéricas. Opciones de heading:
  "Space Grotesk", "Playfair Display", "Clash Display", "Cabinet Grotesk", "Syne", "DM Serif Display", "Outfit", "Unbounded"
  Body: "Inter", "DM Sans", "Satoshi", "General Sans", "Plus Jakarta Sans"

- serviceLayout: varía según el número de servicios y el estilo
- photoLayout: cómo se disponen las fotos del cliente
- animationStyle: el estilo de animación de scroll
- heroHeight: "full" (100vh), "tall" (85vh), "medium" (65vh)
- borderRadius: "sharp" (4px), "rounded" (16-24px), "pill" (9999px)
- accentGradient: si el estilo lo pide, un degradado CSS como "linear-gradient(135deg, #color1, #color2)". null si es mejor color sólido.
- decorativeElements: true si el diseño se beneficia de formas abstractas decorativas

Devuelve el JSON con textos Y decisiones de diseño.`;

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
              description: "Generate professional web content and design decisions for a unique business website",
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
                  design: {
                    type: "object",
                    properties: {
                      heroStyle: { type: "string", enum: ["fullscreen", "split", "minimal-center", "text-left-image-right", "gradient-overlay"] },
                      layoutStyle: { type: "string", enum: ["editorial", "bold", "minimal", "organic", "brutalist"] },
                      fontPair: {
                        type: "object",
                        properties: {
                          heading: { type: "string" },
                          body: { type: "string" },
                        },
                        required: ["heading", "body"],
                      },
                      sectionOrder: { type: "array", items: { type: "string" } },
                      serviceLayout: { type: "string", enum: ["cards", "list", "numbered-large", "timeline"] },
                      photoLayout: { type: "string", enum: ["masonry", "fullbleed-alternating", "grid", "overlap-collage"] },
                      animationStyle: { type: "string", enum: ["fade-up", "slide-in", "scale-pop", "stagger-cascade"] },
                      heroHeight: { type: "string", enum: ["full", "tall", "medium"] },
                      borderRadius: { type: "string", enum: ["sharp", "rounded", "pill"] },
                      accentGradient: { type: ["string", "null"] },
                      decorativeElements: { type: "boolean" },
                    },
                    required: ["heroStyle", "layoutStyle", "fontPair", "sectionOrder", "serviceLayout", "photoLayout", "animationStyle", "heroHeight", "borderRadius", "accentGradient", "decorativeElements"],
                  },
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
      console.error("AI gateway error:", response.status);
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
