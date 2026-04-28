import type { HeroContent } from "@/lib/site/blockContent";
import { BlockShell, Eyebrow, Display } from "../BlockShell";

interface Props { content: HeroContent; variant: "a" | "b" }

export function HeroBlock({ content, variant }: Props) {
  if (variant === "b") {
    // Split: text left, image right
    return (
      <BlockShell>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            {content.eyebrow && <Eyebrow className="mb-5">{content.eyebrow}</Eyebrow>}
            <Display as="h1" className="text-5xl md:text-6xl lg:text-7xl mb-6">
              {content.title}
            </Display>
            {content.subtitle && (
              <p className="text-lg md:text-xl max-w-xl mb-8" style={{ color: "var(--site-text-muted)" }}>
                {content.subtitle}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {content.primaryCta && <CtaPrimary {...content.primaryCta} />}
              {content.secondaryCta && <CtaGhost {...content.secondaryCta} />}
            </div>
          </div>
          {content.image && (
            <div
              className="aspect-[4/5] overflow-hidden"
              style={{ borderRadius: "var(--site-radius-lg)", boxShadow: "var(--site-shadow-elevated)" }}
            >
              <img src={content.image} alt={content.imageAlt || ""} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </BlockShell>
    );
  }

  // Variant A — centered, generous, image as wide canvas below
  return (
    <BlockShell>
      <div className="max-w-4xl mx-auto text-center">
        {content.eyebrow && <Eyebrow className="mb-6">{content.eyebrow}</Eyebrow>}
        <Display as="h1" className="text-5xl md:text-7xl lg:text-[5.5rem] mb-8">
          {content.title}
        </Display>
        {content.subtitle && (
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: "var(--site-text-muted)" }}>
            {content.subtitle}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {content.primaryCta && <CtaPrimary {...content.primaryCta} />}
          {content.secondaryCta && <CtaGhost {...content.secondaryCta} />}
        </div>
      </div>
      {content.image && (
        <div
          className="mt-16 aspect-[16/8] overflow-hidden"
          style={{ borderRadius: "var(--site-radius-lg)", boxShadow: "var(--site-shadow-elevated)" }}
        >
          <img src={content.image} alt={content.imageAlt || ""} className="w-full h-full object-cover" />
        </div>
      )}
    </BlockShell>
  );
}

function CtaPrimary({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center px-6 py-3 text-sm font-medium transition hover:opacity-90"
      style={{
        background: "var(--site-accent)",
        color: "var(--site-accent-text)",
        borderRadius: "var(--site-radius-pill)",
      }}
    >
      {label}
    </a>
  );
}

function CtaGhost({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center px-6 py-3 text-sm font-medium border transition hover:bg-black/5"
      style={{
        borderColor: "var(--site-border)",
        color: "var(--site-text)",
        borderRadius: "var(--site-radius-pill)",
      }}
    >
      {label}
    </a>
  );
}
