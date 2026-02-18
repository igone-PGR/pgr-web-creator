import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, description, sector, address, phone, email } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Eres un copywriter profesional especializado en crear contenido web para pequeños negocios en España. 
Generas textos persuasivos, profesionales y únicos que transmiten confianza y calidad.
NUNCA uses textos genéricos como "Lorem ipsum" o frases vacías.
Adapta el tono y vocabulario al sector del negocio.
Responde SOLO con el JSON solicitado, sin explicaciones adicionales.`;

    const userPrompt = `Genera el contenido web profesional para este negocio:

- Nombre: ${businessName}
- Sector: ${sector}
- Descripción: ${description}
- Dirección: ${address || "No proporcionada"}
- Teléfono: ${phone || "No proporcionado"}
- Email: ${email}

Devuelve un JSON con esta estructura exacta:
{
  "heroHeadline": "Título hero impactante de máximo 8 palabras",
  "heroSubtitle": "Subtítulo de 1-2 frases que complementa el headline y genera confianza",
  "heroCta": "Texto del botón CTA principal (máx 4 palabras)",
  "aboutTitle": "Título sección sobre nosotros",
  "aboutText": "Párrafo de 3-4 frases sobre el negocio, profesional y cercano",
  "features": [
    {"title": "Característica 1", "description": "Descripción breve y convincente"},
    {"title": "Característica 2", "description": "Descripción breve y convincente"},
    {"title": "Característica 3", "description": "Descripción breve y convincente"}
  ],
  "servicesTitle": "Título sección servicios",
  "services": [
    {"name": "Servicio 1", "description": "Descripción atractiva del servicio"},
    {"name": "Servicio 2", "description": "Descripción atractiva del servicio"},
    {"name": "Servicio 3", "description": "Descripción atractiva del servicio"},
    {"name": "Servicio 4", "description": "Descripción atractiva del servicio"}
  ],
  "contactTitle": "Título sección contacto",
  "contactSubtitle": "Subtítulo invitando al contacto",
  "footerTagline": "Frase corta de cierre para el footer"
}`;

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
              description: "Generate professional web content for a business",
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
                },
                required: [
                  "heroHeadline", "heroSubtitle", "heroCta",
                  "aboutTitle", "aboutText", "features",
                  "servicesTitle", "services",
                  "contactTitle", "contactSubtitle", "footerTagline",
                ],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_web_content" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiadas solicitudes. Inténtalo de nuevo en unos segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos agotados. Contacta con soporte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    let content;
    if (toolCall?.function?.arguments) {
      content = typeof toolCall.function.arguments === "string" 
        ? JSON.parse(toolCall.function.arguments) 
        : toolCall.function.arguments;
    } else {
      // Fallback: try to parse from message content
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
    console.error("generate-web-content error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
