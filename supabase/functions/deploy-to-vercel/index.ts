import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { project_id } = await req.json();
    if (!project_id) throw new Error("project_id is required");

    const VERCEL_TOKEN = (Deno.env.get("VERCEL_API_TOKEN") || "").trim();
    const VERCEL_TEAM_ID = (Deno.env.get("VERCEL_TEAM_ID") || "").trim();
    if (!VERCEL_TOKEN) throw new Error("VERCEL_API_TOKEN not configured");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: project, error: dbError } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("id", project_id)
      .single();

    if (dbError || !project) throw new Error("Project not found");

    const content = project.generated_content || {};

    // Use pre-generated HTML from the client (1:1 with preview)
    const finalHtml = content.finalHtml;

    if (!finalHtml) {
      throw new Error("No finalHtml found in generated_content. The project needs to be re-generated.");
    }

    const slug = slugify(project.business_name);
    const projectName = `pgr-${slug}`;

    const deployPayload = {
      name: projectName,
      files: [
        {
          file: "index.html",
          data: btoa(unescape(encodeURIComponent(finalHtml))),
          encoding: "base64",
        },
      ],
      projectSettings: { framework: null },
      target: "production",
    };

    console.log(`Deploying project ${projectName} to Vercel...`);

    const teamQuery = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : "";

    const deployRes = await fetch(`https://api.vercel.com/v13/deployments${teamQuery}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deployPayload),
    });

    const deployData = await deployRes.json();

    if (!deployRes.ok) {
      console.error("Vercel deploy error:", JSON.stringify(deployData));
      throw new Error(`Vercel deploy failed: ${deployData?.error?.message || deployRes.statusText}`);
    }

    const vercelProjectId = deployData.projectId;
    const deploymentUrl = deployData.url;

    console.log(`Deployed to ${deploymentUrl}, projectId: ${vercelProjectId}`);

    const finalUrl = `https://${projectName}.vercel.app`;

    await supabaseAdmin
      .from("projects")
      .update({
        vercel_url: finalUrl,
        vercel_project_id: vercelProjectId,
        status: "deployed",
      })
      .eq("id", project_id);

    return new Response(
      JSON.stringify({
        success: true,
        url: finalUrl,
        vercel_url: `https://${deploymentUrl}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("deploy-to-vercel error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Deployment failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
