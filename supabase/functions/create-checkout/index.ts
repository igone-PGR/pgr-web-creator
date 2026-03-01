import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
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

const OptionalEmailSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().email().max(255).optional().nullable()
);

const ProjectSchema = z.object({
  businessName: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  sector: z.string().min(1).max(100),
  slogan: z.string().max(300).optional().nullable(),
  logo: z.string().max(500).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  instagram: z.string().max(100).optional().nullable(),
  facebook: z.string().max(200).optional().nullable(),
  email: z.string().email().max(255),
  phone: z.string().max(30).optional().nullable(),
  contactName: z.string().max(200).optional().nullable(),
  businessEmail: OptionalEmailSchema,
  businessPhone: z.string().max(30).optional().nullable(),
  businessHours: z.string().max(500).optional().nullable(),
  servicesList: z.array(ServiceSchema).max(50).optional().default([]),
  colorScheme: z.string().max(50).optional().default("Coral"),
  darkMode: z.boolean().optional().default(false),
});

const CheckoutRequestSchema = z.object({
  project: ProjectSchema,
  generatedContent: z.record(z.unknown()).optional().nullable(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { project, generatedContent } = CheckoutRequestSchema.parse(body);

    // Save project to DB first
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: savedProject, error: dbError } = await supabaseAdmin
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
        generated_content: generatedContent,
        paid: false,
      })
      .select("id")
      .single();

    if (dbError) throw new Error("Database error");

    // Create Stripe checkout session
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const requestOrigin = req.headers.get("origin");
    const referer = req.headers.get("referer");

    const baseUrl = (() => {
      try {
        if (requestOrigin) return new URL(requestOrigin).origin;
        if (referer) return new URL(referer).origin;
      } catch {
        // ignore and use fallback
      }
      return "https://pgr-web-creator.lovable.app";
    })();

    const session = await stripe.checkout.sessions.create({
      customer_email: project.email,
      line_items: [
        { price: "price_1T4ezHL3Sa5XsYOcVNfsSnTm", quantity: 1 },
      ],
      mode: "payment",
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&project_id=${savedProject.id}`,
      cancel_url: `${baseUrl}/?canceled=true`,
      metadata: {
        project_id: savedProject.id,
      },
    });

    // Save stripe session ID
    await supabaseAdmin
      .from("projects")
      .update({ stripe_session_id: session.id })
      .eq("id", savedProject.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Datos del formulario inválidos. Revisa los campos e inténtalo de nuevo." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.error("create-checkout error:", error);
    return new Response(
      JSON.stringify({ error: "No se pudo procesar la solicitud. Inténtalo de nuevo." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
