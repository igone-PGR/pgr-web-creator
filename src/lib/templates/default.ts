import type { TemplateInput } from "./shared";
import { esc, contactEmail, contactPhone, whatsappUrl, sharedHead, footerHtml, sharedFooterCss, whatsappFloating } from "./shared";

export function generateDefaultHtml(input: TemplateInput): string {
  const { project: p, content, colors } = input;
  const email = contactEmail(p);
  const phone = contactPhone(p);
  const lang = p.language || "es";
  const photos = p.photos;

  const servicesHtml = content.services.map((s, i) => {
    const img = photos.length > 0 ? photos[i % photos.length] : null;
    return `<div class="service-card">
      ${img ? `<div class="service-img"><img src="${esc(img)}" alt="${esc(s.name)}" /></div>` : `<div class="service-img service-placeholder">✦</div>`}
      <div class="service-body">
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.description)}</p>
      </div>
    </div>`;
  }).join("");

  const featuresHtml = content.features.map((f, i) => `
    <div class="feature-card ${i === 0 ? 'feature-wide' : ''}">
      <h3>${esc(f.title)}</h3>
      <p>${esc(f.description)}</p>
    </div>`).join("");

  const testimonialsHtml = (content.testimonials || []).map(t => `
    <div class="testimonial-card">
      <div class="testimonial-stars">${"★".repeat(t.rating || 5)}</div>
      <p class="testimonial-text">"${esc(t.text)}"</p>
      <p class="testimonial-name">— ${esc(t.name)}</p>
    </div>`).join("");

  const faqHtml = (content.faq || []).map(f => `
    <details class="faq-item">
      <summary>${esc(f.question)}</summary>
      <p>${esc(f.answer)}</p>
    </details>`).join("");

  const heroPhotosHtml = photos.length > 0 ? `
    <div class="hero-photos">
      <img src="${esc(photos[0])}" alt="${esc(p.businessName)}" class="hero-photo-main" />
      ${photos.length > 1 ? `<div class="hero-photos-row">
        ${photos.slice(1, 3).map(ph => `<img src="${esc(ph)}" alt="" class="hero-photo-sm" />`).join("")}
      </div>` : ""}
    </div>` : `<div class="hero-placeholder"><span>✦</span></div>`;

  const galleryHtml = photos.length > 3 ? `
  <section class="gallery">
    <p class="section-tag">${lang === "en" ? "Gallery" : "Galería"}</p>
    <div class="gallery-grid">${photos.slice(0, 8).map(ph => `<img src="${esc(ph)}" alt="" class="gallery-img" />`).join("")}</div>
  </section>` : "";

  return `${sharedHead(p.businessName, content.heroSubtitle || p.sector, "Plus Jakarta Sans", lang)}
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Plus Jakarta Sans',sans-serif; background:${colors.bg}; color:${colors.text1}; }
h1,h2,h3 { font-family:'Plus Jakarta Sans',sans-serif; }
a { color:inherit; text-decoration:none; }
img { max-width:100%; height:auto; }

nav { max-width:1200px; margin:0 auto; padding:1.5rem 2rem; display:flex; align-items:center; justify-content:space-between; }
.nav-brand { display:flex; align-items:center; gap:0.75rem; }
.nav-logo { width:32px; height:32px; object-fit:contain; border-radius:8px; }
.logo { font-weight:700; font-size:1rem; }
.nav-links { display:flex; gap:2rem; font-size:0.75rem; font-weight:500; color:${colors.text2}; }
.nav-links a:hover { opacity:0.7; }
.nav-cta { font-size:0.75rem; font-weight:600; padding:0.625rem 1.25rem; border-radius:9999px; background:${colors.accent}; color:${colors.accentText}; }

.hero { background:${colors.accentDark}; }
.hero-content { max-width:1200px; margin:0 auto; padding:6rem 2rem 4rem; display:grid; grid-template-columns:1fr 1fr; gap:3rem; align-items:center; }
.hero-tag { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.25em; color:${colors.accent}; margin-bottom:1.5rem; }
.hero h1 { font-size:clamp(2.5rem,6vw,4.5rem); font-weight:900; line-height:0.95; letter-spacing:-0.03em; color:#fff; }
.hero-sub { margin-top:1.5rem; font-size:1.1rem; color:#ffffffcc; max-width:500px; line-height:1.6; }
.hero-btn { display:inline-block; margin-top:2.5rem; padding:1rem 2rem; border-radius:9999px; background:${colors.accent}; color:${colors.accentText}; font-weight:700; font-size:0.875rem; }
.hero-photos { display:grid; gap:0.75rem; }
.hero-photo-main { width:100%; height:280px; object-fit:cover; border-radius:1.5rem; }
.hero-photos-row { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
.hero-photo-sm { width:100%; height:160px; object-fit:cover; border-radius:1.5rem; }
.hero-placeholder { width:100%; height:320px; border-radius:1.5rem; background:${colors.accent}44; display:flex; align-items:center; justify-content:center; font-size:3rem; color:${colors.accentText}44; }

.features { max-width:1200px; margin:0 auto; padding:4rem 2rem; display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
.feature-card { padding:2.5rem; border-radius:1.5rem; border:1px solid ${colors.border}; background:${colors.card}; }
.feature-wide { grid-column:span 2; }
.feature-card h3 { font-size:1.2rem; font-weight:700; margin-bottom:0.75rem; }
.feature-card p { font-size:0.875rem; color:${colors.text2}; line-height:1.6; }

.about { padding:6rem 0; background:${colors.bgAlt}; }
.about-grid { max-width:1200px; margin:0 auto; padding:0 2rem; display:grid; grid-template-columns:1fr 1fr; gap:3rem; align-items:center; }
.about-photo { width:100%; height:420px; object-fit:cover; border-radius:1.5rem; }
.about-placeholder { width:100%; height:420px; border-radius:1.5rem; background:${colors.accent}10; }
.section-tag { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.25em; color:${colors.accent}; margin-bottom:2rem; }
.about-text { font-size:clamp(1.5rem,4vw,2.5rem); font-weight:700; line-height:1.15; }

.services { max-width:1200px; margin:0 auto; padding:6rem 2rem; }
.services h2 { font-size:2rem; font-weight:700; margin-bottom:3rem; }
.services-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
.service-card { border-radius:1.5rem; border:1px solid ${colors.border}; background:${colors.card}; overflow:hidden; }
.service-img { height:200px; overflow:hidden; }
.service-img img { width:100%; height:100%; object-fit:cover; transition:transform 0.5s; }
.service-card:hover .service-img img { transform:scale(1.05); }
.service-placeholder { display:flex; align-items:center; justify-content:center; background:${colors.accent}10; font-size:2rem; color:${colors.accent}33; }
.service-body { padding:1.5rem; }
.service-card h3 { font-size:1.1rem; font-weight:700; margin-bottom:0.5rem; }
.service-card p { font-size:0.875rem; color:${colors.text2}; line-height:1.6; }

.gallery { max-width:1200px; margin:0 auto; padding:4rem 2rem; }
.gallery-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
.gallery-img { width:100%; height:200px; object-fit:cover; border-radius:1.5rem; }

.testimonials { max-width:1200px; margin:0 auto; padding:6rem 2rem; }
.testimonials-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.testimonial-card { padding:2rem; border-radius:1.5rem; background:${colors.card}; border:1px solid ${colors.border}; }
.testimonial-stars { color:${colors.accent}; margin-bottom:0.75rem; }
.testimonial-text { font-size:0.95rem; color:${colors.text1}; line-height:1.6; margin-bottom:1rem; font-style:italic; }
.testimonial-name { font-size:0.8rem; color:${colors.text2}; font-weight:600; }

.faq-section { max-width:800px; margin:0 auto; padding:6rem 2rem; }
.faq-list { margin-top:1rem; }
.faq-item { border-bottom:1px solid ${colors.border}; }
.faq-item summary { padding:1.25rem 0; font-weight:600; cursor:pointer; font-size:1rem; list-style:none; }
.faq-item summary::-webkit-details-marker { display:none; }
.faq-item p { padding:0 0 1.25rem; font-size:0.9rem; color:${colors.text2}; line-height:1.6; }

.contact { padding:6rem 0; background:${colors.accentDark}; text-align:center; }
.contact-inner { max-width:1200px; margin:0 auto; padding:0 2rem; }
.contact h2 { font-size:clamp(1.5rem,4vw,3rem); font-weight:700; color:#fff; margin-bottom:1rem; }
.contact-sub { color:#ffffffcc; margin-bottom:2rem; }
.contact-btns { display:flex; justify-content:center; gap:1rem; flex-wrap:wrap; }
.contact-btn { padding:0.875rem 2rem; border-radius:9999px; font-weight:700; font-size:0.875rem; display:inline-flex; align-items:center; gap:0.5rem; }
.contact-btn-email { background:${colors.accentText}; color:${colors.accentDark}; }
.contact-btn-wa { background:#25D366; color:#fff; }
.contact-details { margin-top:2rem; display:flex; justify-content:center; gap:2rem; flex-wrap:wrap; font-size:0.85rem; color:#ffffff99; }

${sharedFooterCss(colors)}

@media (max-width:768px) {
  .hero-content { grid-template-columns:1fr; }
  .hero-photos { display:none; }
  .features { grid-template-columns:1fr; }
  .feature-wide { grid-column:span 1; }
  .about-grid { grid-template-columns:1fr; }
  .services-grid { grid-template-columns:1fr; }
  .gallery-grid { grid-template-columns:repeat(2,1fr); }
  .testimonials-grid { grid-template-columns:1fr; }
  .nav-links,.nav-cta { display:none; }
}
</style>
</head>
<body>
  <nav>
    <div class="nav-brand">
      ${p.logo ? `<img src="${esc(p.logo)}" alt="" class="nav-logo" />` : ""}
      <span class="logo">${esc(p.businessName)}</span>
    </div>
    <div class="nav-links">
      <a href="#about">${lang === "en" ? "About" : "Nosotros"}</a>
      <a href="#services">${lang === "en" ? "Services" : "Servicios"}</a>
      <a href="#contact">${lang === "en" ? "Contact" : "Contacto"}</a>
    </div>
    <a href="mailto:${esc(email)}" class="nav-cta">${lang === "en" ? "Contact" : "Contactar"} →</a>
  </nav>

  <section class="hero">
    <div class="hero-content">
      <div class="hero-text">
        <p class="hero-tag">${esc(p.slogan || p.sector)}</p>
        <h1>${esc(content.heroHeadline)}</h1>
        <p class="hero-sub">${esc(content.heroSubtitle)}</p>
        <a href="#contact" class="hero-btn">${esc(content.heroCta)} →</a>
      </div>
      ${heroPhotosHtml}
    </div>
  </section>

  ${featuresHtml ? `<section class="features">${featuresHtml}</section>` : ""}

  <section id="about" class="about">
    <div class="about-grid">
      ${photos.length > 0 ? `<img src="${esc(photos[Math.min(1, photos.length - 1)])}" alt="${esc(p.businessName)}" class="about-photo" />` : `<div class="about-placeholder"></div>`}
      <div>
        <p class="section-tag">${esc(content.aboutTitle)}</p>
        <p class="about-text">${esc(content.aboutText)}</p>
      </div>
    </div>
  </section>

  <section id="services" class="services">
    <p class="section-tag">${esc(content.servicesTitle)}</p>
    <h2>${esc(content.servicesSubtitle)}</h2>
    <div class="services-grid">${servicesHtml}</div>
  </section>

  ${galleryHtml}

  ${testimonialsHtml ? `
  <section class="testimonials">
    <p class="section-tag">${lang === "en" ? "Reviews" : "Opiniones"}</p>
    <div class="testimonials-grid">${testimonialsHtml}</div>
  </section>` : ""}

  ${faqHtml ? `
  <section class="faq-section">
    <p class="section-tag">FAQ</p>
    <div class="faq-list">${faqHtml}</div>
  </section>` : ""}

  <section id="contact" class="contact">
    <div class="contact-inner">
      <p class="section-tag" style="color:${colors.accent}">${esc(content.contactTitle)}</p>
      <h2>${esc(content.contactSubtitle)}</h2>
      <div class="contact-btns">
        ${email ? `<a href="mailto:${esc(email)}" class="contact-btn contact-btn-email">📧 Email</a>` : ""}
        ${phone ? `<a href="${whatsappUrl(phone)}" target="_blank" class="contact-btn contact-btn-wa">💬 WhatsApp</a>` : ""}
      </div>
      <div class="contact-details">
        ${p.address ? `<span>📍 ${esc(p.address)}</span>` : ""}
        ${p.businessHours ? `<span>🕐 ${esc(p.businessHours)}</span>` : ""}
      </div>
    </div>
  </section>

  ${footerHtml(input)}
  ${whatsappFloating(phone)}
</body>
</html>`;
}
