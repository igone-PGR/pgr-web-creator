import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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
    const { project, generatedContent } = await req.json();

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

    if (dbError) throw new Error(`DB error: ${dbError.message}`);

    // Create Stripe checkout session
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.create({
      customer_email: project.email,
      line_items: [
        { price: "price_1T4ezHL3Sa5XsYOcVNfsSnTm", quantity: 1 },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}&project_id=${savedProject.id}`,
      cancel_url: `${req.headers.get("origin")}/?canceled=true`,
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
    console.error("create-checkout error:", error);
    return new Response(
      JSON.stringify({ error: "No se pudo procesar la solicitud. Inténtalo de nuevo." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
