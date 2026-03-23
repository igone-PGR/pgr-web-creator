import type { WebContent, ColorPalette } from "@/types/web-content";
import type { ProjectData } from "@/types/project";

export interface TemplateInput {
  project: {
    businessName: string;
    slogan?: string;
    sector: string;
    logo?: string | null;
    photos: string[];
    address?: string;
    phone?: string;
    email: string;
    businessEmail?: string;
    businessPhone?: string;
    businessHours?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    language?: string;
  };
  content: WebContent;
  colors: ColorPalette;
}

export function esc(text: string | null | undefined): string {
  if (!text) return "";
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

export function safeHref(url: string): string {
  try {
    const raw = url.startsWith("http") ? url : `https://${url}`;
    const parsed = new URL(raw);
    if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) return "#";
    return esc(parsed.href);
  } catch {
    return "#";
  }
}

export function contactEmail(p: TemplateInput["project"]): string {
  return p.businessEmail || p.email;
}

export function contactPhone(p: TemplateInput["project"]): string | undefined {
  return p.businessPhone || p.phone;
}

export function whatsappUrl(phone: string): string {
  return `https://wa.me/${phone.replace(/\\D/g, "")}`;
}

export function buildInputFromProjectData(
  project: ProjectData,
  content: WebContent,
  colors: ColorPalette
): TemplateInput {
  return {
    project: {
      businessName: project.businessName,
      slogan: project.slogan,
      sector: project.sector,
      logo: project.logo,
      photos: project.photos || [],
      address: project.address,
      phone: project.phone,
      email: project.email,
      businessEmail: project.businessEmail,
      businessPhone: project.businessPhone,
      businessHours: project.businessHours,
      instagram: project.instagram,
      facebook: project.facebook,
      linkedin: project.linkedin,
      language: project.language,
    },
    content,
    colors,
  };
}

export function sharedHead(title: string, description: string, font: string, lang: string): string {
  return `<!DOCTYPE html>
<html lang="${esc(lang)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">`;
}

export function socialLinksHtml(p: TemplateInput["project"], colors: ColorPalette): string {
  const items: string[] = [];
  if (p.instagram) {
    items.push(`<a href="${safeHref(`https://instagram.com/${p.instagram.replace("@", "")}`)}" target="_blank" rel="noreferrer" class="social-link">Instagram</a>`);
  }
  if (p.facebook) {
    items.push(`<a href="${safeHref(p.facebook)}" target="_blank" rel="noreferrer" class="social-link">Facebook</a>`);
  }
  if (p.linkedin) {
    items.push(`<a href="${safeHref(p.linkedin)}" target="_blank" rel="noreferrer" class="social-link">LinkedIn</a>`);
  }
  return items.length ? `<div class="social-links">${items.join(" · ")}</div>` : "";
}

export function whatsappFloating(phone: string | undefined): string {
  if (!phone) return "";
  return `<a href="${whatsappUrl(phone)}" target="_blank" rel="noreferrer" class="whatsapp-float">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
  </a>`;
}

export function footerHtml(input: TemplateInput): string {
  const { project: p, content, colors } = input;
  const email = contactEmail(p);
  const phone = contactPhone(p);
  const lang = p.language || "es";
  return `<footer>
    <div class="footer-inner">
      <div class="footer-brand">
        ${p.logo ? `<img src="${esc(p.logo)}" alt="${esc(p.businessName)}" class="footer-logo" />` : ""}
        <span class="footer-name">${esc(p.businessName)}</span>
      </div>
      <p class="footer-tagline">${esc(content.footerTagline)}</p>
      <div class="footer-links">
        ${email ? `<a href="mailto:${esc(email)}">${esc(email)}</a>` : ""}
        ${phone ? `<span>${esc(phone)}</span>` : ""}
        ${p.address ? `<span>${esc(p.address)}</span>` : ""}
      </div>
      ${socialLinksHtml(p, colors)}
      <p class="footer-copy">© ${new Date().getFullYear()} ${esc(p.businessName)}. ${lang === "en" ? "All rights reserved." : "Todos los derechos reservados."}</p>
    </div>
  </footer>`;
}

export function sharedFooterCss(colors: ColorPalette): string {
  return `
footer { border-top:1px solid ${colors.border}; padding:3rem 0; }
.footer-inner { max-width:1200px; margin:0 auto; padding:0 2rem; text-align:center; }
.footer-brand { display:flex; align-items:center; justify-content:center; gap:0.75rem; margin-bottom:0.75rem; }
.footer-logo { width:28px; height:28px; object-fit:contain; border-radius:6px; }
.footer-name { font-weight:700; font-size:1rem; }
.footer-tagline { font-size:0.875rem; color:${colors.text2}; margin-bottom:1.5rem; font-style:italic; }
.footer-links { display:flex; flex-wrap:wrap; justify-content:center; gap:1.5rem; font-size:0.8rem; color:${colors.text2}; margin-bottom:1rem; }
.footer-links a { color:${colors.accent}; }
.footer-copy { font-size:0.7rem; color:${colors.text2}; margin-top:1rem; }
.social-links { display:flex; justify-content:center; gap:1rem; font-size:0.8rem; color:${colors.accent}; margin-bottom:1rem; }
.social-link:hover { opacity:0.7; }
.whatsapp-float { position:fixed; bottom:1.5rem; right:1.5rem; width:56px; height:56px; border-radius:50%; background:#25D366; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 16px rgba(0,0,0,0.2); z-index:50; transition:transform 0.2s; }
.whatsapp-float:hover { transform:scale(1.1); }`;
}
