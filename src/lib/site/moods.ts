// 4 curated visual moods. Each is a complete design system the AI can pick.
// Tokens are stored as HEX so they can be serialized to DB and exported to static HTML.

import type { DesignTokens, MoodId } from "./types";

export interface MoodPreset {
  id: MoodId;
  label: string;
  description: string;       // shown to AI to help decide
  bestFor: string[];         // sector hints
  tokens: DesignTokens;
}

// MINIMAL — clean, lots of whitespace, monochrome with one strong accent.
// Sectors: consultoría, arquitectura, tecnología, lujo discreto.
const minimal: MoodPreset = {
  id: "minimal",
  label: "Minimal",
  description: "Diseño limpio, mucho espacio en blanco, tipografía sans-serif moderna, paleta monocroma con un único acento sobrio.",
  bestFor: ["Consultoría / Asesoría", "Arquitectura / Portfolio", "Servicios"],
  tokens: {
    mood: "minimal",
    moodIntensity: "balanced",
    colors: {
      bg: "#FFFFFF",
      surface: "#FAFAFA",
      surfaceAlt: "#F4F4F5",
      text: "#0A0A0A",
      textMuted: "#71717A",
      border: "#E4E4E7",
      accent: "#0A0A0A",
      accentText: "#FFFFFF",
      inverse: "#0A0A0A",
      inverseText: "#FAFAFA",
    },
    fonts: {
      display: "Geist",
      body: "Geist",
      displayWeights: [500, 600, 700],
      bodyWeights: [400, 500],
    },
    radius: { sm: "4px", md: "8px", lg: "12px", pill: "9999px" },
    spacing: { section: "6rem", container: "1200px" },
    shadows: {
      card: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
      elevated: "0 4px 12px -2px rgb(0 0 0 / 0.08)",
    },
  },
};

// EDITORIAL — serif display + sans body, generous typography, magazine feel.
// Sectors: estética, lifestyle, gastronomía premium, autor.
const editorial: MoodPreset = {
  id: "editorial",
  label: "Editorial",
  description: "Sensación de revista premium. Tipografía serif elegante para títulos, paleta crema y tinta, jerarquía tipográfica fuerte.",
  bestFor: ["Estética / Peluquería", "Hostelería / Restaurante", "Arquitectura / Portfolio"],
  tokens: {
    mood: "editorial",
    moodIntensity: "balanced",
    colors: {
      bg: "#FBF8F3",
      surface: "#FFFFFF",
      surfaceAlt: "#F2EDE3",
      text: "#1A1714",
      textMuted: "#6B6258",
      border: "#E5DFD3",
      accent: "#7A2E1F",
      accentText: "#FBF8F3",
      inverse: "#1A1714",
      inverseText: "#FBF8F3",
    },
    fonts: {
      display: "Fraunces",
      body: "Inter",
      displayWeights: [400, 500, 700],
      bodyWeights: [400, 500],
    },
    radius: { sm: "2px", md: "4px", lg: "8px", pill: "9999px" },
    spacing: { section: "7rem", container: "1180px" },
    shadows: {
      card: "0 2px 6px -1px rgb(26 23 20 / 0.06)",
      elevated: "0 12px 32px -8px rgb(26 23 20 / 0.16)",
    },
  },
};

// WARM — colores cálidos, orgánico, redondeado, cercano.
// Sectores: hostelería casual, fitness, bienestar, infancia.
const warm: MoodPreset = {
  id: "warm",
  label: "Cálido",
  description: "Paleta cálida y orgánica, formas redondeadas, sensación cercana y acogedora. Tipografía amigable.",
  bestFor: ["Hostelería / Restaurante", "Fitness / Deportes", "Estética / Peluquería"],
  tokens: {
    mood: "warm",
    moodIntensity: "balanced",
    colors: {
      bg: "#FFF8F1",
      surface: "#FFFFFF",
      surfaceAlt: "#FCEFDC",
      text: "#2A1F14",
      textMuted: "#7A6553",
      border: "#F1E2CD",
      accent: "#E26D2C",
      accentText: "#FFFFFF",
      inverse: "#2A1F14",
      inverseText: "#FFF8F1",
    },
    fonts: {
      display: "DM Serif Display",
      body: "DM Sans",
      displayWeights: [400],
      bodyWeights: [400, 500, 700],
    },
    radius: { sm: "12px", md: "20px", lg: "28px", pill: "9999px" },
    spacing: { section: "6rem", container: "1200px" },
    shadows: {
      card: "0 4px 12px -2px rgb(226 109 44 / 0.12)",
      elevated: "0 16px 40px -12px rgb(226 109 44 / 0.22)",
    },
  },
};

// BOLD — alto contraste, acento vibrante, geometría fuerte, moderno.
// Sectores: tech, fitness intenso, marcas disruptivas.
const bold: MoodPreset = {
  id: "bold",
  label: "Bold",
  description: "Alto contraste, acento vibrante, tipografía pesada y geométrica, sensación moderna y disruptiva.",
  bestFor: ["Fitness / Deportes", "Servicios", "Otros"],
  tokens: {
    mood: "bold",
    moodIntensity: "strong",
    colors: {
      bg: "#0E0E0F",
      surface: "#17171A",
      surfaceAlt: "#1F1F23",
      text: "#FAFAFA",
      textMuted: "#A1A1AA",
      border: "#2A2A2F",
      accent: "#D7FF3D",
      accentText: "#0E0E0F",
      inverse: "#FAFAFA",
      inverseText: "#0E0E0F",
    },
    fonts: {
      display: "Space Grotesk",
      body: "Inter",
      displayWeights: [600, 700],
      bodyWeights: [400, 500, 600],
    },
    radius: { sm: "4px", md: "8px", lg: "16px", pill: "9999px" },
    spacing: { section: "7rem", container: "1240px" },
    shadows: {
      card: "0 0 0 1px rgb(255 255 255 / 0.04)",
      elevated: "0 24px 48px -16px rgb(0 0 0 / 0.6)",
    },
  },
};

export const MOODS: Record<MoodId, MoodPreset> = {
  minimal,
  editorial,
  warm,
  bold,
};

export const MOOD_LIST: MoodPreset[] = [minimal, editorial, warm, bold];

export function getMoodTokens(id: MoodId): DesignTokens {
  return MOODS[id].tokens;
}

// Default mood per sector when AI suggestion is unavailable.
export const SECTOR_DEFAULT_MOOD: Record<string, MoodId> = {
  "Hostelería / Restaurante": "warm",
  "Servicios": "minimal",
  "Fitness / Deportes": "bold",
  "Estética / Peluquería": "editorial",
  "Consultoría / Asesoría": "minimal",
  "Arquitectura / Portfolio": "editorial",
  "Otros": "minimal",
};
