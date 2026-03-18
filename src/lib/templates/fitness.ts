import type { TemplateInput } from "./shared";
import { esc, contactEmail, contactPhone, whatsappUrl, sharedHead, footerHtml, sharedFooterCss, whatsappFloating } from "./shared";

export function generateFitnessHtml(input: TemplateInput): string {
  const { project: p, content, colors } = input;
  const email = contactEmail(p);
  const phone = contactPhone(p);
  const lang = p.language || "es";
  const photos = p.photos;

  const heroImg = photos[0];

  const programsHtml = content.services.map((s, i) => {
    const img = photos.length > 0 ? photos[i % photos.length] : null;
    return `<div class="program-card">
      ${img ? `<div class="program-img"><img src="${esc(img)}" alt="${esc(s.name)}" /></div>` : `<div class="program-img program-placeholder"><span>⚡</span></div>`}
      <div class="program-body">
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.description)}</p>
        <a href="#contact" class="program-cta">${lang === "en" ? "Join now" : "Únete"} →</a>
      </div>
    </div>`;
  }).join("");

  const statsHtml = (content.heroStats || []).map(s => `
    <div class="stat-box">
      <div class="stat-val">${esc(s.value)}</div>
      <div class="stat-label">${esc(s.label)}</div>
    </div>`).join("");

  const featuresHtml = content.features.map(f => `
    <div class="perk-card">
      <div class="perk-icon">⚡</div>
      <h3>${esc(f.title)}</h3>
      <p>${esc(f.description)}</p>
    </div>`).join("");

  const testimonialsHtml = (content.testimonials || []).map(t => `
    <div class="review-card">
      <div class="review-stars">${"★".repeat(t.rating || 5)}</div>
      <p class="review-text">"${esc(t.text)}"</p>
      <p class="review-name">${esc(t.name)}</p>
    </div>`).join("");

  const faqHtml = (content.faq || []).map(f => `
    <details class="faq-item">
      <summary>${esc(f.question)}</summary>
      <p>${esc(f.answer)}</p>
    </details>`).join("");

  const galleryHtml = photos.length > 2 ? `
  <section class="gallery">
    <div class="container">
      <p class="tag">${lang === "en" ? "Gallery" : "Galería"}</p>
      <div class="gallery-grid">${photos.slice(0, 6).map(ph => `<img src="${esc(ph)}" alt="" class="gallery-img" />`).join("")}</div>
    </div>
  </section>` : "";

  return `${sharedHead(p.businessName, content.heroSubtitle || p.sector, "Space Grotesk", lang)}
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Space Grotesk',sans-serif; background:#0a0a0a; color:#f0f0f0; }
h1,h2,h3 { font-family:'Space Grotesk',sans-serif; font-weight:700; }
a { color:inherit; text-decoration:none; }
img { max-width:100%; height:auto; }
.container { max-width:1200px; margin:0 auto; padding:0 2rem; }

/* Nav */
nav { padding:1.25rem 2rem; display:flex; align-items:center; justify-content:space-between; max-width:1200px; margin:0 auto; }
.nav-brand { display:flex; align-items:center; gap:0.75rem; }
.nav-logo { width:36px; height:36px; object-fit:contain; border-radius:8px; }
.nav-name { font-weight:700; font-size:1.1rem; text-transform:uppercase; letter-spacing:0.1em; }
.nav-links { display:flex; gap:2rem; font-size:0.8rem; font-weight:500; color:#999; text-transform:uppercase; letter-spacing:0.08em; }
.nav-links a:hover { color:${colors.accent}; }
.nav-cta { font-size:0.8rem; font-weight:700; padding:0.7rem 1.75rem; background:${colors.accent}; color:${colors.accentText}; border-radius:4px; text-transform:uppercase; letter-spacing:0.08em; transition:transform 0.2s; }
.nav-cta:hover { transform:scale(1.05); }

/* Hero - bold split */
.hero { position:relative; min-height:90vh; display:flex; align-items:center; overflow:hidden; }
.hero-bg { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0.35; }
.hero-overlay { position:absolute; inset:0; background:linear-gradient(135deg, #0a0a0a 30%, transparent 100%); }
.hero-content { position:relative; z-index:2; max-width:1200px; margin:0 auto; padding:4rem 2rem; width:100%; }
.hero-tag { font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.3em; color:${colors.accent}; margin-bottom:1.5rem; display:inline-block; padding:0.4rem 1rem; border:1px solid ${colors.accent}; border-radius:2px; }
.hero h1 { font-size:clamp(3rem,8vw,6rem); font-weight:900; line-height:0.95; text-transform:uppercase; letter-spacing:-0.03em; max-width:700px; }
.hero h1 .accent { color:${colors.accent}; }
.hero-sub { margin-top:1.5rem; font-size:1rem; color:#999; max-width:450px; line-height:1.7; }
.hero-btns { margin-top:2.5rem; display:flex; gap:1rem; flex-wrap:wrap; }
.hero-btn-primary { padding:1rem 2.5rem; background:${colors.accent}; color:${colors.accentText}; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.08em; border-radius:4px; transition:transform 0.2s; }
.hero-btn-primary:hover { transform:scale(1.05); }
.hero-btn-ghost { padding:1rem 2.5rem; border:1.5px solid #333; color:#ccc; font-weight:600; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.08em; border-radius:4px; transition:all 0.3s; }
.hero-btn-ghost:hover { border-color:${colors.accent}; color:${colors.accent}; }

/* Stats bar */
.stats-bar { background:#111; border-top:1px solid #1a1a1a; border-bottom:1px solid #1a1a1a; }
.stats-inner { max-width:1200px; margin:0 auto; padding:2.5rem 2rem; display:grid; grid-template-columns:repeat(4,1fr); gap:2rem; }
.stat-box { text-align:center; }
.stat-val { font-size:2.5rem; font-weight:900; color:${colors.accent}; }
.stat-label { font-size:0.75rem; color:#666; text-transform:uppercase; letter-spacing:0.1em; margin-top:0.25rem; }

/* About */
.about { padding:6rem 0; }
.about-grid { max-width:1200px; margin:0 auto; padding:0 2rem; display:grid; grid-template-columns:1fr 1fr; gap:4rem; align-items:center; }
.about-img { width:100%; height:450px; object-fit:cover; border-radius:8px; }
.about-placeholder { width:100%; height:450px; border-radius:8px; background:#151515; }
.tag { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.25em; color:${colors.accent}; margin-bottom:1rem; }
.about-text { font-size:1.5rem; font-weight:600; line-height:1.3; color:#e0e0e0; }
.about-highlights { margin-top:2rem; display:flex; flex-direction:column; gap:1rem; }
.about-hl { display:flex; gap:0.75rem; align-items:start; }
.about-check { width:22px; height:22px; background:${colors.accent}; color:${colors.accentText}; display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:700; flex-shrink:0; border-radius:3px; margin-top:2px; }
.about-hl-title { font-weight:600; font-size:0.9rem; }
.about-hl-desc { font-size:0.8rem; color:#888; }

/* Programs */
.programs { padding:6rem 0; background:#111; }
.programs-inner { max-width:1200px; margin:0 auto; padding:0 2rem; }
.section-header { text-align:center; margin-bottom:3rem; }
.section-header h2 { font-size:2.2rem; text-transform:uppercase; letter-spacing:-0.02em; margin-top:0.5rem; }
.programs-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.program-card { background:#0a0a0a; border:1px solid #1a1a1a; border-radius:8px; overflow:hidden; transition:border-color 0.3s; }
.program-card:hover { border-color:${colors.accent}44; }
.program-img { height:220px; overflow:hidden; }
.program-img img { width:100%; height:100%; object-fit:cover; transition:transform 0.5s; }
.program-card:hover .program-img img { transform:scale(1.06); }
.program-placeholder { display:flex; align-items:center; justify-content:center; background:#151515; font-size:2rem; color:${colors.accent}33; }
.program-body { padding:1.75rem; }
.program-body h3 { font-size:1.1rem; text-transform:uppercase; letter-spacing:0.03em; margin-bottom:0.5rem; }
.program-body p { font-size:0.8rem; color:#888; line-height:1.6; margin-bottom:1rem; }
.program-cta { font-size:0.75rem; font-weight:700; color:${colors.accent}; text-transform:uppercase; letter-spacing:0.08em; }

/* Perks */
.perks { padding:5rem 0; }
.perks-inner { max-width:1200px; margin:0 auto; padding:0 2rem; }
.perks-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1.5rem; }
.perk-card { text-align:center; padding:2rem 1.5rem; background:#111; border:1px solid #1a1a1a; border-radius:8px; }
.perk-icon { font-size:1.5rem; color:${colors.accent}; margin-bottom:1rem; }
.perk-card h3 { font-size:0.95rem; text-transform:uppercase; letter-spacing:0.03em; margin-bottom:0.5rem; }
.perk-card p { font-size:0.8rem; color:#777; line-height:1.6; }

/* Gallery */
.gallery { padding:5rem 0; background:#111; }
.gallery-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0.75rem; margin-top:2rem; }
.gallery-img { width:100%; height:220px; object-fit:cover; border-radius:6px; }

/* CTA banner */
.cta-banner { padding:6rem 0; background:linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%); text-align:center; }
.cta-banner h2 { font-size:clamp(2rem,5vw,3.5rem); text-transform:uppercase; color:#fff; }
.cta-banner p { font-size:1rem; color:#ffffffbb; margin-top:1rem; max-width:500px; margin-left:auto; margin-right:auto; }
.cta-banner-btn { display:inline-block; margin-top:2rem; padding:1rem 3rem; background:#fff; color:#0a0a0a; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.08em; border-radius:4px; transition:transform 0.2s; }
.cta-banner-btn:hover { transform:scale(1.05); }

/* Testimonials */
.reviews-section { padding:6rem 0; }
.reviews-inner { max-width:1200px; margin:0 auto; padding:0 2rem; }
.reviews-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.review-card { padding:2rem; background:#111; border:1px solid #1a1a1a; border-radius:8px; }
.review-stars { color:${colors.accent}; margin-bottom:0.75rem; }
.review-text { font-size:0.9rem; color:#ccc; line-height:1.6; font-style:italic; margin-bottom:1rem; }
.review-name { font-size:0.8rem; font-weight:600; color:#888; }

/* FAQ */
.faq-section { max-width:800px; margin:0 auto; padding:6rem 2rem; }
.faq-item { border-bottom:1px solid #1a1a1a; }
.faq-item summary { padding:1.25rem 0; font-weight:600; cursor:pointer; font-size:1rem; list-style:none; color:#e0e0e0; }
.faq-item summary::-webkit-details-marker { display:none; }
.faq-item p { padding:0 0 1.25rem; font-size:0.85rem; color:#888; line-height:1.6; }

/* Contact */
.contact { background:#111; padding:6rem 0; text-align:center; }
.contact-inner { max-width:800px; margin:0 auto; padding:0 2rem; }
.contact h2 { font-size:clamp(2rem,5vw,3rem); text-transform:uppercase; margin-bottom:1rem; }
.contact-sub { font-size:1rem; color:#999; margin-bottom:2rem; }
.contact-btns { display:flex; justify-content:center; gap:1rem; flex-wrap:wrap; }
.contact-btn { padding:0.875rem 2rem; font-weight:700; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.08em; border-radius:4px; display:inline-flex; align-items:center; gap:0.5rem; transition:transform 0.2s; }
.contact-btn:hover { transform:scale(1.05); }
.contact-btn-email { background:#f0f0f0; color:#0a0a0a; }
.contact-btn-wa { background:#25D366; color:#fff; }
.contact-details { margin-top:2rem; display:flex; justify-content:center; gap:2rem; flex-wrap:wrap; font-size:0.8rem; color:#666; }

/* Override footer for dark theme */
footer { border-top:1px solid #1a1a1a; padding:3rem 0; background:#0a0a0a; }
.footer-tagline { color:#666!important; }
.footer-links { color:#666!important; }
.footer-links a { color:${colors.accent}!important; }
.footer-copy { color:#555!important; }
.social-links { color:${colors.accent}!important; }
.whatsapp-float { position:fixed; bottom:1.5rem; right:1.5rem; width:56px; height:56px; border-radius:50%; background:#25D366; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 16px rgba(0,0,0,0.4); z-index:50; transition:transform 0.2s; }
.whatsapp-float:hover { transform:scale(1.1); }

@media (max-width:768px) {
  .hero h1 { font-size:2.8rem; }
  .hero { min-height:70vh; }
  .stats-inner { grid-template-columns:repeat(2,1fr); }
  .about-grid { grid-template-columns:1fr; }
  .programs-grid { grid-template-columns:1fr; }
  .perks-grid { grid-template-columns:repeat(2,1fr); }
  .gallery-grid { grid-template-columns:repeat(2,1fr); }
  .reviews-grid { grid-template-columns:1fr; }
  .nav-links,.nav-cta { display:none; }
}
</style>
</head>
<body>
  <nav>
    <div class="nav-brand">
      ${p.logo ? `<img src="${esc(p.logo)}" alt="" class="nav-logo" />` : ""}
      <span class="nav-name">${esc(p.businessName)}</span>
    </div>
    <div class="nav-links">
      <a href="#about">${lang === "en" ? "About" : "Nosotros"}</a>
      <a href="#programs">${lang === "en" ? "Programs" : "Programas"}</a>
      <a href="#contact">${lang === "en" ? "Contact" : "Contacto"}</a>
    </div>
    <a href="#contact" class="nav-cta">${lang === "en" ? "Start now" : "Empieza ya"}</a>
  </nav>

  <section class="hero">
    ${heroImg ? `<img src="${esc(heroImg)}" alt="${esc(p.businessName)}" class="hero-bg" />` : ""}
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <span class="hero-tag">${esc(p.slogan || p.sector)}</span>
      <h1>${esc(content.heroHeadline)}</h1>
      <p class="hero-sub">${esc(content.heroSubtitle)}</p>
      <div class="hero-btns">
        <a href="#contact" class="hero-btn-primary">${esc(content.heroCta)} →</a>
        <a href="#programs" class="hero-btn-ghost">${lang === "en" ? "Our programs" : "Ver programas"}</a>
      </div>
    </div>
  </section>

  ${statsHtml ? `
  <section class="stats-bar">
    <div class="stats-inner">
      ${statsHtml}
      ${content.categories?.slice(0, 4 - (content.heroStats?.length || 0)).map(c => `<div class="stat-box"><div class="stat-val">⚡</div><div class="stat-label">${esc(c.title)}</div></div>`).join("") || ""}
    </div>
  </section>` : ""}

  <section id="about" class="about">
    <div class="about-grid">
      <div>
        <p class="tag">${esc(content.aboutTitle)}</p>
        <p class="about-text">${esc(content.aboutText)}</p>
        <div class="about-highlights">
          ${content.aboutHighlights.map(h => `<div class="about-hl"><div class="about-check">✓</div><div><p class="about-hl-title">${esc(h.title)}</p><p class="about-hl-desc">${esc(h.description)}</p></div></div>`).join("")}
        </div>
      </div>
      ${photos.length > 1 ? `<img src="${esc(photos[1])}" alt="${esc(p.businessName)}" class="about-img" />` : photos.length > 0 ? `<img src="${esc(photos[0])}" alt="${esc(p.businessName)}" class="about-img" />` : `<div class="about-placeholder"></div>`}
    </div>
  </section>

  <section id="programs" class="programs">
    <div class="programs-inner">
      <div class="section-header">
        <p class="tag">${esc(content.servicesTitle)}</p>
        <h2>${esc(content.servicesSubtitle)}</h2>
      </div>
      <div class="programs-grid">${programsHtml}</div>
    </div>
  </section>

  ${featuresHtml ? `
  <section class="perks">
    <div class="perks-inner">
      <div class="section-header">
        <p class="tag">${esc(content.featuresTitle)}</p>
        <h2>${esc(content.featuresSubtitle)}</h2>
      </div>
      <div class="perks-grid">${featuresHtml}</div>
    </div>
  </section>` : ""}

  ${galleryHtml}

  <section class="cta-banner">
    <h2>${esc(content.ctaTitle)}</h2>
    <p>${esc(content.ctaSubtitle)}</p>
    <a href="#contact" class="cta-banner-btn">${esc(content.ctaCta)} →</a>
  </section>

  ${testimonialsHtml ? `
  <section class="reviews-section">
    <div class="reviews-inner">
      <div class="section-header">
        <p class="tag">${lang === "en" ? "Reviews" : "Opiniones"}</p>
        <h2>${lang === "en" ? "What our members say" : "Lo que dicen nuestros miembros"}</h2>
      </div>
      <div class="reviews-grid">${testimonialsHtml}</div>
    </div>
  </section>` : ""}

  ${faqHtml ? `
  <section class="faq-section">
    <div class="section-header">
      <p class="tag">FAQ</p>
      <h2>${lang === "en" ? "Questions?" : "Preguntas frecuentes"}</h2>
    </div>
    ${faqHtml}
  </section>` : ""}

  <section id="contact" class="contact">
    <div class="contact-inner">
      <h2>${esc(content.contactTitle)}</h2>
      <p class="contact-sub">${esc(content.contactSubtitle)}</p>
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
