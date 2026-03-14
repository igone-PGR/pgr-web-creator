import JSZip from "jszip";

const BASE_DARK_COLOR = "#131313";
const HEX_COLOR_REGEX = /^#([0-9a-f]{6})$/i;

const DEFAULT_COLORS = {
  bg: "#FAFAF9",
  bgAlt: "#F3F2EF",
  card: "#FFFFFF",
  text1: "#131313",
  text2: "#5F5F5F",
  border: "#E8E7E3",
  accent: "#F48763",
  accentText: "#FFFFFF",
  accentDark: BASE_DARK_COLOR,
};

function escapeHtml(text: string | null | undefined): string {
  if (!text) return "";
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function sanitizeHref(url: string): string {
  try {
    const raw = url.startsWith("http") ? url : `https://${url}`;
    const parsed = new URL(raw);
    if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) return "#";
    return escapeHtml(parsed.href);
  } catch { return "#"; }
}

function normalizeHex(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return HEX_COLOR_REGEX.test(trimmed) ? trimmed.toUpperCase() : null;
}

function getContrastText(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#131313" : "#FFFFFF";
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

export async function generateProjectZip(project: ProjectForZip): Promise<Blob> {
  const zip = new JSZip();
  const content = project.generated_content || {};
  const accent = normalizeHex(content.colors?.accent) || DEFAULT_COLORS.accent;
  const colors = {
    ...DEFAULT_COLORS,
    ...content.colors,
    accent,
    accentText: normalizeHex(content.colors?.accentText) || getContrastText(accent),
    accentDark: BASE_DARK_COLOR,
  };

  const webEmail = project.business_email || project.email;
  const webPhone = project.business_phone || project.phone;

  const services = content.services || [];
  const features = content.features || [];
  const categories = content.categories || [];
  const testimonials = content.testimonials || [];
  const faq = content.faq || [];
  const heroStats = content.heroStats || [];
  const ctaStats = content.ctaStats || [];
  const aboutHighlights = content.aboutHighlights || [];

  const categoriesHtml = categories.map((c: any) => `
    <div class="category-card">
      <div class="category-icon">✦</div>
      <span>${escapeHtml(c.title)}</span>
    </div>`).join("");

  const highlightsHtml = aboutHighlights.map((h: any) => `
    <div class="highlight">
      <div class="highlight-dot">✓</div>
      <div><strong>${escapeHtml(h.title)}</strong><br><span class="muted">${escapeHtml(h.description)}</span></div>
    </div>`).join("");

  const servicesHtml = services.map((s: any) => `
    <div class="service-card">
      <div class="service-img-placeholder"></div>
      <div class="service-body">
        <h3>${escapeHtml(s.name)}</h3>
        <p>${escapeHtml(s.description)}</p>
      </div>
    </div>`).join("");

  const featuresHtml = features.map((f: any) => `
    <div class="feature-card">
      <div class="feature-icon">★</div>
      <h3>${escapeHtml(f.title)}</h3>
      <p>${escapeHtml(f.description)}</p>
    </div>`).join("");

  const testimonialsHtml = testimonials.map((t: any) => `
    <div class="testimonial-card">
      <div class="stars">${"★".repeat(t.rating || 5)}</div>
      <p>"${escapeHtml(t.text)}"</p>
      <strong>${escapeHtml(t.name)}</strong>
    </div>`).join("");

  const faqHtml = faq.map((f: any) => `
    <details class="faq-item">
      <summary>${escapeHtml(f.question)}</summary>
      <p>${escapeHtml(f.answer)}</p>
    </details>`).join("");

  const heroStatsHtml = heroStats.map((s: any) => `
    <div class="stat"><div class="stat-value">${escapeHtml(s.value)}</div><div class="stat-label">${escapeHtml(s.label)}</div></div>`).join("");

  const ctaStatsHtml = ctaStats.map((s: any) => `
    <div class="stat"><div class="stat-value">${escapeHtml(s.value)}</div><div class="stat-label">${escapeHtml(s.label)}</div></div>`).join("");

  const contactItems = [
    webEmail ? `<a href="mailto:${escapeHtml(webEmail)}" class="contact-btn contact-btn-light">📧 Email</a>` : "",
    webPhone ? `<a href="https://wa.me/${escapeHtml(webPhone.replace(/\D/g, ""))}" class="contact-btn contact-btn-wa" target="_blank">💬 WhatsApp</a>` : "",
  ].filter(Boolean).join("\n");

  const socialLinks = [
    project.instagram ? `<a href="${sanitizeHref(`https://instagram.com/${project.instagram.replace("@", "")}`)}" target="_blank" class="social-link">Instagram</a>` : "",
    project.facebook ? `<a href="${sanitizeHref(project.facebook)}" target="_blank" class="social-link">Facebook</a>` : "",
  ].filter(Boolean).join("");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(project.business_name)}</title>
  <meta name="description" content="${escapeHtml(content.heroSubtitle || project.description)}">
  <link rel="stylesheet" href="styles.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <nav>
    <div class="nav-inner">
      <span class="logo">${escapeHtml(project.business_name)}</span>
      <div class="nav-links">
        <a href="#about">Nosotros</a>
        <a href="#services">Servicios</a>
        <a href="#faq">FAQ</a>
        <a href="#contact">Contacto</a>
      </div>
      <a href="#contact" class="nav-cta">Contactar →</a>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-inner">
      <div class="hero-text">
        <p class="hero-tag">${escapeHtml(project.slogan || project.sector)}</p>
        <h1>${escapeHtml(content.heroHeadline || project.business_name)}</h1>
        <p class="hero-sub">${escapeHtml(content.heroSubtitle || project.description)}</p>
        <a href="#contact" class="hero-btn">${escapeHtml(content.heroCta || "Contactar")} →</a>
        ${heroStatsHtml ? `<div class="hero-stats">${heroStatsHtml}</div>` : ""}
      </div>
    </div>
  </section>

  ${categoriesHtml ? `<section class="categories"><div class="categories-grid">${categoriesHtml}</div></section>` : ""}

  <section id="about" class="about">
    <div class="about-inner">
      <div class="about-text">
        <p class="section-tag">${escapeHtml(content.aboutTitle || "Sobre nosotros")}</p>
        <p class="about-headline">${escapeHtml(content.aboutText || project.description)}</p>
        ${highlightsHtml ? `<div class="highlights">${highlightsHtml}</div>` : ""}
      </div>
    </div>
  </section>

  <section id="services" class="services">
    <p class="section-tag">${escapeHtml(content.servicesTitle || "Servicios")}</p>
    <h2>${escapeHtml(content.servicesSubtitle || "Lo que ofrecemos")}</h2>
    <div class="services-grid">${servicesHtml}</div>
  </section>

  <section class="cta-banner">
    <div class="cta-inner">
      <h2>${escapeHtml(content.ctaTitle)}</h2>
      <p>${escapeHtml(content.ctaSubtitle)}</p>
      ${ctaStatsHtml ? `<div class="cta-stats">${ctaStatsHtml}</div>` : ""}
      <a href="#contact" class="cta-btn">${escapeHtml(content.ctaCta || "Empieza ahora")} →</a>
    </div>
  </section>

  <section class="features-section">
    <p class="section-tag">${escapeHtml(content.featuresTitle)}</p>
    <h2>${escapeHtml(content.featuresSubtitle)}</h2>
    <div class="features-grid">${featuresHtml}</div>
  </section>

  ${testimonialsHtml ? `
  <section class="testimonials">
    <p class="section-tag">Opiniones</p>
    <h2>Lo que dicen nuestros clientes</h2>
    <div class="testimonials-grid">${testimonialsHtml}</div>
  </section>` : ""}

  ${faqHtml ? `
  <section id="faq" class="faq-section">
    <p class="section-tag">FAQ</p>
    <h2>Preguntas frecuentes</h2>
    <div class="faq-list">${faqHtml}</div>
  </section>` : ""}

  <section id="contact" class="contact">
    <h2>${escapeHtml(content.contactTitle || "Contacto")}</h2>
    <p class="contact-sub">${escapeHtml(content.contactSubtitle)}</p>
    <div class="contact-actions">${contactItems}</div>
    ${project.address ? `<p class="contact-info">📍 ${escapeHtml(project.address)}</p>` : ""}
    ${project.business_hours ? `<p class="contact-info">🕐 ${escapeHtml(project.business_hours)}</p>` : ""}
    ${socialLinks ? `<div class="social-links">${socialLinks}</div>` : ""}
  </section>

  <footer>
    <div class="footer-inner">
      <div><strong>${escapeHtml(project.business_name)}</strong><p>${escapeHtml(content.footerTagline)}</p></div>
      <div>
        <p class="footer-title">Navegación</p>
        <a href="#about">Nosotros</a>
        <a href="#services">Servicios</a>
        <a href="#contact">Contacto</a>
      </div>
      <div>
        <p class="footer-title">Contacto</p>
        ${webEmail ? `<a href="mailto:${escapeHtml(webEmail)}">${escapeHtml(webEmail)}</a>` : ""}
        ${webPhone ? `<span>${escapeHtml(webPhone)}</span>` : ""}
      </div>
    </div>
    <p class="footer-copy">© ${new Date().getFullYear()} ${escapeHtml(project.business_name)}. Todos los derechos reservados.</p>
  </footer>
</body>
</html>`;

  const css = `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Plus Jakarta Sans',sans-serif; background:${colors.bg}; color:${colors.text1}; }
a { color:inherit; text-decoration:none; }

nav { background:${colors.bg}; border-bottom:1px solid ${colors.border}; }
.nav-inner { max-width:1200px; margin:0 auto; padding:1.25rem 2rem; display:flex; align-items:center; justify-content:space-between; }
.logo { font-weight:700; font-size:1rem; }
.nav-links { display:flex; gap:2rem; font-size:0.875rem; font-weight:500; color:${colors.text2}; }
.nav-links a:hover { opacity:0.7; }
.nav-cta { font-size:0.875rem; font-weight:600; padding:0.625rem 1.25rem; border-radius:9999px; background:${colors.accent}; color:${colors.accentText}; }

.hero { background:${colors.accentDark}; padding:5rem 2rem; }
.hero-inner { max-width:1200px; margin:0 auto; }
.hero-text { max-width:600px; }
.hero-tag { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.25em; color:${colors.accentText}99; margin-bottom:1.5rem; }
.hero h1 { font-size:clamp(2.5rem,6vw,3.75rem); font-weight:800; line-height:1.05; color:${colors.accentText}; }
.hero-sub { margin-top:1.5rem; font-size:1.1rem; color:${colors.accentText}cc; line-height:1.6; }
.hero-btn { display:inline-block; margin-top:2rem; padding:0.875rem 1.75rem; border-radius:9999px; background:${colors.accent}; color:${colors.accentText}; font-weight:700; font-size:0.875rem; border:2px solid ${colors.accentText}33; }
.hero-stats { display:flex; gap:2rem; margin-top:2rem; }
.stat-value { font-size:1.5rem; font-weight:800; color:${colors.accentText}; }
.stat-label { font-size:0.75rem; color:${colors.accentText}88; }

.categories { max-width:1200px; margin:0 auto; padding:4rem 2rem; }
.categories-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
.category-card { display:flex; flex-direction:column; align-items:center; gap:0.75rem; padding:1.5rem; border-radius:1rem; border:1px solid ${colors.border}; background:${colors.card}; text-align:center; font-size:0.875rem; font-weight:600; }
.category-icon { width:3rem; height:3rem; border-radius:0.75rem; background:${colors.accent}15; display:flex; align-items:center; justify-content:center; color:${colors.accent}; font-size:1.2rem; }

.about { padding:5rem 0; background:${colors.bgAlt}; }
.about-inner { max-width:1200px; margin:0 auto; padding:0 2rem; }
.section-tag { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.25em; color:${colors.accent}; margin-bottom:1rem; }
.about-headline { font-size:clamp(1.5rem,3vw,2rem); font-weight:700; line-height:1.3; max-width:700px; }
.highlights { margin-top:2rem; display:flex; flex-direction:column; gap:1rem; }
.highlight { display:flex; gap:0.75rem; align-items:flex-start; font-size:0.875rem; }
.highlight-dot { width:1.25rem; height:1.25rem; border-radius:50%; background:${colors.accent}; color:${colors.accentText}; display:flex; align-items:center; justify-content:center; font-size:0.6rem; flex-shrink:0; margin-top:0.15rem; }
.muted { color:${colors.text2}; }

.services { max-width:1200px; margin:0 auto; padding:5rem 2rem; text-align:center; }
.services h2 { font-size:2rem; font-weight:700; margin-bottom:3rem; }
.services-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.service-card { border-radius:1rem; border:1px solid ${colors.border}; background:${colors.card}; overflow:hidden; text-align:left; transition:box-shadow .3s; }
.service-card:hover { box-shadow:0 10px 40px -10px rgba(0,0,0,.1); }
.service-img-placeholder { height:12rem; background:${colors.accent}10; }
.service-body { padding:1.5rem; }
.service-body h3 { font-size:1.1rem; font-weight:700; margin-bottom:0.5rem; }
.service-body p { font-size:0.875rem; color:${colors.text2}; line-height:1.6; }

.cta-banner { background:${colors.accentDark}; padding:5rem 2rem; }
.cta-inner { max-width:1200px; margin:0 auto; }
.cta-inner h2 { font-size:clamp(1.5rem,4vw,2.5rem); font-weight:700; color:${colors.accentText}; max-width:600px; }
.cta-inner p { color:${colors.accentText}cc; margin-top:1rem; max-width:500px; }
.cta-stats { display:flex; gap:2rem; margin-top:2rem; }
.cta-btn { display:inline-block; margin-top:2rem; padding:0.875rem 1.75rem; border-radius:9999px; background:${colors.accent}; color:${colors.accentText}; font-weight:700; font-size:0.875rem; }

.features-section { max-width:1200px; margin:0 auto; padding:5rem 2rem; text-align:center; }
.features-section h2 { font-size:2rem; font-weight:700; margin-bottom:3rem; }
.features-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1.5rem; }
.feature-card { padding:1.5rem; border-radius:1rem; border:1px solid ${colors.border}; background:${colors.card}; text-align:center; }
.feature-icon { width:3.5rem; height:3.5rem; border-radius:0.75rem; background:${colors.accent}15; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; color:${colors.accent}; font-size:1.2rem; }
.feature-card h3 { font-size:0.875rem; font-weight:700; margin-bottom:0.5rem; }
.feature-card p { font-size:0.8rem; color:${colors.text2}; line-height:1.5; }

