import type { TemplateInput } from "./shared";
import { esc, contactEmail, contactPhone, whatsappUrl, safeHref } from "./shared";

// Sector-specific Unsplash fallback images
const SECTOR_FALLBACK_IMAGES: Record<string, string[]> = {
  "Hostelería": [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
  ],
  "Restauración": [
    "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80",
  ],
  "Estética": [
    "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80",
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
    "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80",
  ],
  "Salud": [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
    "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
  ],
  "Fitness": [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80",
  ],
  "Consultoría": [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
  ],
  "Educación": [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
  ],
  "Comercio": [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    "https://images.unsplash.com/photo-1528698827591-e19cef791f48?w=800&q=80",
  ],
  "Fotografía": [
    "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80",
    "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80",
    "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&q=80",
    "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
  ],
};

const DEFAULT_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
];

function getImages(input: TemplateInput): string[] {
  if (input.project.photos && input.project.photos.length > 0) {
    return input.project.photos;
  }
  return SECTOR_FALLBACK_IMAGES[input.project.sector] || DEFAULT_FALLBACK_IMAGES;
}

// Map icon names to FontAwesome classes
function faIcon(icon: string): string {
  const map: Record<string, string> = {
    star: "fa-star",
    heart: "fa-heart",
    shield: "fa-shield-alt",
    award: "fa-award",
    zap: "fa-bolt",
    check: "fa-check-circle",
    users: "fa-users",
    target: "fa-bullseye",
    sparkles: "fa-magic",
    gem: "fa-gem",
    code: "fa-code",
    laptop: "fa-laptop",
    headphones: "fa-headphones-alt",
    flag: "fa-flag",
    "paper-plane": "fa-paper-plane",
  };
  return map[icon] || "fa-star";
}

