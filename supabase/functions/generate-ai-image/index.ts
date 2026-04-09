import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.23.8";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RequestSchema = z.object({
  prompt: z.string().min(1).max(1000),
  fileName: z.string().min(1).max(200),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const input = RequestSchema.parse(body);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("API key not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config missing");

    // Generate image
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [{ role: "user", content: input.prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI image gen error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Image generation failed", url: null }), {
        status: 200, // Return 200 with null so client can handle gracefully
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const base64Data = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!base64Data) {
      console.error("No image data in response");
      return new Response(JSON.stringify({ error: "No image generated", url: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upload to storage
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const contentType = base64Data.startsWith("data:image/jpeg") ? "image/jpeg" : "image/png";
    const ext = contentType === "image/jpeg" ? "jpg" : "png";
    const fullPath = `generated/${input.fileName}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("project-photos")
      .upload(fullPath, bytes, { contentType, upsert: true });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Upload failed", url: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: publicData } = supabase.storage
      .from("project-photos")
      .getPublicUrl(fullPath);

    return new Response(JSON.stringify({ url: publicData?.publicUrl || null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Invalid input", url: null }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("generate-ai-image error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Error", url: null }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
