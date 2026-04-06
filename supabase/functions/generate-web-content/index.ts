import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.23.8";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

// Extract image placeholders from template HTML
function extractImageSlots(html: string): { index: number; alt: string; dataAlt: string }[] {
  const slots: { index: number; alt: string; dataAlt: string }[] = [];
  const imgRegex = /<img[^>]*>/gi;
  let match;
  let idx = 0;
  while ((match = imgRegex.exec(html)) !== null) {
    const tag = match[0];
    const altMatch = tag.match(/\balt="([^"]*)"/i);
    const dataAltMatch = tag.match(/\bdata-alt="([^"]*)"/i);
    slots.push({
      index: idx++,
      alt: altMatch?.[1] || "",
      dataAlt: dataAltMatch?.[1] || "",
    });
  }
  return slots;
}

// Generate a single image using AI
async function generateImage(
  prompt: string,
  apiKey: string
): Promise<string | null> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      console.error("Image gen error:", response.status);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    return imageUrl || null;
  } catch (e) {
    console.error("Image generation failed:", e);
    return null;
  }
}

// Upload base64 image to Supabase storage
async function uploadToStorage(
  supabase: ReturnType<typeof createClient>,
  base64Data: string,
  fileName: string
): Promise<string | null> {
  try {
    // Extract the actual base64 content
    const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const contentType = base64Data.startsWith("data:image/jpeg") ? "image/jpeg" : "image/png";
    const ext = contentType === "image/jpeg" ? "jpg" : "png";
    const fullPath = `generated/${fileName}.${ext}`;

    const { error } = await supabase.storage
      .from("project-photos")
      .upload(fullPath, bytes, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from("project-photos")
      .getPublicUrl(fullPath);

    return publicData?.publicUrl || null;
  } catch (e) {
    console.error("Upload failed:", e);
    return null;
  }
}

// Generate all images for a template
async function generateAllImages(
  slots: { index: number; alt: string; dataAlt: string }[],
  businessName: string,
  sector: string,
  description: string,
  apiKey: string,
  supabase: ReturnType<typeof createClient>
): Promise<string[]> {
  const urls: string[] = [];
  const timestamp = Date.now();

  // Generate in batches of 3 to avoid rate limits
  for (let i = 0; i < slots.length; i += 3) {
    const batch = slots.slice(i, i + 3);
    const promises = batch.map(async (slot) => {
      const context = slot.dataAlt || slot.alt || `imagen profesional para ${sector}`;
      const prompt = `Generate a high-quality, professional photograph for a ${sector} business called "${businessName}". The image should depict: ${context}. Business description: ${description}. Style: modern, clean, commercial photography quality. NO text, NO watermarks, NO logos in the image.`;

      const base64 = await generateImage(prompt, apiKey);
      if (!base64) return null;

      const fileName = `${timestamp}_img_${slot.index}`;
      const publicUrl = await uploadToStorage(supabase, base64, fileName);
      return publicUrl;
    });

    const results = await Promise.all(promises);
    urls.push(...results.map((r) => r || ""));

    // Small delay between batches to avoid rate limiting
    if (i + 3 < slots.length) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  return urls;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const input = GenerateContentSchema.parse(body);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config missing");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

    // --- IMAGE HANDLING ---
    let photoInstructions: string;
    const imageSlots = extractImageSlots(input.templateHtml);
    console.log(`Found ${imageSlots.length} image slots in template`);

    if (input.photoUrls.length > 0) {
      // Client provided photos - use them
      photoInstructions = `FOTOS DEL CLIENTE: El cliente ha subido ${input.photoUrls.length} fotos. Reemplaza los atributos src="" de las etiquetas <img> con estas URLs en orden:
${input.photoUrls.map((url, i) => `  Foto ${i + 1}: ${url}`).join("\n")}
Si hay más imágenes en la plantilla que fotos del cliente, reutiliza las fotos del cliente cíclicamente.
NUNCA inventes URLs de imagen.`;
    } else if (imageSlots.length > 0) {
      // No client photos - generate with AI
      console.log("Generating AI images for", imageSlots.length, "slots...");
      const generatedUrls = await generateAllImages(
        imageSlots,
        input.businessName,
        input.sector,
        input.description,
        LOVABLE_API_KEY,
        supabase
      );

      const validUrls = generatedUrls.filter((u) => u);
      console.log(`Generated ${validUrls.length}/${imageSlots.length} images`);

      if (validUrls.length > 0) {
        photoInstructions = `IMÁGENES GENERADAS POR IA: Se han generado ${validUrls.length} imágenes para este negocio. Reemplaza los atributos src="" de las etiquetas <img> con estas URLs en el MISMO ORDEN en que aparecen las imágenes en la plantilla:
${generatedUrls.map((url, i) => `  Imagen ${i + 1}: ${url || "MANTENER_ORIGINAL"}`).join("\n")}
Para las imágenes marcadas como MANTENER_ORIGINAL, mantén el src original de la plantilla.
NUNCA inventes URLs de imagen. Usa SOLO las URLs proporcionadas aquí.`;
      } else {
        photoInstructions = `NO SE PUDIERON GENERAR IMÁGENES: Mantén TODAS las URLs de imágenes existentes en la plantilla EXACTAMENTE como están. NO modifiques ningún atributo src.`;
      }
    } else {
      photoInstructions = `NO HAY IMÁGENES EN LA PLANTILLA.`;
    }

    const logoInstruction = input.logoUrl
      ? `LOGO: El cliente tiene un logo. Donde haya un logo o nombre de marca como imagen, usa esta URL: ${input.logoUrl}`
      : "LOGO: No hay logo. Usa solo texto para el nombre del negocio.";

    const systemPrompt = `Eres un experto en personalización de plantillas HTML. Tu trabajo es tomar una plantilla HTML existente y reemplazar TODO el contenido placeholder (textos, información de contacto, nombre del negocio) con los datos reales del cliente, manteniendo EXACTAMENTE la misma estructura HTML, CSS, clases y diseño visual.

REGLAS CRÍTICAS:
1. NO modifiques la estructura HTML, CSS, clases de Tailwind, estilos, ni el diseño de ninguna manera.
2. NO añadas ni elimines secciones, divs, ni elementos HTML.
3. SOLO reemplaza el contenido de texto dentro de las etiquetas, los atributos alt de imágenes, y los atributos src de las imágenes SOLO si se proporcionan URLs de reemplazo.
4. Todo el texto debe estar en ${lang}.
5. Genera textos profesionales, persuasivos y adaptados al sector "${input.sector}".
6. Los testimonios deben sonar naturales y creíbles para el sector.
7. Mantén el mismo número de elementos (servicios, testimonios, etc.) que la plantilla original.
8. Asegúrate de que los datos de contacto reales aparezcan en las secciones de contacto/footer.

IMÁGENES - MUY IMPORTANTE:
9. Sigue EXACTAMENTE las instrucciones de imágenes proporcionadas abajo. Reemplaza los src="" SOLO con las URLs proporcionadas.
10. NUNCA inventes URLs de imagen. NUNCA uses URLs como "https://example.com/..." o "https://placeholder.com/...".
11. Si se te indica mantener la original, copia el src exacto carácter por carácter.

NAVEGACIÓN - MUY IMPORTANTE:
12. La web DEBE ser una single-page con scroll suave. TODOS los enlaces del menú de navegación superior deben ser anclas internas que hagan scroll a secciones de la MISMA página.
13. El menú de navegación DEBE tener exactamente estos 3 enlaces: "Sobre nosotros" (href="#sobre-nosotros"), "Servicios" (href="#servicios"), "Contacto" (href="#contacto").
14. Añade los atributos id correspondientes a las secciones de la plantilla: id="sobre-nosotros" en la sección de descripción/about, id="servicios" en la sección de servicios, id="contacto" en la sección de contacto/formulario.
15. Si el menú original tiene enlaces a otras páginas (href="about.html", href="services.html", etc.), cámbialos TODOS por las anclas internas (#sobre-nosotros, #servicios, #contacto).
16. Elimina cualquier enlace del menú que apunte a páginas externas o subpáginas. Solo deben quedar los 3 enlaces de ancla interna.
17. Si la plantilla no tiene smooth scroll, añade este CSS al <head>: html { scroll-behavior: smooth; }

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