export function generateSpectralHtml(input: TemplateInput): string {
  const { project: p, content, colors } = input;
  const email = contactEmail(p);
  const phone = contactPhone(p);
  const lang = p.language || "es";
  const images = getImages(input);

  const bannerImg = images[0];

  // Spotlight sections (services with images)
  const spotlightsHtml = content.services.slice(0, 3).map((s, i) => {
    const img = images[i % images.length];
    return `<section class="spotlight">
      <div class="image"><img src="${esc(img)}" alt="${esc(s.name)}" /></div>
      <div class="content">
        <h2>${esc(s.name)}</h2>
        <p>${esc(s.description)}</p>
      </div>
    </section>`;
  }).join("\n");

  // Features grid
  const featuresHtml = content.features.slice(0, 6).map((f, i) => {
    const icons = ["fa-paper-plane", "fa-laptop", "fa-code", "fa-headphones-alt", "fa-heart", "fa-flag"];
    const iconClass = faIcon(content.categories?.[i]?.icon || "") || icons[i % icons.length];
    return `<li class="icon solid ${iconClass}">
      <h3>${esc(f.title)}</h3>
      <p>${esc(f.description)}</p>
    </li>`;
  }).join("\n");

  // Icon highlights in section one
  const iconHighlightsHtml = (content.categories || []).slice(0, 3).map((c, i) => {
    const styles = ["style1", "style2", "style3"];
    const iconClass = faIcon(c.icon);
    return `<li><span class="icon ${iconClass.startsWith("fa-") && !["fa-gem", "fa-heart", "fa-flag", "fa-paper-plane", "fa-star"].includes(iconClass) ? "solid " : ""}${iconClass} major ${styles[i % 3]}"><span class="label">${esc(c.title)}</span></span></li>`;
  }).join("\n");

  // Social links for footer
  const socialIconsHtml: string[] = [];
  if (p.instagram) {
    socialIconsHtml.push(`<li><a href="${safeHref(`https://instagram.com/${p.instagram.replace("@", "")}`)}" target="_blank" rel="noreferrer" class="icon brands fa-instagram"><span class="label">Instagram</span></a></li>`);
  }
  if (p.facebook) {
    socialIconsHtml.push(`<li><a href="${safeHref(p.facebook)}" target="_blank" rel="noreferrer" class="icon brands fa-facebook-f"><span class="label">Facebook</span></a></li>`);
  }
  if (email) {
    socialIconsHtml.push(`<li><a href="mailto:${esc(email)}" class="icon solid fa-envelope"><span class="label">Email</span></a></li>`);
  }
  if (phone) {
    socialIconsHtml.push(`<li><a href="tel:${esc(phone)}" class="icon solid fa-phone"><span class="label">${lang === "en" ? "Phone" : "Teléfono"}</span></a></li>`);
  }

  // Testimonials section
  const testimonialsHtml = (content.testimonials || []).map(t => `
    <div class="testimonial-card">
      <div class="testimonial-stars">${"★".repeat(t.rating || 5)}</div>
      <p class="testimonial-text">"${esc(t.text)}"</p>
      <p class="testimonial-author">— ${esc(t.name)}</p>
    </div>`).join("");

  // FAQ section
  const faqHtml = (content.faq || []).map(f => `
    <div class="faq-item">
      <h4 class="faq-question">${esc(f.question)}</h4>
      <p class="faq-answer">${esc(f.answer)}</p>
    </div>`).join("");

  // Contact info section
  const contactInfoHtml: string[] = [];
  if (email) contactInfoHtml.push(`<li><span class="icon solid fa-envelope"></span> <a href="mailto:${esc(email)}">${esc(email)}</a></li>`);
  if (phone) contactInfoHtml.push(`<li><span class="icon solid fa-phone"></span> <a href="tel:${esc(phone)}">${esc(phone)}</a></li>`);
  if (p.address) contactInfoHtml.push(`<li><span class="icon solid fa-map-marker-alt"></span> ${esc(p.address)}</li>`);
  if (p.businessHours) contactInfoHtml.push(`<li><span class="icon solid fa-clock"></span> ${esc(p.businessHours)}</li>`);

  return `<!DOCTYPE HTML>
<html lang="${esc(lang)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
  <title>${esc(p.businessName)}${p.slogan ? ` — ${esc(p.slogan)}` : ""}</title>
  <meta name="description" content="${esc(content.heroSubtitle)}" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
  <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,400italic,600,600italic,800,800italic" rel="stylesheet" />
  <style>
    ${getSpectralCSS(colors, bannerImg)}
  </style>
</head>
<body class="landing is-preload">
  <div id="page-wrapper">

    <!-- Header -->
    <header id="header" class="alt">
      <h1><a href="#">${p.logo ? `<img src="${esc(p.logo)}" alt="${esc(p.businessName)}" style="height:32px;vertical-align:middle;margin-right:8px;border-radius:4px;" />` : ""}${esc(p.businessName)}</a></h1>
      <nav id="nav">
        <ul>
          <li class="special">
            <a href="#menu" class="menuToggle"><span>Menu</span></a>
            <div id="menu">
              <ul>
                <li><a href="#banner">${lang === "en" ? "Home" : "Inicio"}</a></li>
                <li><a href="#one">${lang === "en" ? "About" : "Nosotros"}</a></li>
                <li><a href="#two">${lang === "en" ? "Services" : "Servicios"}</a></li>
                <li><a href="#three">${lang === "en" ? "Why us" : "Por qué elegirnos"}</a></li>
                <li><a href="#contact">${lang === "en" ? "Contact" : "Contacto"}</a></li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>
    </header>

    <!-- Banner -->
    <section id="banner">
      <div class="inner">
        <h2>${esc(p.businessName)}</h2>
        <p>${esc(content.heroSubtitle)}</p>
        <ul class="actions special">
          <li><a href="#contact" class="button primary scrolly">${esc(content.heroCta)}</a></li>
        </ul>
      </div>
      <a href="#one" class="more scrolly">${lang === "en" ? "Learn More" : "Descubre más"}</a>
    </section>

    <!-- One: About -->
    <section id="one" class="wrapper style1 special">
      <div class="inner">
        <header class="major">
          <h2>${esc(content.aboutTitle)}</h2>
          <p>${esc(content.aboutText)}</p>
        </header>
        <ul class="icons major">
          ${iconHighlightsHtml}
        </ul>
      </div>
    </section>

    <!-- Two: Services Spotlights -->
    <section id="two" class="wrapper alt style2">
      ${spotlightsHtml}
    </section>

    <!-- Three: Features -->
    <section id="three" class="wrapper style3 special">
      <div class="inner">
        <header class="major">
          <h2>${esc(content.featuresTitle)}</h2>
          <p>${esc(content.featuresSubtitle)}</p>
        </header>
        <ul class="features">
          ${featuresHtml}
        </ul>
      </div>
    </section>

    <!-- Testimonials -->
    ${testimonialsHtml ? `
    <section id="testimonials" class="wrapper style2 special">
      <div class="inner">
        <header class="major">
          <h2>${lang === "en" ? "What our clients say" : "Lo que dicen nuestros clientes"}</h2>
        </header>
        <div class="testimonials-grid">
          ${testimonialsHtml}
        </div>
      </div>
    </section>` : ""}

    <!-- FAQ -->
    ${faqHtml ? `
    <section id="faq" class="wrapper style1 special">
      <div class="inner">
        <header class="major">
          <h2>${lang === "en" ? "Frequently Asked Questions" : "Preguntas frecuentes"}</h2>
        </header>
        <div class="faq-list">
          ${faqHtml}
        </div>
      </div>
    </section>` : ""}

    <!-- CTA / Contact -->
    <section id="contact" class="wrapper style4">
      <div class="inner">
        <header>
          <h2>${esc(content.contactTitle)}</h2>
          <p>${esc(content.contactSubtitle)}</p>
        </header>
        <div class="contact-info">
          <ul class="alt">
            ${contactInfoHtml.join("\n            ")}
          </ul>
        </div>
        <ul class="actions stacked">
          ${email ? `<li><a href="mailto:${esc(email)}" class="button fit primary">${lang === "en" ? "Email us" : "Escríbenos"}</a></li>` : ""}
          ${phone ? `<li><a href="${whatsappUrl(phone)}" target="_blank" rel="noreferrer" class="button fit">WhatsApp</a></li>` : ""}
        </ul>
      </div>
    </section>

    <!-- Footer -->
    <footer id="footer">
      <ul class="icons">
        ${socialIconsHtml.join("\n        ")}
      </ul>
      <p class="footer-tagline">${esc(content.footerTagline)}</p>
      <ul class="copyright">
        <li>&copy; ${new Date().getFullYear()} ${esc(p.businessName)}</li>
      </ul>
    </footer>

  </div>

  <!-- Scripts -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
  <script>
    ${getSpectralJS()}
  </script>
</body>
</html>`;
}

function getSpectralCSS(colors: TemplateInput["colors"], bannerImg: string): string {
  // Use the accent color for style1 (about), style3 (features), and primary buttons
  const accent = colors.accent;
  const accentDark = colors.accentDark || "#131313";

  return `
/* Reset */
html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kbd,q,s,samp,small,strike,strong,sub,sup,tt,var,b,u,i,center,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td,article,aside,canvas,details,embed,figure,figcaption,footer,header,hgroup,menu,nav,output,ruby,section,summary,time,mark,audio,video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}
article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}
body{line-height:1}ol,ul{list-style:none}blockquote,q{quotes:none}
table{border-collapse:collapse;border-spacing:0}
html{box-sizing:border-box}*,*:before,*:after{box-sizing:inherit}

body{background:${accentDark};-webkit-text-size-adjust:none}
body.is-preload *,body.is-preload *:before,body.is-preload *:after{animation:none!important;transition:none!important}
body,input,select,textarea{color:#fff;font-family:"Open Sans",Helvetica,sans-serif;font-size:15pt;font-weight:400;letter-spacing:0.075em;line-height:1.65em}
@media screen and (max-width:1680px){body,input,select,textarea{font-size:13pt}}
@media screen and (max-width:1280px){body,input,select,textarea{font-size:12pt}}
@media screen and (max-width:736px){body,input,select,textarea{font-size:11pt;letter-spacing:0.0375em}}

a{transition:color 0.2s ease,border-bottom-color 0.2s ease;border-bottom:dotted 1px;color:inherit;text-decoration:none}
a:hover{border-bottom-color:transparent}
strong,b{color:#fff;font-weight:600}em,i{font-style:italic}
p{margin:0 0 2em 0}
h1,h2,h3,h4,h5,h6{color:#fff;font-weight:800;letter-spacing:0.225em;line-height:1em;margin:0 0 1em 0;text-transform:uppercase}
h1 a,h2 a,h3 a,h4 a,h5 a,h6 a{color:inherit;text-decoration:none}
h2{font-size:1.35em;line-height:1.75em}
@media screen and (max-width:736px){h2{font-size:1.1em;line-height:1.65em}}
h3{font-size:1.15em;line-height:1.75em}
@media screen and (max-width:736px){h3{font-size:1em;line-height:1.65em}}
h4{font-size:1em;line-height:1.5em}

/* Buttons */
.button{appearance:none;transition:background-color 0.2s ease-in-out,color 0.2s ease-in-out;background-color:transparent;border-radius:3px;border:0;box-shadow:inset 0 0 0 2px #fff;color:#fff;cursor:pointer;display:inline-block;font-size:0.8em;font-weight:600;height:3.125em;letter-spacing:0.225em;line-height:3.125em;max-width:30em;padding:0 2.75em;text-align:center;text-decoration:none;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.button:hover{background-color:rgba(144,144,144,0.25)}
.button:active{background-color:rgba(144,144,144,0.5)}
.button.fit{width:100%}
.button.primary{background-color:${accent};box-shadow:none!important;color:${colors.accentText}!important}
.button.primary:hover{opacity:0.85;filter:brightness(1.1)}
.button.primary:active{filter:brightness(0.9)}
@media screen and (max-width:736px){.button{height:3.75em;line-height:3.75em}}

/* Icons */
ul.icons{cursor:default;list-style:none;padding-left:0}
ul.icons li{display:inline-block;padding:0 1em 0 0}
ul.icons li:last-child{padding-right:0!important}
ul.icons.major{padding:1em 0}
ul.icons.major li{padding-right:3.5em}
@media screen and (max-width:736px){ul.icons.major li{padding:0 1em!important}}

.icon{text-decoration:none;border-bottom:none;position:relative}
.icon:before{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:inline-block;font-style:normal;font-variant:normal;text-rendering:auto;line-height:1;text-transform:none!important;font-weight:400}
.icon>.label{display:none}
.icon.solid:before{font-weight:900}
.icon.brands:before{font-family:"Font Awesome 5 Brands"}
.icon.major{border:solid 2px;display:inline-block;border-radius:100%;padding:0.65em;margin:0 0 2em 0;cursor:default}
.icon.major:before{display:inline-block;font-size:1.25em;width:2.2em;height:2.2em;line-height:2.2em;border-radius:100%;border:solid 2px;text-align:center}
.icon.style1{color:${accent}}
.icon.style2{color:${accent};opacity:0.8}
.icon.style3{color:${accent};opacity:0.6}

/* Actions */
ul.actions{display:flex;cursor:default;list-style:none;margin-left:-1em;padding-left:0}
ul.actions li{padding:0 0 0 1em;vertical-align:middle}
ul.actions.special{justify-content:center}
ul.actions.stacked{flex-direction:column;margin-left:0}
ul.actions.stacked li{padding:1.3em 0 0 0}
ul.actions.stacked li:first-child{padding-top:0}
@media screen and (max-width:480px){ul.actions:not(.fixed){flex-direction:column;margin-left:0;width:100%!important}ul.actions:not(.fixed) li{flex-grow:1;flex-shrink:1;padding:1em 0 0 0;text-align:center;width:100%}ul.actions:not(.fixed) li>*{width:100%}ul.actions:not(.fixed) li:first-child{padding-top:0}}

/* Features */
.features{display:flex;flex-wrap:wrap;justify-content:center;list-style:none;padding:0;width:100%}
.features li{padding:4em 4em 2em 6em;display:block;position:relative;text-align:left;width:50%}
.features li:nth-child(1){background-color:rgba(0,0,0,0.035)}
.features li:nth-child(2){background-color:rgba(0,0,0,0.07)}
.features li:nth-child(3){background-color:rgba(0,0,0,0.105)}
.features li:nth-child(4){background-color:rgba(0,0,0,0.14)}
.features li:nth-child(5){background-color:rgba(0,0,0,0.175)}
.features li:nth-child(6){background-color:rgba(0,0,0,0.21)}
.features li:before{display:block;color:${accent};position:absolute;left:1.75em;top:2.75em;font-size:1.5em}
.features li:first-child{border-top-left-radius:3px}
.features li:nth-child(2){border-top-right-radius:3px}
@media screen and (max-width:980px){.features li{padding:3em 2em 1em 2em;text-align:center;width:50%}.features li:before{left:0;margin:0 0 1.325em 0;position:relative;top:0}}
@media screen and (max-width:736px){.features li{border-top:solid 2px rgba(0,0,0,0.125);padding:3em 0 1em 0;width:100%}.features li:first-child{border-top:0}.features li:nth-child(2){border-top:solid 2px rgba(0,0,0,0.125)}}

/* Header */
#header{transition:background-color 0.2s ease;background:${accentDark};border-bottom:solid 1px rgba(255,255,255,0.15);height:3.25em;left:0;line-height:3.25em;position:fixed;top:0;width:100%;z-index:10000}
#header h1{transition:opacity 0.2s ease;height:inherit;left:1.25em;line-height:inherit;position:absolute;top:0}
#header h1 a{border:0;display:block;height:inherit;line-height:inherit}
@media screen and (max-width:736px){#header h1 a{font-size:0.8em}}
#header nav{height:inherit;line-height:inherit;position:absolute;right:0;top:0}
#header nav>ul{list-style:none;margin:0;padding:0}
#header nav>ul>li{display:inline-block;padding:0}
#header.alt{background:transparent;border:none}
#header.alt h1{pointer-events:auto}

/* Menu */
#menu{transition:transform 0.35s ease,opacity 0.35s ease,visibility 0.35s ease;align-items:center;display:flex;justify-content:center;pointer-events:none;background:rgba(46,56,66,0.9);box-shadow:none;height:100%;left:0;opacity:0;overflow:hidden;padding:3em 2em;position:fixed;top:0;visibility:hidden;width:100%;z-index:10002}
#menu .close{transition:color 0.2s ease;-webkit-tap-highlight-color:rgba(0,0,0,0);border:0;cursor:pointer;display:block;height:3.25em;line-height:3.25em;padding-right:1.25em;position:absolute;right:0;text-align:right;top:0;vertical-align:middle;width:7em}
#menu .close:before{content:"\\f00d";font-family:"Font Awesome 5 Free";font-weight:900;font-size:1em}
#menu .close:hover{color:${accent}}
#menu ul{list-style:none;padding:0}
#menu ul li{padding:0;border-top:solid 1px rgba(255,255,255,0.15)}
#menu ul li:first-child{border-top:0!important}
#menu ul li a{display:block;padding:0.5em 0;border:0;color:#fff;font-size:0.8em;letter-spacing:0.225em;text-transform:uppercase}
#menu ul li a:hover{color:${accent}}
body.is-menu-visible #menu{pointer-events:auto;opacity:1;visibility:visible}
body.is-menu-visible #page-wrapper{filter:blur(1.5px)}

.menuToggle{text-decoration:none;border:0;cursor:pointer;display:block;height:3.25em;line-height:3.25em;padding-right:1.25em;position:relative}
.menuToggle:before{content:"\\f0c9";display:block;font-family:"Font Awesome 5 Free";font-weight:900;height:inherit;line-height:inherit;position:absolute;text-align:center;top:0;width:2em;right:0}
.menuToggle span{font-size:0.7em;padding-right:0.625em}
@media screen and (max-width:736px){.menuToggle span{display:none}}
li.special{padding-right:0}

/* Banner */
#banner{display:flex;flex-direction:column;justify-content:center;cursor:default;height:100vh;min-height:35em;overflow:hidden;position:relative;text-align:center;background-color:${accentDark};background-image:linear-gradient(rgba(0,0,0,0.3),rgba(0,0,0,0.3)),url("${bannerImg}");background-size:cover;background-position:center;background-attachment:scroll;padding:7em 2em 4em 2em}
#banner .inner{animation:reveal-banner 1s ease 0.25s forwards;text-transform:uppercase;opacity:0}
#banner .inner h2{font-size:3em;border-bottom:solid 2px rgba(255,255,255,0.35);display:inline-block;margin:0 0 0.35em 0;padding:0 0 0.35em 0}
#banner .inner p{letter-spacing:0.225em;font-size:0.9em;line-height:2}
#banner .more{transition:transform 0.75s ease,opacity 0.75s ease;transition-delay:3.5s;transform:translateY(0);border:none;bottom:0;color:inherit;font-size:0.7em;height:8.5em;left:50%;letter-spacing:0.225em;margin-left:-8.5em;opacity:1;outline:0;padding-left:0.225em;position:absolute;text-align:center;text-transform:uppercase;width:16em}
#banner .more:after{background-image:url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Cpath d='M15,20 L5,10 L7,8 L15,16 L23,8 L25,10 Z' fill='%23fff'/%3E%3C/svg%3E");background-position:center;background-repeat:no-repeat;background-size:contain;bottom:0.3em;content:"";display:block;height:1.5em;left:50%;margin-left:-0.75em;position:absolute;width:1.5em}
@media screen and (max-width:736px){#banner{padding:7em 2em 4em 2em;min-height:0}#banner .inner h2{font-size:1.75em}#banner .more{display:none}}
@keyframes reveal-banner{0%{opacity:0;transform:translateY(0.5em)}100%{opacity:1;transform:translateY(0)}}

/* Wrapper */
.wrapper{padding:8em 0 6em 0}
.wrapper.alt{padding:0}
@media screen and (max-width:1280px){.wrapper{padding:5em 0 3em 0}}
@media screen and (max-width:736px){.wrapper{padding:3em 0 1em 0}}

.wrapper.style1{background-color:${accent};color:rgba(255,255,255,0.75)}
.wrapper.style1 strong,.wrapper.style1 b{color:#fff}
.wrapper.style1 h2,.wrapper.style1 h3,.wrapper.style1 h4,.wrapper.style1 h5,.wrapper.style1 h6{color:#fff}
.wrapper.style1 hr{border-color:rgba(0,0,0,0.125)}
.wrapper.style1 header p{color:rgba(255,255,255,0.65)}
.wrapper.style1 header.major h2,.wrapper.style1 header.major h3{border-color:rgba(0,0,0,0.125)}
.wrapper.style1 header.major p{color:rgba(255,255,255,0.75)}
.wrapper.style1 .icon.major{border-color:rgba(0,0,0,0.125)}
.wrapper.style1 .button{box-shadow:inset 0 0 0 2px rgba(0,0,0,0.125);color:#fff}
.wrapper.style1 .button:hover{background-color:rgba(255,255,255,0.075)}
.wrapper.style1 .button:active{background-color:rgba(255,255,255,0.2)}
@media screen and (max-width:736px){.wrapper.style1 .features li{border-top-color:rgba(0,0,0,0.125)}}

.wrapper.style2{background-color:${accentDark}}

.wrapper.style3{background-color:${accentDark};color:#d3d4e4;background:linear-gradient(135deg, rgba(80,83,147,0.5) 0%, ${accentDark} 100%)}
.wrapper.style3 strong,.wrapper.style3 b{color:#fff}
.wrapper.style3 h2,.wrapper.style3 h3,.wrapper.style3 h4,.wrapper.style3 h5,.wrapper.style3 h6{color:#fff}
.wrapper.style3 hr{border-color:rgba(0,0,0,0.125)}
.wrapper.style3 header p{color:#b9bad4}
.wrapper.style3 header.major h2,.wrapper.style3 header.major h3{border-color:rgba(0,0,0,0.125)}
.wrapper.style3 header.major p{color:#d3d4e4}
.wrapper.style3 .icon.major{border-color:rgba(0,0,0,0.125)}
.wrapper.style3 .button{box-shadow:inset 0 0 0 2px rgba(0,0,0,0.125);color:#fff}
.wrapper.style3 .button:hover{background-color:rgba(255,255,255,0.075)}
@media screen and (max-width:736px){.wrapper.style3 .features li{border-top-color:rgba(0,0,0,0.125)}}

.wrapper.style4{background-color:transparent}

/* Inner */
.inner{margin:0 auto;width:75em;max-width:calc(100% - 6em)}
@media screen and (max-width:736px){.inner{max-width:calc(100% - 3em)}}

/* Spotlight */
.spotlight{display:flex;align-items:center;margin:0}
.spotlight .image{width:30em;border-radius:0;margin:0}
.spotlight .image img{display:block;width:100%;border-radius:0}
.spotlight .content{padding:2em 4em 0.1em 4em}
.spotlight .content h2{margin:0 0 0.5em 0}
.spotlight:nth-child(2n){flex-direction:row-reverse}
@media screen and (max-width:980px){.spotlight{flex-direction:column!important}.spotlight .image{width:100%}.spotlight .content{padding:2em 2em 0.1em 2em;width:100%}}

/* Section */
header.major{margin:0 0 3.5em 0;text-align:center}
header.major h2{font-size:1.75em}
header.major h2:after{background-color:rgba(255,255,255,0.35);content:"";display:block;height:2px;margin:0.75em auto 0 auto;width:4em}
header.major p{font-size:1em;margin-top:1em}
@media screen and (max-width:736px){header.major{margin:0 0 2em 0}}

/* Footer */
#footer{padding:6em 0 4em 0;text-align:center}
#footer .icons{font-size:1.25em}
#footer .icons a{color:rgba(255,255,255,0.5);transition:color 0.2s ease}
#footer .icons a:hover{color:${accent}}
#footer .copyright{color:rgba(255,255,255,0.35);font-size:0.65em;letter-spacing:0.225em;list-style:none;padding:0;text-transform:uppercase}
#footer .copyright li{border-left:solid 1px rgba(255,255,255,0.15);display:inline-block;line-height:1em;margin-left:1em;padding-left:1em}
#footer .copyright li:first-child{border-left:0;margin-left:0;padding-left:0}
#footer .footer-tagline{color:rgba(255,255,255,0.5);font-size:0.85em;font-style:italic;margin:1.5em 0}

/* Custom: Testimonials */
.testimonials-grid{display:flex;flex-wrap:wrap;gap:2em;justify-content:center;max-width:60em;margin:0 auto}
.testimonial-card{flex:1;min-width:250px;max-width:320px;background:rgba(255,255,255,0.05);border-radius:8px;padding:2em;text-align:left}
.testimonial-stars{color:${accent};font-size:1.1em;margin-bottom:0.75em;letter-spacing:0.15em}
.testimonial-text{font-style:italic;font-size:0.9em;line-height:1.7;margin-bottom:1em;color:rgba(255,255,255,0.8)}
.testimonial-author{font-weight:600;font-size:0.8em;color:rgba(255,255,255,0.5)}

/* Custom: FAQ */
.faq-list{max-width:50em;margin:0 auto;text-align:left}
.faq-item{border-bottom:1px solid rgba(0,0,0,0.125);padding:1.5em 0}
.faq-item:last-child{border-bottom:0}
.faq-question{font-size:0.9em;font-weight:700;margin-bottom:0.5em;color:#fff;text-transform:none;letter-spacing:0.05em}
.faq-answer{font-size:0.85em;line-height:1.8;color:rgba(255,255,255,0.65);margin:0}

/* Custom: Contact info */
.contact-info{margin:2em 0}
.contact-info ul{list-style:none;padding:0}
.contact-info ul li{padding:0.75em 0;border-bottom:1px solid rgba(255,255,255,0.1);font-size:0.9em}
.contact-info ul li:last-child{border-bottom:0}
.contact-info ul li .icon{margin-right:0.75em;color:${accent}}
.contact-info ul li a{color:#fff}

/* WhatsApp Float */
.whatsapp-float{position:fixed;bottom:1.5rem;right:1.5rem;width:56px;height:56px;border-radius:50%;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.3);z-index:9999;transition:transform 0.2s;text-decoration:none;border:none}
.whatsapp-float:hover{transform:scale(1.1);border:none}
.whatsapp-float svg{width:28px;height:28px;fill:#fff}
`;
}

function getSpectralJS(): string {
  return `
(function($) {
  var $window = $(window),
      $body = $('body'),
      $banner = $('#banner'),
      $header = $('#header');

  // Remove preload
  $window.on('load', function() {
    window.setTimeout(function() { $body.removeClass('is-preload'); }, 100);
  });

  // Smooth scroll
  $('a.scrolly').on('click', function(e) {
    var href = $(this).attr('href');
    if (!href || href.charAt(0) !== '#') return;
    e.preventDefault();
    var target = $(href);
    if (target.length) {
      $('html, body').animate({ scrollTop: target.offset().top - $header.outerHeight() }, 1000, 'swing');
    }
  });

  // Menu toggle
  var $menu = $('#menu');
  $menu.append('<a href="#menu" class="close"></a>');
  $('a[href="#menu"]').on('click', function(e) {
    e.preventDefault();
    $body.toggleClass('is-menu-visible');
  });
  $menu.on('click', 'a:not(.close)', function(e) {
    var href = $(this).attr('href');
    if (!href || href === '#menu') return;
    e.preventDefault();
    $body.removeClass('is-menu-visible');
    if (href.charAt(0) === '#') {
      var target = $(href);
      if (target.length) {
        $('html, body').animate({ scrollTop: target.offset().top - $header.outerHeight() }, 1000, 'swing');
      }
    }
  });
  $menu.find('.close').on('click', function(e) { e.preventDefault(); $body.removeClass('is-menu-visible'); });

  // Header alt toggle on scroll
  if ($banner.length > 0 && $header.hasClass('alt')) {
    $window.on('scroll resize', function() {
      var scrollTop = $window.scrollTop();
      var bannerBottom = $banner.offset().top + $banner.outerHeight() - $header.outerHeight();
      if (scrollTop > bannerBottom) { $header.removeClass('alt'); }
      else { $header.addClass('alt'); }
    });
  }
})(jQuery);
`;
}
