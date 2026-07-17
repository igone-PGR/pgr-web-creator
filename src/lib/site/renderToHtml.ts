// Render a GeneratedSite (v2) to a fully self-contained set of static HTML
// pages (index + legal pages) so the Vercel deploy is 1:1 with what the user
// sees in preview and includes the required legal texts.
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import type { GeneratedSite } from "./types";
import { tokensToCssVars, buildGoogleFontsUrl } from "./tokens";
import { renderBlock } from "@/components/site/registry";
import { buildLegalPages, type LegalContext } from "./legalTexts";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildRootStyle(site: GeneratedSite): string {
  const vars = tokensToCssVars(site.tokens);
  const lines = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n");
  return `:root {\n${lines}\n}\nbody { background: var(--site-bg); color: var(--site-text); font-family: var(--site-font-body); }`;
}

function legalPageCss(): string {
  return `
.legal-wrap { max-width: 780px; margin: 0 auto; padding: 64px 24px 96px; }
.legal-wrap h1 { font-family: var(--site-font-display); font-size: clamp(28px, 4vw, 44px); line-height: 1.15; margin: 0 0 24px; color: var(--site-text); }
.legal-wrap h2 { font-family: var(--site-font-display); font-size: 20px; margin: 32px 0 12px; color: var(--site-text); }
.legal-wrap p, .legal-wrap li { color: var(--site-text-muted); line-height: 1.7; font-size: 15px; }
.legal-wrap ul { padding-left: 20px; margin: 8px 0 16px; }
.legal-wrap strong { color: var(--site-text); }
.legal-wrap a { color: var(--site-accent); text-decoration: underline; }
.legal-notice { background: var(--site-surface-alt); border: 1px solid var(--site-border); border-radius: var(--site-radius-md); padding: 16px 18px; margin: 0 0 32px; font-size: 14px; color: var(--site-text); }
.legal-updated { margin-top: 32px; font-size: 13px; color: var(--site-text-muted); font-style: italic; }
.legal-topbar { border-bottom: 1px solid var(--site-border); padding: 18px 24px; display:flex; justify-content: space-between; align-items:center; }
.legal-topbar a { color: var(--site-text); text-decoration: none; font-weight: 600; font-family: var(--site-font-display); }
.legal-topbar .legal-back { font-size: 13px; color: var(--site-text-muted); }
`;
}

function htmlShell(opts: {
  site: GeneratedSite;
  title: string;
  description: string;
  bodyClass: string;
  bodyInner: string;
  extraCss?: string;
}): string {
  const fontsUrl = buildGoogleFontsUrl(opts.site.tokens);
  return `<!DOCTYPE html>
<html lang="${escapeHtml(opts.site.meta.language || "es")}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(opts.title)}</title>
  <meta name="description" content="${escapeHtml(opts.description)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${fontsUrl}" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>${buildRootStyle(opts.site)}${opts.extraCss || ""}</style>
</head>
<body class="${escapeHtml(opts.bodyClass)}">
${opts.bodyInner}
</body>
</html>`;
}

export function renderSiteToHtml(site: GeneratedSite): string {
  const tree = createElement(
    "div",
    null,
    site.blocks.map((b) => createElement("div", { key: b.id }, renderBlock(b))),
  );
  const body = renderToStaticMarkup(tree);

  const title = `${site.meta.businessName} · ${site.meta.sector}`;
  const description =
    site.brief?.brandPositioning?.slice(0, 155) ||
    `${site.meta.businessName} - ${site.meta.sector}`;

  return htmlShell({
    site,
    title,
    description,
    bodyClass: "antialiased",
    bodyInner: body,
  });
}

function renderLegalPage(site: GeneratedSite, page: { slug: string; title: string; bodyHtml: string }): string {
  const brand = escapeHtml(site.meta.businessName);
  const inner = `
    <div class="legal-topbar">
      <a href="../index.html">${brand}</a>
      <a class="legal-back" href="../index.html">← Volver a la web</a>
    </div>
    <main class="legal-wrap">
      ${page.bodyHtml}
    </main>
  `;
  return htmlShell({
    site,
    title: `${page.title} · ${site.meta.businessName}`,
    description: `${page.title} de ${site.meta.businessName}`,
    bodyClass: "antialiased",
    bodyInner: inner,
    extraCss: legalPageCss(),
  });
}

// Multi-page output: keys are Vercel file paths.
export function renderSitePages(site: GeneratedSite, legalCtx: LegalContext): Record<string, string> {
  const pages: Record<string, string> = {
    "index.html": renderSiteToHtml(site),
  };
  for (const lp of buildLegalPages(site, legalCtx)) {
    pages[`${lp.slug}/index.html`] = renderLegalPage(site, lp);
  }
  return pages;
}
