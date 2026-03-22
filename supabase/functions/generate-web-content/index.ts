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
  templateHtml: z.string().min(1).max(200000),
  businessName: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  sector: z.string().min(1).max(100),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email().max(255),
  businessEmail: z.string().max(255).optional().nullable(),
  businessPhone: z.string().max(30).optional().nullable(),
  slogan: z.string().max(300).optional().nullable(),
  businessHours: z.string().max(500).optional().nullable(),
  servicesList: z.array(ServiceSchema).max(50).optional().nullable(),
  instagram: z.string().max(100).optional().nullable(),
  facebook: z.string().max(200).optional().nullable(),
  photoUrls: z.array(z.string()).max(50).optional().default([]),
  logoUrl: z.string().max(2000).optional().nullable(),
  language: z.string().max(10).optional().default("es"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const input = GenerateContentSchema.parse(body);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    const langMap: Record<string, string> = {
      es: "español",
      en: "inglés (English)",
      fr: "francés (Français)",
    };
    const lang = langMap[input.language || "es"] || "español";

    const contactEmail = input.businessEmail || input.email;
    const contactPhone = input.businessPhone || input.phone;

    const servicesContext = input.servicesList?.length
      ? input.servicesList.map((s) => `${s.name}: ${s.description}`).join("; ")
      : "";

    const instagramUrl = input.instagram
      ? `https://instagram.com/${input.instagram.replace("@", "")}`
      : "";
    const facebookUrl = input.facebook || "";

    // Build photo replacement instructions
    const photoInstructions = input.photoUrls.length > 0
      ? `FOTOS DEL CLIENTE: El cliente ha subido ${input.photoUrls.length} fotos. Reemplaza las URLs de imagen existentes (src="https://lh3.googleusercontent.com/...") con estas URLs en orden:
${input.photoUrls.map((url, i) => `  Foto ${i + 1}: ${url}`).join("\n")}
Si hay más imágenes en la plantilla que fotos del cliente, reutiliza las fotos del cliente cíclicamente.`
      : `NO HAY FOTOS DEL CLIENTE: Mantén las imágenes placeholder existentes de la plantilla tal cual.`;

    const logoInstruction = input.logoUrl
      ? `LOGO: El cliente tiene un logo. Donde haya un logo o nombre de marca como imagen, usa esta URL: ${input.logoUrl}`
      : "LOGO: No hay logo. Usa solo texto para el nombre del negocio.";

    const systemPrompt = `Eres un experto en personalización de plantillas HTML. Tu trabajo es tomar una plantilla HTML existente y reemplazar TODO el contenido placeholder (textos, información de contacto, nombre del negocio) con los datos reales del cliente, manteniendo EXACTAMENTE la misma estructura HTML, CSS, clases y diseño visual.

REGLAS CRÍTICAS:
1. NO modifiques la estructura HTML, CSS, clases de Tailwind, estilos, ni el diseño de ninguna manera.
2. NO añadas ni elimines secciones, divs, ni elementos HTML.
3. SOLO reemplaza el contenido de texto y atributos src/href/alt de imágenes.
4. Todo el texto debe estar en ${lang}.
5. Genera textos profesionales, persuasivos y adaptados al sector "${input.sector}".
6. Los testimonios deben sonar naturales y creíbles para el sector.
7. Mantén el mismo número de elementos (servicios, testimonios, etc.) que la plantilla original.
8. Asegúrate de que los datos de contacto reales aparezcan en las secciones de contacto/footer.

NAVEGACIÓN - MUY IMPORTANTE:
9. La web DEBE ser una single-page con scroll suave. TODOS los enlaces del menú de navegación superior deben ser anclas internas que hagan scroll a secciones de la MISMA página.
10. El menú de navegación DEBE tener exactamente estos 3 enlaces: "Sobre nosotros" (href="#sobre-nosotros"), "Servicios" (href="#servicios"), "Contacto" (href="#contacto").
11. Añade los atributos id correspondientes a las secciones de la plantilla: id="sobre-nosotros" en la sección de descripción/about, id="servicios" en la sección de servicios, id="contacto" en la sección de contacto/formulario.
12. Si el menú original tiene enlaces a otras páginas (href="about.html", href="services.html", etc.), cámbialos TODOS por las anclas internas (#sobre-nosotros, #servicios, #contacto).
13. Elimina cualquier enlace del menú que apunte a páginas externas o subpáginas. Solo deben quedar los 3 enlaces de ancla interna.
14. Si la plantilla no tiene smooth scroll, añade este CSS al <head>: html { scroll-behavior: smooth; }

RESPONDE SOLO CON EL HTML COMPLETO PERSONALIZADO, nada más. Sin explicaciones, sin bloques de código markdown.`;

    const userPrompt = `Personaliza esta plantilla HTML con los datos del siguiente negocio:

DATOS DEL NEGOCIO:
- Nombre: ${input.businessName}
- Sector: ${input.sector}
- Descripción: ${input.description}
- Slogan: ${input.slogan || "Generar uno apropiado"}
- Dirección: ${input.address || "No proporcionada"}
- Email de contacto: ${contactEmail}
- Teléfono/WhatsApp: ${contactPhone || "No proporcionado"}
- Horario: ${input.businessHours || "No proporcionado"}
- Servicios: ${servicesContext || "Generar servicios apropiados para el sector"}
- Instagram: ${instagramUrl || "No tiene"}
- Facebook: ${facebookUrl || "No tiene"}

${logoInstruction}
${photoInstructions}

PLANTILLA HTML A PERSONALIZAR:
${input.templateHtml}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Inténtalo de nuevo." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados. Contacta con soporte." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", status, await response.text());
      return new Response(JSON.stringify({ error: "Error al generar el contenido." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    let html = aiData.choices?.[0]?.message?.content || "";

    // Clean markdown code fences if the model wraps it
    html = html.replace(/^```html?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

    if (!html.includes("<!DOCTYPE") && !html.includes("<html")) {
      throw new Error("AI did not return valid HTML");
    }

    return new Response(JSON.stringify({ success: true, html }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      console.error("Validation error:", JSON.stringify(e.errors));
      return new Response(JSON.stringify({ error: "Datos inválidos. Revisa los campos." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("generate-web-content error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Error al generar el contenido." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
