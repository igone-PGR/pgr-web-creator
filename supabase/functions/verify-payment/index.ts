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

const CALENDAR_LINK = "https://calendar.app.google/NmeuL6F9Mt3qKx4b9";

const EXTRAS = [
  { name: "E-commerce", price: "400€", description: "Tienda online con catálogo y pasarela de pago" },
  { name: "Agenda de citas / Reservas", price: "250€", description: "Sistema de reservas online integrado" },
  { name: "Diseño extra (2 rondas de revisiones)", price: "A consultar", description: "Diseño personalizado con 2 rondas de revisiones adicionales" },
  { name: "Logo + Manual de marca", price: "150€", description: "Logotipo profesional y manual de identidad" },
];

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
        .select("business_name, email, sector, contact_name, phone, vercel_url")
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

      // Send email to CLIENT with their web URL and next steps
      try {
        const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

        if (project?.email) {
          const siteUrl = project.vercel_url || "En proceso de publicación...";
          const hasUrl = !!project.vercel_url;

          const extrasHtml = EXTRAS.map(e => `
            <tr>
              <td style="padding:10px 16px;border-bottom:1px solid #eee;font-weight:600;color:#1a1a1a;">${e.name}</td>
              <td style="padding:10px 16px;border-bottom:1px solid #eee;color:#555;">${e.description}</td>
              <td style="padding:10px 16px;border-bottom:1px solid #eee;font-weight:700;color:#FF6B4A;white-space:nowrap;">${e.price}</td>
            </tr>
          `).join("");

          await resend.emails.send({
            from: "PGR Web Creator <onboarding@resend.dev>",
            to: [project.email],
            subject: `🎉 ¡Tu web ya está publicada! — ${project.business_name}`,
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f7f7f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#131313 0%,#2a2a2a 100%);border-radius:16px 16px 0 0;padding:40px 32px;text-align:center;">
      <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px;">🎉 ¡Enhorabuena!</h1>
      <p style="color:#ffffffcc;font-size:16px;margin:0;">Tu web profesional ya está online</p>
    </div>

    <!-- Main content -->
    <div style="background:#ffffff;padding:32px;border-radius:0 0 16px 16px;border:1px solid #e8e7e3;border-top:none;">
      
      <p style="font-size:15px;color:#333;line-height:1.6;">
        Hola${project.contact_name ? ` ${project.contact_name}` : ""},
      </p>
      <p style="font-size:15px;color:#333;line-height:1.6;">
        Ya tienes tu web de <strong>${project.business_name}</strong> publicada y accesible para todo el mundo.
      </p>

      <!-- URL Box -->
      ${hasUrl ? `
      <div style="background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
        <p style="margin:0 0 8px;font-size:13px;color:#555;font-weight:600;">🌐 TU WEB ESTÁ EN:</p>
        <a href="${siteUrl}" target="_blank" style="font-size:18px;color:#22c55e;font-weight:bold;text-decoration:none;">${siteUrl}</a>
      </div>
      ` : `
      <div style="background:#fefce8;border:2px solid #f59e0b;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
        <p style="margin:0;font-size:14px;color:#92400e;">⏳ Tu web se está desplegando. Te enviaremos el enlace en breve.</p>
      </div>
      `}

      <!-- Changes round -->
      <div style="background:#f8f7f4;border-radius:12px;padding:24px;margin:24px 0;">
        <h2 style="font-size:18px;color:#1a1a1a;margin:0 0 12px;">✏️ Tu ronda de cambios incluida</h2>
        <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 16px;">
          Tu web incluye <strong>1 ronda de cambios gratuita</strong>. Para solicitar tus modificaciones:
        </p>
        <ol style="font-size:14px;color:#555;line-height:1.8;margin:0 0 16px;padding-left:20px;">
          <li>Agenda una cita con Igone para mostrarle los cambios que necesitas</li>
          <li>Realizaremos los ajustes y te los enviaremos para tu aprobación</li>
        </ol>
        <div style="text-align:center;">
          <a href="${CALENDAR_LINK}" target="_blank" style="display:inline-block;padding:14px 28px;background:#FF6B4A;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:bold;font-size:14px;">
            📅 Agendar cita con Igone
          </a>
        </div>
      </div>

      <!-- Extras -->
      <div style="margin:32px 0 0;">
        <h2 style="font-size:18px;color:#1a1a1a;margin:0 0 8px;">🚀 Potencia tu web con extras premium</h2>
        <p style="font-size:14px;color:#555;margin:0 0 16px;">¿Quieres ir más allá? Añade funcionalidades extra a tu web:</p>
        <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #e8e7e3;">
          <thead>
            <tr style="background:#f8f7f4;">
              <th style="padding:10px 16px;text-align:left;font-size:13px;color:#888;font-weight:600;">Extra</th>
              <th style="padding:10px 16px;text-align:left;font-size:13px;color:#888;font-weight:600;">Descripción</th>
              <th style="padding:10px 16px;text-align:left;font-size:13px;color:#888;font-weight:600;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${extrasHtml}
          </tbody>
        </table>
        <p style="font-size:14px;color:#555;margin:16px 0 0;text-align:center;">
          ¿Te interesa algún extra? Responde a este email o contáctanos en <a href="mailto:hello@pgrdigital.tech" style="color:#FF6B4A;font-weight:600;">hello@pgrdigital.tech</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e8e7e3;text-align:center;">
        <p style="font-size:12px;color:#999;margin:0;">
          © ${new Date().getFullYear()} PGR Digital · <a href="https://pgrdigital.tech" style="color:#999;">pgrdigital.tech</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
            `,
          });
          console.log(`Client email sent to ${project.email}`);
        }
      } catch (clientEmailError) {
        console.error("Failed to send client email:", clientEmailError);
      }

      // Fetch deployed URL
      const { data: updatedProject } = await supabaseAdmin
        .from("projects")
        .select("vercel_url")
        .eq("id", project_id)
        .single();

      return new Response(
        JSON.stringify({ success: true, paid: true, deployed_url: updatedProject?.vercel_url || null }),
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
