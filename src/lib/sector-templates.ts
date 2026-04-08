// Maps form sector values to template file names
export const SECTOR_TEMPLATE_MAP: Record<string, string> = {
  "Hostelería": "hosteleria",
  "Servicios": "servicios",
  "Fitness / Deportes": "fitness",
  "Restaurante": "restauracion",
  "Estética": "estetica",
  "Consultoría / Asesoría": "consultoria",
  "Arquitectura / Portfolio": "arquitectura",
};

export const SECTORS = Object.keys(SECTOR_TEMPLATE_MAP);

export function getTemplateFile(sector: string): string | null {
  const template = SECTOR_TEMPLATE_MAP[sector];
  if (!template || template === "default") return null;
  return `/templates/${template}.html`;
}
