// Maps form sector values to template file names
export const SECTOR_TEMPLATE_MAP: Record<string, string> = {
  "Hostelería / Restaurante": "restauracion",
  "Servicios": "servicios",
  "Fitness / Deportes": "fitness",
  "Estética / Peluquería": "estetica",
  "Consultoría / Asesoría": "consultoria",
  "Arquitectura / Portfolio": "arquitectura",
  "Otros": "otros",
};

export const SECTORS = Object.keys(SECTOR_TEMPLATE_MAP);

export function getTemplateFile(sector: string): string | null {
  const template = SECTOR_TEMPLATE_MAP[sector];
  if (!template || template === "default") return null;
  return `/templates/${template}.html`;
}
