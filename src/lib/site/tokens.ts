// Convert DesignTokens into CSS variables that block components consume.
// All blocks read from these vars so a single mood swap restyles the whole site.

import type { DesignTokens } from "./types";

export function tokensToCssVars(tokens: DesignTokens): Record<string, string> {
  const c = tokens.colors;
  return {
    "--site-bg": c.bg,
    "--site-surface": c.surface,
    "--site-surface-alt": c.surfaceAlt,
    "--site-text": c.text,
    "--site-text-muted": c.textMuted,
    "--site-border": c.border,
    "--site-accent": c.accent,
    "--site-accent-text": c.accentText,
    "--site-inverse": c.inverse,
    "--site-inverse-text": c.inverseText,
    "--site-font-display": `'${tokens.fonts.display}', serif`,
    "--site-font-body": `'${tokens.fonts.body}', sans-serif`,
    "--site-radius-sm": tokens.radius.sm,
    "--site-radius-md": tokens.radius.md,
    "--site-radius-lg": tokens.radius.lg,
    "--site-radius-pill": tokens.radius.pill,
    "--site-section-py": tokens.spacing.section,
    "--site-container": tokens.spacing.container,
    "--site-shadow-card": tokens.shadows.card,
    "--site-shadow-elevated": tokens.shadows.elevated,
  };
}

// Build the Google Fonts <link> URL for a given token set.
export function buildGoogleFontsUrl(tokens: DesignTokens): string {
  const fams = new Map<string, Set<number>>();
  const add = (name: string, weights: number[]) => {
    const key = name.replace(/\s+/g, "+");
    const existing = fams.get(key) || new Set<number>();
    weights.forEach((w) => existing.add(w));
    fams.set(key, existing);
  };
  add(tokens.fonts.display, tokens.fonts.displayWeights);
  add(tokens.fonts.body, tokens.fonts.bodyWeights);

  const families = Array.from(fams.entries())
    .map(([name, weights]) => {
      const ws = Array.from(weights).sort((a, b) => a - b).join(";");
      return `family=${name}:wght@${ws}`;
    })
    .join("&");

  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

// Inline style object for the React preview wrapper.
export function tokensToStyle(tokens: DesignTokens): React.CSSProperties {
  return tokensToCssVars(tokens) as unknown as React.CSSProperties;
}
