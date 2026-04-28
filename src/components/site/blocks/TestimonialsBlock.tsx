import type { TestimonialsContent } from "@/lib/site/blockContent";
import { BlockShell, Eyebrow, Display } from "../BlockShell";

interface Props { content: TestimonialsContent; variant: "a" | "b" }

export function TestimonialsBlock({ content, variant }: Props) {
  if (variant === "b") {
    // Single big quote
    const main = content.items[0];
    if (!main) return null;
    return (
      <BlockShell inverse>
        <div className="max-w-4xl mx-auto text-center">
          <div className="font-[family-name:var(--site-font-display)] text-3xl md:text-5xl leading-tight">
            “{main.quote}”
          </div>
          <div className="mt-8 text-sm uppercase tracking-[0.2em]" style={{ color: "color-mix(in srgb, var(--site-inverse-text) 70%, transparent)" }}>
            {main.author}{main.role ? ` · ${main.role}` : ""}
          </div>
        </div>
      </BlockShell>
    );
  }
  return (
    <BlockShell>
      <div className="max-w-3xl mb-12">
        {content.eyebrow && <Eyebrow className="mb-4">{content.eyebrow}</Eyebrow>}
        {content.title && <Display className="text-4xl md:text-5xl">{content.title}</Display>}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {content.items.map((t, i) => (
          <blockquote
            key={i}
            className="p-7 border"
            style={{
              background: "var(--site-surface)",
              borderColor: "var(--site-border)",
              borderRadius: "var(--site-radius-lg)",
            }}
          >
            <p className="font-[family-name:var(--site-font-display)] text-lg leading-snug">“{t.quote}”</p>
            <footer className="mt-5 text-sm" style={{ color: "var(--site-text-muted)" }}>
              <span style={{ color: "var(--site-text)" }}>{t.author}</span>
              {t.role && <> · {t.role}</>}
            </footer>
          </blockquote>
        ))}
      </div>
    </BlockShell>
  );
}
