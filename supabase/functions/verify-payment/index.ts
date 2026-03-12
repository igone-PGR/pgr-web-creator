import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VerifyPaymentSchema = z.object({
  session_id: z.string().min(1).max(500),
  project_id: z.string().uuid(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { session_id, project_id } = VerifyPaymentSchema.parse(body);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      await supabaseAdmin
        .from("projects")
        .update({
          paid: true,
          stripe_payment_status: "paid",
        })
        .eq("id", project_id);

      // Trigger automatic deployment to Vercel
      try {
        const deployUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/deploy-to-vercel`;
        const deployRes = await fetch(deployUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ project_id }),
        });
        const deployData = await deployRes.json();
        if (deployData.success) {
          console.log(`Auto-deployed to: ${deployData.url}`);
        } else {
          console.error("Auto-deploy failed:", deployData.error);
        }
      } catch (deployErr) {
        console.error("Failed to trigger auto-deploy:", deployErr);
      }

      const { data: project } = await supabaseAdmin
        .from("projects")
        .select("business_name, email, sector, contact_name, phone")
        .eq("id", project_id)
        .single();

      // Send notification email to admin
      try {
        const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
        const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");

        if (adminEmail && project) {
          await resend.emails.send({
            from: "PGR Web Creator <onboarding@resend.dev>",
            to: [adminEmail],
            subject: `💰 Nuevo pago recibido: ${project.business_name}`,
            html: `
              <h1>¡Nuevo pago recibido!</h1>
              <p>Se ha completado un pago para un nuevo proyecto web.</p>
              <table style="border-collapse:collapse;margin:16px 0;">
                <tr><td style="padding:8px;font-weight:bold;">Negocio:</td><td style="padding:8px;">${project.business_name}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;">Contacto:</td><td style="padding:8px;">${project.contact_name || "—"}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;">Email cliente:</td><td style="padding:8px;">${project.email}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;">Teléfono:</td><td style="padding:8px;">${project.phone || "—"}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;">Sector:</td><td style="padding:8px;">${project.sector}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;">ID Proyecto:</td><td style="padding:8px;">${project_id}</td></tr>
              </table>
              <p><a href="https://webcreator.pgrdigital.tech/admin/login" style="display:inline-block;padding:12px 24px;background-color:#FF6B4A;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;">Ir al panel de administración</a></p>
            `,
          });
        }
      } catch (emailError) {
        console.error("Failed to send admin notification email:", emailError);
      }

      return new Response(
        JSON.stringify({ success: true, paid: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, paid: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Datos de verificación inválidos." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.error("verify-payment error:", error);
    return new Response(
      JSON.stringify({ error: "No se pudo verificar el pago. Inténtalo de nuevo." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
