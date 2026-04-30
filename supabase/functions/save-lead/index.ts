// save-lead: persists a generated-but-unpaid project as a "lead" so admins can
// follow up. Called by the client right after generate-site-v2 succeeds.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ServiceSchema = z.object({
  name: z.string().max(200),
  description: z.string().max(1000),
});

const ProjectSchema = z.object({
  businessName: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  sector: z.string().min(1).max(100),
  slogan: z.string().max(300).optional().nullable(),
  logo: z.string().max(2000).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  instagram: z.string().max(200).optional().nullable(),
  facebook: z.string().max(200).optional().nullable(),
  email: z.string().email().max(255),
  phone: z.string().max(30).optional().nullable(),
  contactName: z.string().max(200).optional().nullable(),
  businessEmail: z.string().max(255).optional().nullable(),
  businessPhone: z.string().max(30).optional().nullable(),
  businessHours: z.string().max(500).optional().nullable(),
  servicesList: z.array(ServiceSchema).max(50).optional().default([]),
  colorScheme: z.string().max(50).optional().nullable(),
  darkMode: z.boolean().optional().nullable(),
  preferredDomain: z.string().max(255).optional().nullable(),
  language: z.string().max(10).optional().nullable(),
  photos: z.array(z.string()).max(20).optional().default([]),
});

const BodySchema = z.object({
  project: ProjectSchema,
  generatedContent: z.record(z.unknown()).optional().nullable(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      console.error("Validation error:", JSON.stringify(parsed.error.flatten()));
      return new Response(
        JSON.stringify({ error: "Datos inválidos." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { project, generatedContent } = parsed.data;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data, error } = await supabaseAdmin
      .from("projects")
      .insert({
        business_name: project.businessName,
        description: project.description,
        sector: project.sector,
        slogan: project.slogan || null,
        logo: project.logo || null,
        address: project.address || null,
        instagram: project.instagram || null,
        facebook: project.facebook || null,
        email: project.email,
        phone: project.phone || null,
        contact_name: project.contactName || null,
        business_email: project.businessEmail || null,
        business_phone: project.businessPhone || null,
        business_hours: project.businessHours || null,
        services_list: project.servicesList || [],
        color_scheme: project.colorScheme || "Coral",
        dark_mode: project.darkMode || false,
        generated_content: generatedContent ?? null,
        preferred_domain: project.preferredDomain || null,
        language: project.language || "es",
        photos: project.photos || [],
        paid: false,
        status: "lead",
      })
      .select("id")
      .single();

    if (error) {
      console.error("DB error:", error);
      return new Response(
        JSON.stringify({ error: "No se pudo guardar el lead." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("save-lead error:", err);
    return new Response(
      JSON.stringify({ error: "Error interno." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
