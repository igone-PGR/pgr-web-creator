import type { TemplateInput } from "./shared";
export { buildInputFromProjectData } from "./shared";
export type { TemplateInput } from "./shared";

import { generateSpectralHtml } from "./spectral";

// All sectors use the Spectral template as the unified base
export function generateSiteHtml(input: TemplateInput): string {
  return generateSpectralHtml(input);
}
