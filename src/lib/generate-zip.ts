import JSZip from "jszip";

function escapeHtml(text: string | null | undefined): string {
  if (!text) return "";
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
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

interface ProjectForZip {
  business_name: string;
  description: string;
  sector: string;
  email: string;
  phone: string | null;
  address: string | null;
  slogan: string | null;
  instagram: string | null;
  facebook: string | null;
  color_scheme: string;
  dark_mode: boolean;
  business_hours: string | null;
  business_email: string | null;
  business_phone: string | null;
  services_list: any;
  generated_content: any;
}

const COLOR_MAP: Record<string, { primary: string; secondary: string }> = {
  Coral: { primary: "#FF6B4A", secondary: "#FFF0ED" },
  Azul: { primary: "#3B82F6", secondary: "#EFF6FF" },
  Verde: { primary: "#10B981", secondary: "#ECFDF5" },
  Violeta: { primary: "#8B5CF6", secondary: "#F5F3FF" },
  Rosa: { primary: "#EC4899", secondary: "#FDF2F8" },
  Ámbar: { primary: "#F59E0B", secondary: "#FFFBEB" },
};

export async function generateProjectZip(project: ProjectForZip): Promise<Blob> {
  const zip = new JSZip();
  const scheme = COLOR_MAP[project.color_scheme] || COLOR_MAP.Coral;
  const content = project.generated_content || {};
  const dark = project.dark_mode;

  const bg = dark ? "#0a0a0f" : "#fafaf9";
  const bgAlt = dark ? "#111118" : "#f3f2ef";
  const card = dark ? "#16161f" : "#ffffff";
  const text1 = dark ? "#f5f5f0" : "#1a1a17";
  const text2 = dark ? "#8a8a95" : "#6b6b63";
  const border = dark ? "#222230" : "#e8e7e3";

  const services = content.services || [];
  const features = content.features || [];

  const servicesHtml = services.map((s: any, i: number) => `
    <div class="service-card">
      <span class="service-num">${String(i + 1).padStart(2, "0")}</span>
      <h3>${escapeHtml(s.name)}</h3>
      <p>${escapeHtml(s.description)}</p>
    </div>`).join("");

  const featuresHtml = features.map((f: any, i: number) => `
    <div class="feature-card ${i === 0 ? 'feature-wide' : ''}">
      <h3>${escapeHtml(f.title)}</h3>
      <p>${escapeHtml(f.description)}</p>
    </div>`).join("");

  const webEmail = project.business_email || project.email;
  const webPhone = project.business_phone || project.phone;

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

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(project.business_name)}</title>
  <meta name="description" content="${escapeHtml(content.heroSubtitle || project.description)}">
  <link rel="stylesheet" href="styles.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
</head>
<body>
  <nav>
    <span class="logo">${escapeHtml(project.business_name)}</span>
    <div class="nav-links">
      <a href="#about">Nosotros</a>
      <a href="#services">Servicios</a>
      <a href="#contact">Contacto</a>
    </div>
    <a href="mailto:${escapeHtml(webEmail)}" class="nav-cta">Contactar →</a>
  </nav>

  <section class="hero">
    <p class="hero-tag">${escapeHtml(project.slogan || project.sector)}</p>
    <h1>${escapeHtml(content.heroHeadline || project.business_name)}</h1>
    <p class="hero-sub">${escapeHtml(content.heroSubtitle || project.description)}</p>
    <a href="#contact" class="hero-btn">${escapeHtml(content.heroCta || "Contactar")} →</a>
  </section>

  <section class="features">${featuresHtml}</section>

  <section id="about" class="about">
    <p class="section-tag">${escapeHtml(content.aboutTitle || "Sobre nosotros")}</p>
    <p class="about-text">${escapeHtml(content.aboutText || project.description)}</p>
  </section>

  <section id="services" class="services">
    <p class="section-tag">${escapeHtml(content.servicesTitle || "Servicios")}</p>
    <h2>Lo que ofrecemos</h2>
    <div class="services-grid">${servicesHtml}</div>
  </section>

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
    <p>© ${new Date().getFullYear()} ${escapeHtml(project.business_name)}. Todos los derechos reservados.</p>
  </footer>
</body>
</html>`;

  const css = `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Inter',sans-serif; background:${bg}; color:${text1}; }
a { color:inherit; text-decoration:none; }

nav { max-width:1200px; margin:0 auto; padding:1.5rem 2rem; display:flex; align-items:center; justify-content:space-between; }
.logo { font-weight:700; font-size:1rem; }
.nav-links { display:flex; gap:2rem; font-size:0.75rem; font-weight:500; color:${text2}; }
.nav-links a:hover { opacity:0.7; }
.nav-cta { font-size:0.75rem; font-weight:600; padding:0.625rem 1.25rem; border-radius:9999px; background:${scheme.primary}; color:#fff; }

.hero { max-width:1200px; margin:0 auto; padding:6rem 2rem 4rem; }
.hero-tag { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.25em; color:${scheme.primary}; margin-bottom:1.5rem; }
.hero h1 { font-size:clamp(2.5rem,8vw,5rem); font-weight:900; line-height:0.95; letter-spacing:-0.03em; max-width:800px; }
.hero-sub { margin-top:1.5rem; font-size:1.1rem; color:${text2}; max-width:500px; line-height:1.6; }
.hero-btn { display:inline-block; margin-top:2.5rem; padding:1rem 2rem; border-radius:9999px; background:${scheme.primary}; color:#fff; font-weight:700; font-size:0.875rem; }

.features { max-width:1200px; margin:0 auto; padding:4rem 2rem; display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
.feature-card { padding:2.5rem; border-radius:1.5rem; border:1px solid ${border}; background:${card}; }
.feature-wide { grid-column:span 2; }
.feature-card h3 { font-size:1.2rem; font-weight:700; margin-bottom:0.75rem; }
.feature-card p { font-size:0.875rem; color:${text2}; line-height:1.6; }

.about { padding:6rem 0; background:${bgAlt}; }
.about > * { max-width:1200px; margin:0 auto; padding:0 2rem; }
.section-tag { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.25em; color:${scheme.primary}; margin-bottom:2rem; }
.about-text { font-size:clamp(1.5rem,4vw,3rem); font-weight:700; line-height:1.1; max-width:900px; }

.services { max-width:1200px; margin:0 auto; padding:6rem 2rem; }
.services h2 { font-size:2rem; font-weight:700; margin-bottom:3rem; }
.services-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1.25rem; }
.service-card { padding:2rem; border-radius:1.5rem; border:1px solid ${border}; background:${card}; }
.service-num { font-size:2rem; font-weight:900; color:${scheme.primary}30; }
.service-card h3 { font-size:1.1rem; font-weight:700; margin:0.75rem 0 0.5rem; }
.service-card p { font-size:0.875rem; color:${text2}; line-height:1.6; }

.contact { padding:6rem 0; background:${bgAlt}; }
.contact-inner { max-width:1200px; margin:0 auto; padding:0 2rem; }
.contact h2 { font-size:clamp(1.5rem,4vw,3rem); font-weight:700; margin-bottom:2rem; }
.contact-list { display:flex; flex-direction:column; gap:1rem; margin-top:1.5rem; }
.contact-item { display:flex; align-items:center; gap:0.75rem; font-size:0.875rem; color:${text2}; }
.social-links { margin-top:1.5rem; font-size:0.875rem; color:${scheme.primary}; }

footer { max-width:1200px; margin:0 auto; padding:3rem 2rem; text-align:center; font-size:0.75rem; color:${text2}; }

@media (max-width:768px) {
  .features { grid-template-columns:1fr; }
  .feature-wide { grid-column:span 1; }
  .services-grid { grid-template-columns:1fr; }
  .nav-links, .nav-cta { display:none; }
}`;

  zip.file("index.html", html);
  zip.file("styles.css", css);

  return zip.generateAsync({ type: "blob" });
}
