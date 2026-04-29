// Curated 3-color palettes the client picks in the form.
// Each palette overrides the mood's color tokens (fonts/shapes stay).
// Fields: bg (page bg), surface (cards), accent (CTAs/highlights).
// We auto-derive text/border/inverse from luminance for safe contrast.

export interface ColorPalette {
  id: string;
  label: string;
  bg: string;
  surface: string;
  accent: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
  { id: "ivory-ink",    label: "Marfil & Tinta",   bg: "#FBF8F3", surface: "#FFFFFF", accent: "#1A1714" },
  { id: "cream-terra",  label: "Crema & Terracota",bg: "#FBF8F3", surface: "#FFFFFF", accent: "#7A2E1F" },
  { id: "sand-coral",   label: "Arena & Coral",    bg: "#FFF8F1", surface: "#FFFFFF", accent: "#E26D2C" },
  { id: "snow-emerald", label: "Nieve & Esmeralda",bg: "#F7FAF8", surface: "#FFFFFF", accent: "#0F766E" },
  { id: "snow-cobalt",  label: "Nieve & Cobalto",  bg: "#F8FAFC", surface: "#FFFFFF", accent: "#1D4ED8" },
  { id: "mist-violet",  label: "Niebla & Violeta", bg: "#FAF7FF", surface: "#FFFFFF", accent: "#6D28D9" },
  { id: "graphite-lime",label: "Grafito & Lima",   bg: "#0E0E0F", surface: "#17171A", accent: "#D7FF3D" },
  { id: "midnight-rose",label: "Medianoche & Rosa",bg: "#0F0F14", surface: "#1A1A22", accent: "#F43F5E" },
];

export function getPaletteById(id?: string | null): ColorPalette | undefined {
  if (!id) return undefined;
  return COLOR_PALETTES.find((p) => p.id === id);
}

// ─── Helpers shared with the edge function (kept tiny + dependency-free) ─────

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

function relLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

export function isDark(hex: string): boolean {
  return relLuminance(hex) < 0.5;
}

// Build a full DesignTokens.colors object from a 3-color palette.
// Keeps text/border/inverse coherent with the chosen base.
export function paletteToColors(palette: ColorPalette) {
  const dark = isDark(palette.bg);
  const accentDark = isDark(palette.accent);
  return {
    bg: palette.bg,
    surface: palette.surface,
    surfaceAlt: dark ? "#1F1F23" : "#F4F4F5",
    text: dark ? "#FAFAFA" : "#0A0A0A",
    textMuted: dark ? "#A1A1AA" : "#6B6B72",
    border: dark ? "#2A2A2F" : "#E4E4E7",
    accent: palette.accent,
    accentText: accentDark ? "#FAFAFA" : "#0A0A0A",
    inverse: dark ? "#FAFAFA" : "#0A0A0A",
    inverseText: dark ? "#0A0A0A" : "#FAFAFA",
  };
}
