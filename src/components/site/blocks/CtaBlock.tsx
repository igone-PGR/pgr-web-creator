import type { CtaContent } from "@/lib/site/blockContent";
import { BlockShell, Display } from "../BlockShell";

interface Props { content: CtaContent; variant: "a" | "b" }

export function CtaBlock({ content, variant }: Props) {
  if (variant === "b") {
    // Inline horizontal banner
    return (
      <BlockShell alt>
        <div
          className="p-10 md:p-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8"
          style={{
            background: "var(--site-surface)",
            borderRadius: "var(--site-radius-lg)",
            boxShadow: "var(--site-shadow-card)",
          }}
        >
          <div className="max-w-2xl">
            <Display className="text-3xl md:text-4xl">{content.title}</Display>
            {content.subtitle && (
              <p className="mt-3" style={{ color: "var(--site-text-muted)" }}>{content.subtitle}</p>
            )}
          </div>
          <div className="flex gap-3 shrink-0">
            <a
              href={content.primaryCta.href}
              className="px-6 py-3 text-sm font-medium hover:opacity-90 transition"
              style={{ background: "var(--site-accent)", color: "var(--site-accent-text)", borderRadius: "var(--site-radius-pill)" }}
            >
              {content.primaryCta.label}
            </a>
            {content.secondaryCta && (
              <a
                href={content.secondaryCta.href}
                className="px-6 py-3 text-sm font-medium border transition"
                style={{ borderColor: "var(--site-border)", borderRadius: "var(--site-radius-pill)" }}
              >
                {content.secondaryCta.label}
              </a>
            )}
          </div>
        </div>
      </BlockShell>
    );
  }

  // Variant A — inverse big block
  return (
    <BlockShell inverse>
      <div className="text-center max-w-3xl mx-auto">
        <Display className="text-4xl md:text-6xl">{content.title}</Display>
        {content.subtitle && (
          <p className="mt-5 text-lg" style={{ color: "color-mix(in srgb, var(--site-inverse-text) 70%, transparent)" }}>
            {content.subtitle}
          </p>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            href={content.primaryCta.href}
            className="px-7 py-3.5 text-sm font-medium transition hover:opacity-90"
            style={{ background: "var(--site-accent)", color: "var(--site-accent-text)", borderRadius: "var(--site-radius-pill)" }}
          >
            {content.primaryCta.label}
          </a>
          {content.secondaryCta && (
            <a
              href={content.secondaryCta.href}
              className="px-7 py-3.5 text-sm font-medium border transition"
              style={{
                borderColor: "color-mix(in srgb, var(--site-inverse-text) 30%, transparent)",
                color: "var(--site-inverse-text)",
                borderRadius: "var(--site-radius-pill)",
              }}
            >
              {content.secondaryCta.label}
            </a>
          )}
        </div>
      </div>
    </BlockShell>
  );
}
