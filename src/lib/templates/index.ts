import type { TemplateInput } from "./shared";
export { buildInputFromProjectData } from "./shared";
export type { TemplateInput } from "./shared";

import { generateHosteleriaHtml } from "./hosteleria";
import { generateEsteticaHtml } from "./estetica";
import { generateFitnessHtml } from "./fitness";
import { generateDefaultHtml } from "./default";

const SECTOR_TEMPLATE_MAP: Record<string, (input: TemplateInput) => string> = {
  "Hostelería": generateHosteleriaHtml,
  "Restauración": generateHosteleriaHtml,
  "Estética": generateEsteticaHtml,
  "Salud": generateEsteticaHtml,
  "Fitness": generateFitnessHtml,
};

export function generateSiteHtml(input: TemplateInput): string {
  const generator = SECTOR_TEMPLATE_MAP[input.project.sector] || generateDefaultHtml;
  return generator(input);
}
