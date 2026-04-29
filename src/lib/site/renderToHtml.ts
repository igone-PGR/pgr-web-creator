// Render a GeneratedSite (v2) to a fully self-contained index.html so the
// Vercel deploy is 1:1 with what the user sees in preview.
//
// Strategy:
//   - SSR React tree to a static HTML string (renderToStaticMarkup).
//   - Inline the design tokens as :root CSS variables.
//   - Pull Tailwind CSS via CDN (Play CDN) so all `bg-[var(--…)]`, `py-…`
//     etc. used by blocks resolve at runtime in the browser.
//   - Pull Google Fonts based on the chosen mood.
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import type { GeneratedSite } from "./types";
import { tokensToCssVars, buildGoogleFontsUrl } from "./tokens";
import { renderBlock } from "@/components/site/registry";

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

export function renderSiteToHtml(site: GeneratedSite): string {
  // SSR each block; wrap so React doesn't choke on a fragment of array roots.
  const tree = createElement(
    "div",
    null,
    site.blocks.map((b) => createElement("div", { key: b.id }, renderBlock(b))),
  );
  const body = renderToStaticMarkup(tree);

  const fontsUrl = buildGoogleFontsUrl(site.tokens);
  const title = `${site.meta.businessName} · ${site.meta.sector}`;
  const description =
    site.brief?.brandPositioning?.slice(0, 155) ||
    `${site.meta.businessName} - ${site.meta.sector}`;

  return `<!DOCTYPE html>
<html lang="${escapeHtml(site.meta.language || "es")}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${fontsUrl}" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>${buildRootStyle(site)}</style>
</head>
<body class="antialiased">
${body}
</body>
</html>`;
}
