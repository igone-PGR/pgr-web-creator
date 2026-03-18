import type { TemplateInput } from "./shared";
import { esc, contactEmail, contactPhone, whatsappUrl, sharedHead, footerHtml, sharedFooterCss, whatsappFloating } from "./shared";

export function generateHosteleriaHtml(input: TemplateInput): string {
  const { project: p, content, colors } = input;
  const email = contactEmail(p);
  const phone = contactPhone(p);
  const lang = p.language || "es";
  const photos = p.photos;

  const heroImg = photos[0];
  const servicesHtml = content.services.map((s, i) => {
    const img = photos.length > 0 ? photos[i % photos.length] : null;
    return `<div class="menu-card">
      ${img ? `<div class="menu-img"><img src="${esc(img)}" alt="${esc(s.name)}" /></div>` : `<div class="menu-img menu-placeholder">✦</div>`}
      <div class="menu-body">
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.description)}</p>
      </div>
    </div>`;
  }).join("");

  const testimonialsHtml = (content.testimonials || []).map(t => `
    <div class="review-card">
      <div class="review-stars">${"★".repeat(t.rating || 5)}</div>
      <p class="review-text">"${esc(t.text)}"</p>
      <p class="review-author">— ${esc(t.name)}</p>
    </div>`).join("");

  const faqHtml = (content.faq || []).map(f => `
    <details class="faq-item">
      <summary>${esc(f.question)}</summary>
      <p>${esc(f.answer)}</p>
    </details>`).join("");

  const galleryHtml = photos.length > 2 ? `
  <section class="gallery">
    <div class="section-header"><p class="tag">Galería</p></div>
    <div class="gallery-grid">
      ${photos.slice(0, 8).map(ph => `<img src="${esc(ph)}" alt="" class="gallery-img" />`).join("")}
    </div>
  </section>` : "";

  return `${sharedHead(p.businessName, content.heroSubtitle || p.sector, "Playfair Display", lang)}
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Plus Jakarta Sans','Playfair Display',sans-serif; background:${colors.bg}; color:${colors.text1}; }
h1,h2,h3 { font-family:'Playfair Display',serif; }
a { color:inherit; text-decoration:none; }
img { max-width:100%; height:auto; }

/* Nav */
nav { max-width:1200px; margin:0 auto; padding:1.25rem 2rem; display:flex; align-items:center; justify-content:space-between; }
.nav-brand { display:flex; align-items:center; gap:0.75rem; }
.nav-logo { width:36px; height:36px; object-fit:contain; border-radius:8px; }
.nav-name { font-family:'Playfair Display',serif; font-weight:700; font-size:1.2rem; letter-spacing:-0.02em; }
.nav-links { display:flex; gap:2rem; font-size:0.8rem; font-weight:500; color:${colors.text2}; }
.nav-links a:hover { color:${colors.accent}; }
.nav-cta { font-size:0.8rem; font-weight:600; padding:0.6rem 1.5rem; border-radius:9999px; background:${colors.accent}; color:${colors.accentText}; transition:transform 0.2s; }
.nav-cta:hover { transform:scale(1.05); }

/* Hero - full width image with overlay */
.hero { position:relative; min-height:85vh; display:flex; align-items:flex-end; overflow:hidden; background:${colors.accentDark}; }
.hero-bg { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0.55; }
.hero-overlay { position:absolute; inset:0; background:linear-gradient(to top, ${colors.accentDark} 0%, transparent 60%); }
.hero-content { position:relative; z-index:2; max-width:1200px; margin:0 auto; padding:4rem 2rem 5rem; width:100%; }
.hero-tag { font-size:0.7rem; font-weight:600; text-transform:uppercase; letter-spacing:0.3em; color:${colors.accent}; margin-bottom:1.5rem; }
.hero h1 { font-size:clamp(2.8rem,7vw,5rem); font-weight:700; line-height:1; color:#fff; max-width:700px; }
.hero-sub { margin-top:1.25rem; font-size:1.1rem; color:#ffffffbb; max-width:500px; line-height:1.7; font-family:'Plus Jakarta Sans',sans-serif; }
.hero-btn { display:inline-block; margin-top:2rem; padding:1rem 2.5rem; border-radius:9999px; background:${colors.accent}; color:${colors.accentText}; font-weight:700; font-size:0.9rem; font-family:'Plus Jakarta Sans',sans-serif; transition:transform 0.2s; }
.hero-btn:hover { transform:scale(1.05); }
.hero-placeholder { min-height:85vh; display:flex; align-items:center; justify-content:center; background:${colors.accentDark}; }

/* Highlights strip */
.highlights { background:${colors.accentDark}; border-bottom:1px solid ${colors.border}22; }
.highlights-inner { max-width:1200px; margin:0 auto; padding:2rem; display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
.highlight { text-align:center; padding:1.5rem 1rem; }
.highlight-val { font-family:'Playfair Display',serif; font-size:2rem; font-weight:700; color:${colors.accent}; }
.highlight-label { font-size:0.75rem; color:#ffffffaa; margin-top:0.25rem; font-family:'Plus Jakarta Sans',sans-serif; }

/* About */
.about { padding:6rem 0; background:${colors.bgAlt}; }
.about-grid { max-width:1200px; margin:0 auto; padding:0 2rem; display:grid; grid-template-columns:1fr 1fr; gap:4rem; align-items:center; }
.about-img { width:100%; height:450px; object-fit:cover; border-radius:1rem; }
.about-placeholder { width:100%; height:450px; border-radius:1rem; background:${colors.accent}10; }
.tag { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.25em; color:${colors.accent}; margin-bottom:1rem; }
.about-text { font-size:1.6rem; font-weight:600; line-height:1.3; font-family:'Playfair Display',serif; }
.about-highlights { margin-top:2rem; display:flex; flex-direction:column; gap:1rem; }
.about-highlight { display:flex; align-items:start; gap:0.75rem; }
.about-check { width:20px; height:20px; border-radius:50%; background:${colors.accent}; color:${colors.accentText}; display:flex; align-items:center; justify-content:center; font-size:0.7rem; flex-shrink:0; margin-top:2px; }
.about-h-title { font-weight:600; font-size:0.9rem; font-family:'Plus Jakarta Sans',sans-serif; }
.about-h-desc { font-size:0.8rem; color:${colors.text2}; font-family:'Plus Jakarta Sans',sans-serif; }

/* Menu/Services */
.menu { max-width:1200px; margin:0 auto; padding:6rem 2rem; }
.section-header { text-align:center; margin-bottom:3rem; }
.section-header h2 { font-size:2.2rem; font-weight:700; margin-top:0.5rem; }
.menu-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.menu-card { border-radius:1rem; overflow:hidden; border:1px solid ${colors.border}; background:${colors.card}; transition:box-shadow 0.3s; }
.menu-card:hover { box-shadow:0 8px 30px rgba(0,0,0,0.08); }
.menu-img { height:220px; overflow:hidden; }
.menu-img img { width:100%; height:100%; object-fit:cover; transition:transform 0.5s; }
.menu-card:hover .menu-img img { transform:scale(1.06); }
.menu-placeholder { display:flex; align-items:center; justify-content:center; background:${colors.accent}10; font-size:2rem; color:${colors.accent}33; }
.menu-body { padding:1.5rem; }
.menu-body h3 { font-size:1.15rem; margin-bottom:0.5rem; }
.menu-body p { font-size:0.85rem; color:${colors.text2}; line-height:1.6; font-family:'Plus Jakarta Sans',sans-serif; }

/* Gallery */
.gallery { max-width:1200px; margin:0 auto; padding:4rem 2rem; }
.gallery-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0.75rem; }
.gallery-img { width:100%; height:200px; object-fit:cover; border-radius:0.75rem; }

/* Reviews */
.reviews { background:${colors.bgAlt}; padding:6rem 0; }
.reviews-inner { max-width:1200px; margin:0 auto; padding:0 2rem; }
.reviews-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.review-card { padding:2rem; border-radius:1rem; background:${colors.card}; border:1px solid ${colors.border}; }
.review-stars { color:${colors.accent}; font-size:1rem; margin-bottom:0.75rem; }
.review-text { font-size:0.9rem; line-height:1.6; color:${colors.text1}; margin-bottom:0.75rem; font-style:italic; }
.review-author { font-size:0.8rem; color:${colors.text2}; font-weight:600; }

/* FAQ */
.faq-section { max-width:800px; margin:0 auto; padding:6rem 2rem; }
.faq-item { border-bottom:1px solid ${colors.border}; }
.faq-item summary { padding:1.25rem 0; font-weight:600; cursor:pointer; font-size:1rem; list-style:none; font-family:'Plus Jakarta Sans',sans-serif; }
.faq-item summary::-webkit-details-marker { display:none; }
.faq-item p { padding:0 0 1.25rem; font-size:0.875rem; color:${colors.text2}; line-height:1.6; font-family:'Plus Jakarta Sans',sans-serif; }

/* Contact */
.contact { background:${colors.accentDark}; padding:6rem 0; }
.contact-inner { max-width:900px; margin:0 auto; padding:0 2rem; text-align:center; }
.contact h2 { font-size:clamp(2rem,5vw,3.5rem); font-weight:700; color:#fff; margin-bottom:1rem; }
.contact-sub { font-size:1rem; color:#ffffffbb; margin-bottom:2rem; font-family:'Plus Jakarta Sans',sans-serif; }
.contact-btns { display:flex; justify-content:center; gap:1rem; flex-wrap:wrap; }
.contact-btn { padding:0.875rem 2rem; border-radius:9999px; font-weight:700; font-size:0.875rem; display:inline-flex; align-items:center; gap:0.5rem; transition:transform 0.2s; font-family:'Plus Jakarta Sans',sans-serif; }
.contact-btn:hover { transform:scale(1.05); }
.contact-btn-email { background:${colors.accentText}; color:${colors.accentDark}; }
.contact-btn-wa { background:#25D366; color:#fff; }
.contact-details { margin-top:2rem; display:flex; justify-content:center; gap:2rem; flex-wrap:wrap; font-size:0.85rem; color:#ffffff99; font-family:'Plus Jakarta Sans',sans-serif; }

${sharedFooterCss(colors)}

@media (max-width:768px) {
  .hero h1 { font-size:2.5rem; }
  .hero { min-height:60vh; }
  .highlights-inner { grid-template-columns:repeat(2,1fr); }
  .about-grid { grid-template-columns:1fr; }
  .menu-grid { grid-template-columns:1fr; }
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
      <a href="#menu">${lang === "en" ? "Menu" : "Carta"}</a>
      <a href="#contact">${lang === "en" ? "Contact" : "Contacto"}</a>
    </div>
    <a href="#contact" class="nav-cta">${lang === "en" ? "Book" : "Reservar"} →</a>
  </nav>

  <section class="hero">
    ${heroImg ? `<img src="${esc(heroImg)}" alt="${esc(p.businessName)}" class="hero-bg" />` : ""}
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <p class="hero-tag">${esc(p.slogan || p.sector)}</p>
      <h1>${esc(content.heroHeadline)}</h1>
      <p class="hero-sub">${esc(content.heroSubtitle)}</p>
      <a href="#contact" class="hero-btn">${esc(content.heroCta)} →</a>
    </div>
  </section>

  ${content.heroStats?.length ? `
  <section class="highlights">
    <div class="highlights-inner">
      ${content.heroStats.map(s => `<div class="highlight"><div class="highlight-val">${esc(s.value)}</div><div class="highlight-label">${esc(s.label)}</div></div>`).join("")}
      ${content.categories?.slice(0, 4 - content.heroStats.length).map(c => `<div class="highlight"><div class="highlight-val">✦</div><div class="highlight-label">${esc(c.title)}</div></div>`).join("") || ""}
    </div>
  </section>` : ""}

  <section id="about" class="about">
    <div class="about-grid">
      ${photos.length > 0 ? `<img src="${esc(photos[Math.min(1, photos.length - 1)])}" alt="${esc(p.businessName)}" class="about-img" />` : `<div class="about-placeholder"></div>`}
      <div>
        <p class="tag">${esc(content.aboutTitle)}</p>
        <p class="about-text">${esc(content.aboutText)}</p>
        <div class="about-highlights">
          ${content.aboutHighlights.map(h => `<div class="about-highlight"><div class="about-check">✓</div><div><p class="about-h-title">${esc(h.title)}</p><p class="about-h-desc">${esc(h.description)}</p></div></div>`).join("")}
        </div>
      </div>
    </div>
  </section>

  <section id="menu" class="menu">
    <div class="section-header">
      <p class="tag">${esc(content.servicesTitle)}</p>
      <h2>${esc(content.servicesSubtitle)}</h2>
    </div>
    <div class="menu-grid">${servicesHtml}</div>
  </section>

  ${galleryHtml}

  ${testimonialsHtml ? `
  <section class="reviews">
    <div class="reviews-inner">
      <div class="section-header"><p class="tag">Opiniones</p><h2>${lang === "en" ? "What our guests say" : "Lo que dicen nuestros clientes"}</h2></div>
      <div class="reviews-grid">${testimonialsHtml}</div>
    </div>
  </section>` : ""}

  ${faqHtml ? `
  <section class="faq-section">
    <div class="section-header"><p class="tag">FAQ</p><h2>${lang === "en" ? "Frequently asked questions" : "Preguntas frecuentes"}</h2></div>
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
