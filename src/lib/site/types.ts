// Core types for the new block-based site generation system.
// Replaces the old template-substitution approach.

export type MoodId = "minimal" | "editorial" | "warm" | "bold";

export type BlockType =
  | "nav"
  | "hero"
  | "categories"
  | "about"
  | "services"
  | "stats"
  | "process"
  | "gallery"
  | "testimonials"
  | "cta"
  | "faq"
  | "hours"
  | "contact"
  | "map"
  | "footer";

// Each block has 2 visual variants in the MVP.
export type VariantId = "a" | "b";

export interface BlockInstance<TContent = Record<string, unknown>> {
  id: string;            // unique per site (uuid)
  type: BlockType;
  variant: VariantId;
  content: TContent;     // copy + structured data for the block
  // Optional per-block overrides (rarely used)
  overrides?: Partial<{
    accent: string;      // hex
  }>;
}

export interface DesignTokens {
  // Color palette in HEX (we generate CSS vars at runtime)
  colors: {
    bg: string;
    surface: string;     // cards / elevated surfaces
    surfaceAlt: string;  // alternating sections
    text: string;
    textMuted: string;
    border: string;
    accent: string;
    accentText: string;  // text on top of accent
    inverse: string;     // for dark hero / footer sections
    inverseText: string;
  };
  // Typography (Google Fonts families)
  fonts: {
    display: string;     // e.g. "Fraunces"
    body: string;        // e.g. "Inter"
    displayWeights: number[];
    bodyWeights: number[];
  };
  // Scales
  radius: {
    sm: string;
    md: string;
    lg: string;
    pill: string;        // 9999px
  };
  spacing: {
    section: string;     // vertical padding for sections
    container: string;   // max-width
  };
  shadows: {
    card: string;
    elevated: string;
  };
  // Mood metadata (for debugging / regeneration prompts)
  mood: MoodId;
  moodIntensity: "soft" | "balanced" | "strong";
}

// Output of the brand-brief AI step.
export interface Brief {
  brandPositioning: string;     // 1-2 sentences
  toneOfVoice: string[];        // ["cercano", "experto", ...]
  audience: string;             // buyer persona summary
  keyMessages: string[];        // 3 key value props
  recommendedMood: MoodId;
  rationale: string;            // why this mood (for admin debug)
}

// Final site shape stored in DB (projects.generated_content).
export interface GeneratedSite {
  version: 2;                   // bump to detect old template-based content
  brief: Brief;
  tokens: DesignTokens;
  blocks: BlockInstance[];
  meta: {
    businessName: string;
    sector: string;
    language: string;
    generatedAt: string;        // ISO
  };
}

// Helper for legacy detection
export function isGeneratedSite(value: unknown): value is GeneratedSite {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as GeneratedSite).version === 2 &&
    Array.isArray((value as GeneratedSite).blocks)
  );
}