.testimonials { max-width:1200px; margin:0 auto; padding:5rem 2rem; text-align:center; background:${colors.bgAlt}; }
.testimonials h2 { font-size:2rem; font-weight:700; margin-bottom:3rem; }
.testimonials-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.testimonial-card { padding:1.5rem; border-radius:1rem; border:1px solid ${colors.border}; background:${colors.card}; text-align:left; }
.stars { color:#F59E0B; margin-bottom:1rem; }
.testimonial-card p { font-size:0.875rem; color:${colors.text2}; line-height:1.6; margin-bottom:1rem; }

.faq-section { max-width:700px; margin:0 auto; padding:5rem 2rem; text-align:center; }
.faq-section h2 { font-size:2rem; font-weight:700; margin-bottom:2rem; }
.faq-list { text-align:left; }
.faq-item { border:1px solid ${colors.border}; border-radius:0.75rem; margin-bottom:0.75rem; background:${colors.card}; overflow:hidden; }
.faq-item summary { padding:1.25rem; font-weight:600; font-size:0.875rem; cursor:pointer; list-style:none; }
.faq-item summary::-webkit-details-marker { display:none; }
.faq-item p { padding:0 1.25rem 1.25rem; font-size:0.875rem; color:${colors.text2}; line-height:1.6; }

.contact { background:${colors.accentDark}; padding:5rem 2rem; text-align:center; }
.contact h2 { font-size:2rem; font-weight:700; color:${colors.accentText}; margin-bottom:0.5rem; }
.contact-sub { color:${colors.accentText}cc; margin-bottom:2rem; }
.contact-actions { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }
.contact-btn { padding:0.875rem 1.75rem; border-radius:9999px; font-weight:700; font-size:0.875rem; display:inline-flex; align-items:center; gap:0.5rem; }
.contact-btn-light { background:${colors.accentText}; color:${colors.accentDark}; }
.contact-btn-wa { background:#25D366; color:#fff; }
.contact-info { color:${colors.accentText}99; font-size:0.875rem; margin-top:1rem; }
.social-links { margin-top:1.5rem; display:flex; gap:1rem; justify-content:center; }
.social-link { color:${colors.accentText}; font-size:0.875rem; opacity:0.7; }
.social-link:hover { opacity:1; }

footer { border-top:1px solid ${colors.border}; padding:3rem 2rem 1.5rem; }
.footer-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(3,1fr); gap:2rem; font-size:0.875rem; color:${colors.text2}; }
.footer-inner a { display:block; margin-top:0.5rem; }
.footer-inner a:hover { text-decoration:underline; }
.footer-title { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.15em; color:${colors.accent}; margin-bottom:0.75rem; }
.footer-copy { max-width:1200px; margin:2rem auto 0; padding-top:1.5rem; border-top:1px solid ${colors.border}; text-align:center; font-size:0.75rem; color:${colors.text2}; }

@media (max-width:768px) {
  .categories-grid { grid-template-columns:repeat(2,1fr); }
  .services-grid { grid-template-columns:1fr; }
  .features-grid { grid-template-columns:repeat(2,1fr); }
  .testimonials-grid { grid-template-columns:1fr; }
  .footer-inner { grid-template-columns:1fr; }
  .nav-links, .nav-cta { display:none; }
}`;

  zip.file("index.html", html);
  zip.file("styles.css", css);

  return zip.generateAsync({ type: "blob" });
}
