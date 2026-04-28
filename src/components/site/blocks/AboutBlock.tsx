import type { AboutContent } from "@/lib/site/blockContent";
import { BlockShell, Eyebrow, Display } from "../BlockShell";

interface Props { content: AboutContent; variant: "a" | "b" }

export function AboutBlock({ content, variant }: Props) {
  const paragraphs = content.body.split(/\n\n+/);

  if (variant === "b") {
    // Image full bleed left, text right with bullets
    return (
      <BlockShell id="sobre-nosotros">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {content.image && (
            <div
              className="aspect-[4/5] overflow-hidden"
              style={{ borderRadius: "var(--site-radius-lg)", boxShadow: "var(--site-shadow-elevated)" }}
            >
              <img src={content.image} alt={content.imageAlt || ""} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            {content.eyebrow && <Eyebrow className="mb-4">{content.eyebrow}</Eyebrow>}
            <Display className="text-4xl md:text-5xl mb-6">{content.title}</Display>
            <div className="space-y-4 text-base" style={{ color: "var(--site-text-muted)" }}>
              {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            {content.bullets && content.bullets.length > 0 && (
              <ul className="mt-8 space-y-3">
                {content.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="mt-2 w-1.5 h-1.5 shrink-0" style={{ background: "var(--site-accent)" }} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </BlockShell>
    );
  }

  // Variant A — text-led, asymmetric
  return (
    <BlockShell alt id="sobre-nosotros">
      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          {content.eyebrow && <Eyebrow className="mb-4">{content.eyebrow}</Eyebrow>}
          <Display className="text-4xl md:text-5xl">{content.title}</Display>
        </div>
        <div className="lg:col-span-6 lg:col-start-7 space-y-5 text-lg" style={{ color: "var(--site-text-muted)" }}>
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
    </BlockShell>
  );
}
