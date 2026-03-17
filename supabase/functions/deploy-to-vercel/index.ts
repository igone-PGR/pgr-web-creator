import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(text: string | null | undefined): string {
  if (!text) return "";
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function sanitizeHref(url: string): string {
  try {
    const raw = url.startsWith("http") ? url : `https://${url}`;
    const parsed = new URL(raw);
    if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) return "#";
    return escapeHtml(parsed.href);
  } catch {
    return "#";
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);
}

function generateSiteFiles(project: any) {
  const content = project.generated_content || {};
  const design = content.design || {};
  const colors = content.colors || design.colors || {};
  const dark = design.darkMode ?? project.dark_mode;

  const bg = colors.bg || (dark ? "#0A0A0F" : "#FAFAF9");
  const bgAlt = colors.bgAlt || (dark ? "#111118" : "#F3F2EF");
  const card = colors.card || (dark ? "#16161F" : "#FFFFFF");
  const text1 = colors.text1 || (dark ? "#F5F5F0" : "#131313");
  const text2 = colors.text2 || (dark ? "#8A8A95" : "#5F5F5F");
  const border = colors.border || (dark ? "#222230" : "#E8E7E3");
  const accent = colors.accent || "#FF6B4A";
  const accentText = colors.accentText || "#FFFFFF";

  const fontPair = design.fontPair || { heading: "Plus Jakarta Sans", body: "Plus Jakarta Sans" };
  const borderRadius = design.borderRadius === "sharp" ? "0" : design.borderRadius === "pill" ? "9999px" : "1.5rem";

  const services = content.services || [];
  const features = content.features || [];
  const testimonials = content.testimonials || [];
  const faq = content.faq || [];
  const photos: string[] = project.photos || [];
  const logo: string | null = project.logo || null;

  const webEmail = project.business_email || project.email;
  const webPhone = project.business_phone || project.phone;
  const lang = project.language || "es";

  // --- Photo grid for hero ---
  const heroPhotosHtml = photos.length > 0 ? `
    <div class="hero-photos">
      <img src="${escapeHtml(photos[0])}" alt="${escapeHtml(project.business_name)}" class="hero-photo-main" />
      ${photos.length > 1 ? `<div class="hero-photos-row">
        ${photos.slice(1, 3).map(p => `<img src="${escapeHtml(p)}" alt="" class="hero-photo-sm" />`).join("")}
      </div>` : ""}
    </div>
  ` : `<div class="hero-placeholder"><span>✦</span></div>`;

  // --- About photo ---
  const aboutPhoto = photos.length > 0 ? `
    <img src="${escapeHtml(photos[Math.min(1, photos.length - 1)])}" alt="${escapeHtml(project.business_name)}" class="about-photo" />
  ` : `<div class="about-placeholder"></div>`;

  // --- Services ---
  const servicesHtml = services.map((s: any, i: number) => {
    const photoUrl = photos.length > 0 ? photos[i % photos.length] : null;
    const imgHtml = photoUrl
      ? `<div class="service-img"><img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(s.name)}" /></div>`
      : `<div class="service-img service-placeholder"><span>✦</span></div>`;
    return `
    <div class="service-card">
      ${imgHtml}
      <div class="service-body">
        <h3>${escapeHtml(s.name)}</h3>
        <p>${escapeHtml(s.description)}</p>
      </div>
    </div>`;
  }).join("");

  const featuresHtml = features.map((f: any, i: number) => `
    <div class="feature-card ${i === 0 ? "feature-wide" : ""}">
      <h3>${escapeHtml(f.title)}</h3>
      <p>${escapeHtml(f.description)}</p>
    </div>`).join("");

  const testimonialsHtml = testimonials.map((t: any) => `
    <div class="testimonial-card">
      <div class="testimonial-stars">${"★".repeat(t.rating || 5)}</div>
      <p class="testimonial-text">"${escapeHtml(t.text)}"</p>
      <p class="testimonial-name">— ${escapeHtml(t.name)}</p>
    </div>`).join("");

  const faqHtml = faq.map((f: any) => `
    <details class="faq-item">
      <summary>${escapeHtml(f.question)}</summary>
      <p>${escapeHtml(f.answer)}</p>
    </details>`).join("");

  // --- Photo gallery section ---
  const galleryHtml = photos.length > 3 ? `
  <section class="gallery">
    <p class="section-tag">Galería</p>
    <div class="gallery-grid">
      ${photos.slice(0, 8).map(p => `<img src="${escapeHtml(p)}" alt="" class="gallery-img" />`).join("")}
    </div>
  </section>` : "";

  const contactItems = [
    webEmail ? `<a href="mailto:${escapeHtml(webEmail)}" class="contact-item">📧 ${escapeHtml(webEmail)}</a>` : "",
    webPhone ? `<a href="https://wa.me/${escapeHtml(webPhone.replace(/\D/g, ""))}" class="contact-item" target="_blank">💬 WhatsApp: ${escapeHtml(webPhone)}</a>` : "",
    project.address ? `<div class="contact-item">📍 ${escapeHtml(project.address)}</div>` : "",
    project.business_hours ? `<div class="contact-item">🕐 ${escapeHtml(project.business_hours)}</div>` : "",
  ].filter(Boolean).join("\n");

  const socialLinks = [
    project.instagram ? `<a href="${sanitizeHref(`https://instagram.com/${project.instagram.replace("@", "")}`)}" target="_blank">Instagram</a>` : "",
    project.facebook ? `<a href="${sanitizeHref(project.facebook)}" target="_blank">Facebook</a>` : "",
  ].filter(Boolean).join(" · ");

  const logoHtml = logo ? `<img src="${escapeHtml(logo)}" alt="${escapeHtml(project.business_name)}" class="nav-logo" />` : "";

  const html = `<!DOCTYPE html>
<html lang="${escapeHtml(lang)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(project.business_name)}</title>
  <meta name="description" content="${escapeHtml(content.heroSubtitle || project.description)}">
  <link rel="stylesheet" href="styles.css">
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontPair.heading)}:wght@400;500;600;700;900&family=${encodeURIComponent(fontPair.body)}:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>
  <nav>
    <div class="nav-brand">
      ${logoHtml}
      <span class="logo">${escapeHtml(project.business_name)}</span>
    </div>
    <div class="nav-links">
      <a href="#about">${lang === "en" ? "About" : "Nosotros"}</a>
      <a href="#services">${lang === "en" ? "Services" : "Servicios"}</a>
      <a href="#contact">${lang === "en" ? "Contact" : "Contacto"}</a>
    </div>
    <a href="mailto:${escapeHtml(webEmail)}" class="nav-cta">${lang === "en" ? "Contact" : "Contactar"} →</a>
  </nav>

  <section class="hero">
    <div class="hero-content">
      <div class="hero-text">
        <p class="hero-tag">${escapeHtml(project.slogan || project.sector)}</p>
        <h1>${escapeHtml(content.heroHeadline || project.business_name)}</h1>
        <p class="hero-sub">${escapeHtml(content.heroSubtitle || project.description)}</p>
        <a href="#contact" class="hero-btn">${escapeHtml(content.heroCta || "Contactar")} →</a>
      </div>
      ${heroPhotosHtml}
    </div>
  </section>

  ${featuresHtml ? `<section class="features">${featuresHtml}</section>` : ""}

  <section id="about" class="about">
    <div class="about-grid">
      ${aboutPhoto}
      <div class="about-text-col">
        <p class="section-tag">${escapeHtml(content.aboutTitle || "Sobre nosotros")}</p>
        <p class="about-text">${escapeHtml(content.aboutText || project.description)}</p>
      </div>
    </div>
  </section>

  <section id="services" class="services">
    <p class="section-tag">${escapeHtml(content.servicesTitle || "Servicios")}</p>
    <h2>${escapeHtml(content.servicesSubtitle || "Lo que ofrecemos")}</h2>
    <div class="services-grid">${servicesHtml}</div>
  </section>

  ${galleryHtml}

  ${testimonialsHtml ? `
  <section class="testimonials">
    <p class="section-tag">Opiniones</p>
    <div class="testimonials-grid">${testimonialsHtml}</div>
  </section>` : ""}

  ${faqHtml ? `
  <section id="faq" class="faq-section">
    <p class="section-tag">Preguntas frecuentes</p>
    <div class="faq-list">${faqHtml}</div>
  </section>` : ""}

  <section id="contact" class="contact">
    <div class="contact-inner">
      <div>
        <p class="section-tag">${escapeHtml(content.contactTitle || "Contacto")}</p>
        <h2>${escapeHtml(content.contactSubtitle || "Hablemos")}</h2>
        <div class="contact-list">${contactItems}</div>
        ${socialLinks ? `<div class="social-links">${socialLinks}</div>` : ""}
      </div>
    </div>
  </section>

  <footer>
    <p>© ${new Date().getFullYear()} ${escapeHtml(project.business_name)}. ${lang === "en" ? "All rights reserved." : "Todos los derechos reservados."}</p>
    ${content.footerTagline ? `<p class="footer-tagline">${escapeHtml(content.footerTagline)}</p>` : ""}
  </footer>
</body>
</html>`;

  const css = `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'${fontPair.body}',sans-serif; background:${bg}; color:${text1}; }
h1,h2,h3 { font-family:'${fontPair.heading}',sans-serif; }
a { color:inherit; text-decoration:none; }
img { max-width:100%; height:auto; }

nav { max-width:1200px; margin:0 auto; padding:1.5rem 2rem; display:flex; align-items:center; justify-content:space-between; }
.nav-brand { display:flex; align-items:center; gap:0.75rem; }
.nav-logo { width:32px; height:32px; object-fit:contain; border-radius:8px; }
.logo { font-weight:700; font-size:1rem; font-family:'${fontPair.heading}',sans-serif; }
.nav-links { display:flex; gap:2rem; font-size:0.75rem; font-weight:500; color:${text2}; }
.nav-links a:hover { opacity:0.7; }
.nav-cta { font-size:0.75rem; font-weight:600; padding:0.625rem 1.25rem; border-radius:${borderRadius}; background:${accent}; color:${accentText}; }

.hero { background:#131313; }
.hero-content { max-width:1200px; margin:0 auto; padding:6rem 2rem 4rem; display:grid; grid-template-columns:1fr 1fr; gap:3rem; align-items:center; }
.hero-tag { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.25em; color:${accent}; margin-bottom:1.5rem; }
.hero h1 { font-size:clamp(2.5rem,6vw,4.5rem); font-weight:900; line-height:0.95; letter-spacing:-0.03em; color:#fff; }
.hero-sub { margin-top:1.5rem; font-size:1.1rem; color:#ffffffcc; max-width:500px; line-height:1.6; }
.hero-btn { display:inline-block; margin-top:2.5rem; padding:1rem 2rem; border-radius:${borderRadius}; background:${accent}; color:${accentText}; font-weight:700; font-size:0.875rem; }
.hero-photos { display:grid; gap:0.75rem; }
.hero-photo-main { width:100%; height:280px; object-fit:cover; border-radius:${borderRadius}; }
.hero-photos-row { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
.hero-photo-sm { width:100%; height:160px; object-fit:cover; border-radius:${borderRadius}; }
.hero-placeholder { width:100%; height:320px; border-radius:${borderRadius}; background:${accent}44; display:flex; align-items:center; justify-content:center; font-size:3rem; color:${accentText}44; }

.features { max-width:1200px; margin:0 auto; padding:4rem 2rem; display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
.feature-card { padding:2.5rem; border-radius:${borderRadius}; border:1px solid ${border}; background:${card}; }
.feature-wide { grid-column:span 2; }
.feature-card h3 { font-size:1.2rem; font-weight:700; margin-bottom:0.75rem; }
.feature-card p { font-size:0.875rem; color:${text2}; line-height:1.6; }

.about { padding:6rem 0; background:${bgAlt}; }
.about-grid { max-width:1200px; margin:0 auto; padding:0 2rem; display:grid; grid-template-columns:1fr 1fr; gap:3rem; align-items:center; }
.about-photo { width:100%; height:420px; object-fit:cover; border-radius:${borderRadius}; }
.about-placeholder { width:100%; height:420px; border-radius:${borderRadius}; background:${accent}10; }
.section-tag { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.25em; color:${accent}; margin-bottom:2rem; }
.about-text { font-size:clamp(1.5rem,4vw,2.5rem); font-weight:700; line-height:1.15; }

.services { max-width:1200px; margin:0 auto; padding:6rem 2rem; }
.services h2 { font-size:2rem; font-weight:700; margin-bottom:3rem; }
.services-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
.service-card { border-radius:${borderRadius}; border:1px solid ${border}; background:${card}; overflow:hidden; }
.service-img { height:200px; overflow:hidden; }
.service-img img { width:100%; height:100%; object-fit:cover; transition:transform 0.5s; }
.service-card:hover .service-img img { transform:scale(1.05); }
.service-placeholder { display:flex; align-items:center; justify-content:center; background:${accent}10; font-size:2rem; color:${accent}33; }
.service-body { padding:1.5rem; }
.service-card h3 { font-size:1.1rem; font-weight:700; margin-bottom:0.5rem; }
.service-card p { font-size:0.875rem; color:${text2}; line-height:1.6; }

.gallery { max-width:1200px; margin:0 auto; padding:4rem 2rem; }
.gallery-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
.gallery-img { width:100%; height:200px; object-fit:cover; border-radius:${borderRadius}; }

.testimonials { max-width:1200px; margin:0 auto; padding:6rem 2rem; }
.testimonials-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.testimonial-card { padding:2rem; border-radius:${borderRadius}; background:${card}; border:1px solid ${border}; }
.testimonial-stars { color:${accent}; margin-bottom:0.75rem; }
.testimonial-text { font-size:0.95rem; color:${text1}; line-height:1.6; margin-bottom:1rem; font-style:italic; }
.testimonial-name { font-size:0.8rem; color:${text2}; font-weight:600; }

.faq-section { max-width:800px; margin:0 auto; padding:6rem 2rem; }
.faq-list { margin-top:1rem; }
.faq-item { border-bottom:1px solid ${border}; }
.faq-item summary { padding:1.25rem 0; font-weight:600; cursor:pointer; font-size:1rem; list-style:none; }
.faq-item summary::-webkit-details-marker { display:none; }
.faq-item p { padding:0 0 1.25rem; font-size:0.9rem; color:${text2}; line-height:1.6; }

.contact { padding:6rem 0; background:${bgAlt}; }
.contact-inner { max-width:1200px; margin:0 auto; padding:0 2rem; }
.contact h2 { font-size:clamp(1.5rem,4vw,3rem); font-weight:700; margin-bottom:2rem; }
.contact-list { display:flex; flex-direction:column; gap:1rem; margin-top:1.5rem; }
.contact-item { display:flex; align-items:center; gap:0.75rem; font-size:0.875rem; color:${text2}; }
.social-links { margin-top:1.5rem; font-size:0.875rem; color:${accent}; }

footer { max-width:1200px; margin:0 auto; padding:3rem 2rem; text-align:center; font-size:0.75rem; color:${text2}; }
.footer-tagline { margin-top:0.5rem; font-style:italic; }

@media (max-width:768px) {
  .hero-content { grid-template-columns:1fr; }
  .hero-photos { display:none; }
  .features { grid-template-columns:1fr; }
  .feature-wide { grid-column:span 1; }
  .about-grid { grid-template-columns:1fr; }
  .services-grid { grid-template-columns:1fr; }
  .gallery-grid { grid-template-columns:repeat(2,1fr); }
  .testimonials-grid { grid-template-columns:1fr; }
  .nav-links, .nav-cta { display:none; }
}`;

  return { html, css };
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

    const { html, css } = generateSiteFiles(project);

    const slug = slugify(project.business_name);
    const projectName = `pgr-${slug}`;

    const deployPayload = {
      name: projectName,
      files: [
        {
          file: "index.html",
          data: btoa(unescape(encodeURIComponent(html))),
          encoding: "base64",
        },
        {
          file: "styles.css",
          data: btoa(unescape(encodeURIComponent(css))),
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

    // Use the default Vercel URL (projectName.vercel.app)
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
