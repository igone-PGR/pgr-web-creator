import type { TemplateInput } from "./shared";
import { esc, contactEmail, contactPhone, whatsappUrl, sharedHead, footerHtml, sharedFooterCss, whatsappFloating } from "./shared";

export function generateEsteticaHtml(input: TemplateInput): string {
  const { project: p, content, colors } = input;
  const email = contactEmail(p);
  const phone = contactPhone(p);
  const lang = p.language || "es";
  const photos = p.photos;

  const treatmentsHtml = content.services.map((s, i) => {
    const img = photos.length > 0 ? photos[i % photos.length] : null;
    return `<div class="treatment-card">
      ${img ? `<div class="treatment-img"><img src="${esc(img)}" alt="${esc(s.name)}" /></div>` : `<div class="treatment-img treatment-placeholder"><span>✦</span></div>`}
      <div class="treatment-body">
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.description)}</p>
        <a href="#contact" class="treatment-link">${lang === "en" ? "Book now" : "Reservar"} →</a>
      </div>
    </div>`;
  }).join("");

  const testimonialsHtml = (content.testimonials || []).map(t => `
    <div class="testi-card">
      <div class="testi-stars">${"★".repeat(t.rating || 5)}</div>
      <p class="testi-text">"${esc(t.text)}"</p>
      <p class="testi-author">${esc(t.name)}</p>
    </div>`).join("");

  const faqHtml = (content.faq || []).map(f => `
    <details class="faq-item">
      <summary>${esc(f.question)}</summary>
      <p>${esc(f.answer)}</p>
    </details>`).join("");

  const featuresHtml = content.features.map(f => `
    <div class="benefit-card">
      <div class="benefit-icon">✦</div>
      <h3>${esc(f.title)}</h3>
      <p>${esc(f.description)}</p>
    </div>`).join("");

  const galleryHtml = photos.length > 2 ? `
  <section class="gallery-section">
    <div class="container">
      <p class="tag center">${lang === "en" ? "Gallery" : "Galería"}</p>
      <div class="gallery-grid">${photos.slice(0, 6).map(ph => `<img src="${esc(ph)}" alt="" class="gallery-img" />`).join("")}</div>
    </div>
  </section>` : "";

  return `${sharedHead(p.businessName, content.heroSubtitle || p.sector, "Cormorant Garamond", lang)}
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Plus Jakarta Sans',sans-serif; background:${colors.bg}; color:${colors.text1}; }
h1,h2,h3 { font-family:'Cormorant Garamond',serif; font-weight:600; }
a { color:inherit; text-decoration:none; }
img { max-width:100%; height:auto; }
.container { max-width:1200px; margin:0 auto; padding:0 2rem; }
.center { text-align:center; }

/* Nav */
nav { padding:1.25rem 2rem; display:flex; align-items:center; justify-content:center; gap:3rem; border-bottom:1px solid ${colors.border}; }
.nav-brand { display:flex; align-items:center; gap:0.75rem; }
.nav-logo { width:36px; height:36px; object-fit:contain; border-radius:50%; }
.nav-name { font-family:'Cormorant Garamond',serif; font-weight:600; font-size:1.4rem; letter-spacing:0.05em; }
.nav-links { display:flex; gap:2rem; font-size:0.8rem; font-weight:500; color:${colors.text2}; text-transform:uppercase; letter-spacing:0.1em; }
.nav-links a:hover { color:${colors.accent}; }
.nav-cta { font-size:0.75rem; font-weight:600; padding:0.6rem 1.5rem; border:1.5px solid ${colors.accent}; color:${colors.accent}; border-radius:0; letter-spacing:0.1em; text-transform:uppercase; transition:all 0.3s; }
.nav-cta:hover { background:${colors.accent}; color:${colors.accentText}; }

/* Hero - elegant centered */
.hero { text-align:center; padding:6rem 2rem 5rem; position:relative; overflow:hidden; }
.hero::before { content:''; position:absolute; top:0; left:50%; transform:translateX(-50%); width:1px; height:80px; background:${colors.accent}; }
.hero-tag { font-size:0.7rem; font-weight:600; text-transform:uppercase; letter-spacing:0.35em; color:${colors.accent}; margin-bottom:2rem; margin-top:2rem; }
.hero h1 { font-size:clamp(2.5rem,6vw,4.5rem); font-weight:500; line-height:1.1; max-width:800px; margin:0 auto; letter-spacing:-0.01em; }
.hero-sub { margin-top:1.5rem; font-size:1rem; color:${colors.text2}; max-width:550px; margin-left:auto; margin-right:auto; line-height:1.7; }
.hero-btn { display:inline-block; margin-top:2.5rem; padding:1rem 3rem; border:1.5px solid ${colors.accent}; color:${colors.accent}; font-weight:600; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.15em; transition:all 0.3s; }
.hero-btn:hover { background:${colors.accent}; color:${colors.accentText}; }
.hero-photos { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; max-width:900px; margin:3rem auto 0; }
.hero-photo { width:100%; height:300px; object-fit:cover; }

/* About */
.about { padding:6rem 0; background:${colors.bgAlt}; }
.about-grid { max-width:1200px; margin:0 auto; padding:0 2rem; display:grid; grid-template-columns:1fr 1fr; gap:4rem; align-items:center; }
.about-img { width:100%; height:480px; object-fit:cover; }
.about-placeholder { width:100%; height:480px; background:${colors.accent}08; }
.tag { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.3em; color:${colors.accent}; margin-bottom:1rem; }
.about-text { font-family:'Cormorant Garamond',serif; font-size:1.8rem; font-weight:500; line-height:1.35; }
.about-highlights { margin-top:2rem; display:flex; flex-direction:column; gap:1rem; }
.about-hl { display:flex; gap:0.75rem; align-items:start; }
.about-dot { width:8px; height:8px; border-radius:50%; background:${colors.accent}; flex-shrink:0; margin-top:6px; }
.about-hl-title { font-weight:600; font-size:0.9rem; }
.about-hl-desc { font-size:0.8rem; color:${colors.text2}; }

/* Treatments */
.treatments { padding:6rem 0; }
.treatments-inner { max-width:1200px; margin:0 auto; padding:0 2rem; }
.treatments-header { text-align:center; margin-bottom:3rem; }
.treatments-header h2 { font-size:2.2rem; margin-top:0.5rem; }
.treatments-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.treatment-card { border:1px solid ${colors.border}; background:${colors.card}; overflow:hidden; transition:box-shadow 0.3s; }
.treatment-card:hover { box-shadow:0 12px 40px rgba(0,0,0,0.06); }
.treatment-img { height:240px; overflow:hidden; }
.treatment-img img { width:100%; height:100%; object-fit:cover; transition:transform 0.6s; }
.treatment-card:hover .treatment-img img { transform:scale(1.04); }
.treatment-placeholder { display:flex; align-items:center; justify-content:center; background:${colors.accent}08; font-size:2rem; color:${colors.accent}22; }
.treatment-body { padding:1.75rem; }
.treatment-body h3 { font-size:1.2rem; margin-bottom:0.5rem; }
.treatment-body p { font-size:0.8rem; color:${colors.text2}; line-height:1.6; margin-bottom:1rem; }
.treatment-link { font-size:0.75rem; font-weight:600; color:${colors.accent}; text-transform:uppercase; letter-spacing:0.1em; }
.treatment-link:hover { opacity:0.7; }

/* Benefits */
.benefits { padding:5rem 0; background:${colors.bgAlt}; }
.benefits-inner { max-width:1200px; margin:0 auto; padding:0 2rem; }
.benefits-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1.5rem; }
.benefit-card { text-align:center; padding:2rem 1.5rem; }
.benefit-icon { font-size:1.5rem; color:${colors.accent}; margin-bottom:1rem; }
.benefit-card h3 { font-size:1rem; margin-bottom:0.5rem; }
.benefit-card p { font-size:0.8rem; color:${colors.text2}; line-height:1.6; }

/* Gallery */
.gallery-section { padding:5rem 0; }
.gallery-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-top:2rem; }
.gallery-img { width:100%; height:250px; object-fit:cover; }

/* Testimonials */
.testimonials { padding:6rem 0; background:${colors.bg}; }
.testi-inner { max-width:1200px; margin:0 auto; padding:0 2rem; }
.testi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.testi-card { padding:2rem; border:1px solid ${colors.border}; background:${colors.card}; text-align:center; }
.testi-stars { color:${colors.accent}; margin-bottom:0.75rem; }
.testi-text { font-family:'Cormorant Garamond',serif; font-size:1.1rem; line-height:1.5; font-style:italic; margin-bottom:1rem; }
.testi-author { font-size:0.8rem; font-weight:600; color:${colors.text2}; }

/* FAQ */
.faq-section { max-width:800px; margin:0 auto; padding:6rem 2rem; }
.faq-item { border-bottom:1px solid ${colors.border}; }
.faq-item summary { padding:1.25rem 0; font-weight:600; cursor:pointer; font-size:1rem; list-style:none; }
.faq-item summary::-webkit-details-marker { display:none; }
.faq-item p { padding:0 0 1.25rem; font-size:0.85rem; color:${colors.text2}; line-height:1.6; }

/* Contact */
.contact { background:${colors.accentDark}; padding:6rem 0; text-align:center; }
.contact-inner { max-width:800px; margin:0 auto; padding:0 2rem; }
.contact h2 { font-size:clamp(2rem,5vw,3.5rem); color:#fff; margin-bottom:1rem; }
.contact-sub { font-size:1rem; color:#ffffffbb; margin-bottom:2rem; }
.contact-btns { display:flex; justify-content:center; gap:1rem; flex-wrap:wrap; }
.contact-btn { padding:0.875rem 2rem; font-weight:600; font-size:0.8rem; display:inline-flex; align-items:center; gap:0.5rem; text-transform:uppercase; letter-spacing:0.1em; transition:all 0.3s; }
.contact-btn-email { border:1.5px solid ${colors.accentText}; color:${colors.accentText}; }
.contact-btn-email:hover { background:${colors.accentText}; color:${colors.accentDark}; }
.contact-btn-wa { background:#25D366; color:#fff; border:1.5px solid #25D366; }
.contact-details { margin-top:2rem; display:flex; justify-content:center; gap:2rem; flex-wrap:wrap; font-size:0.8rem; color:#ffffff88; }

${sharedFooterCss(colors)}

@media (max-width:768px) {
  nav { flex-direction:column; gap:1rem; }
  .nav-links,.nav-cta { display:none; }
  .hero h1 { font-size:2.2rem; }
  .hero-photos { grid-template-columns:1fr; }
  .hero-photo { height:250px; }
  .about-grid { grid-template-columns:1fr; }
  .treatments-grid { grid-template-columns:1fr; }
  .benefits-grid { grid-template-columns:repeat(2,1fr); }
  .gallery-grid { grid-template-columns:repeat(2,1fr); }
  .testi-grid { grid-template-columns:1fr; }
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
      <a href="#treatments">${lang === "en" ? "Treatments" : "Tratamientos"}</a>
      <a href="#contact">${lang === "en" ? "Contact" : "Contacto"}</a>
    </div>
    <a href="#contact" class="nav-cta">${lang === "en" ? "Book" : "Reservar"}</a>
  </nav>

  <section class="hero">
    <p class="hero-tag">${esc(p.slogan || p.sector)}</p>
    <h1>${esc(content.heroHeadline)}</h1>
    <p class="hero-sub">${esc(content.heroSubtitle)}</p>
    <a href="#contact" class="hero-btn">${esc(content.heroCta)} →</a>
    ${photos.length > 0 ? `<div class="hero-photos">${photos.slice(0, 3).map(ph => `<img src="${esc(ph)}" alt="" class="hero-photo" />`).join("")}</div>` : ""}
  </section>

  <section id="about" class="about">
    <div class="about-grid">
      ${photos.length > 0 ? `<img src="${esc(photos[Math.min(1, photos.length - 1)])}" alt="${esc(p.businessName)}" class="about-img" />` : `<div class="about-placeholder"></div>`}
      <div>
        <p class="tag">${esc(content.aboutTitle)}</p>
        <p class="about-text">${esc(content.aboutText)}</p>
        <div class="about-highlights">
          ${content.aboutHighlights.map(h => `<div class="about-hl"><div class="about-dot"></div><div><p class="about-hl-title">${esc(h.title)}</p><p class="about-hl-desc">${esc(h.description)}</p></div></div>`).join("")}
        </div>
      </div>
    </div>
  </section>

  <section id="treatments" class="treatments">
    <div class="treatments-inner">
      <div class="treatments-header">
        <p class="tag">${esc(content.servicesTitle)}</p>
        <h2>${esc(content.servicesSubtitle)}</h2>
      </div>
      <div class="treatments-grid">${treatmentsHtml}</div>
    </div>
  </section>

  ${featuresHtml ? `
  <section class="benefits">
    <div class="benefits-inner">
      <div class="treatments-header">
        <p class="tag">${esc(content.featuresTitle)}</p>
        <h2>${esc(content.featuresSubtitle)}</h2>
      </div>
      <div class="benefits-grid">${featuresHtml}</div>
    </div>
  </section>` : ""}

  ${galleryHtml}

  ${testimonialsHtml ? `
  <section class="testimonials">
    <div class="testi-inner">
      <div class="treatments-header">
        <p class="tag">${lang === "en" ? "Reviews" : "Opiniones"}</p>
        <h2>${lang === "en" ? "What our clients say" : "Lo que dicen nuestros clientes"}</h2>
      </div>
      <div class="testi-grid">${testimonialsHtml}</div>
    </div>
  </section>` : ""}

  ${faqHtml ? `
  <section class="faq-section">
    <div class="treatments-header">
      <p class="tag">FAQ</p>
      <h2>${lang === "en" ? "Frequently asked questions" : "Preguntas frecuentes"}</h2>
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
