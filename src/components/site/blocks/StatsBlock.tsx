import type { StatsContent } from "@/lib/site/blockContent";
import { BlockShell, Display } from "../BlockShell";

interface Props { content: StatsContent; variant: "a" | "b" }

export function StatsBlock({ content, variant }: Props) {
  if (variant === "b") {
    return (
      <BlockShell inverse>
        <div className="grid md:grid-cols-3 gap-10 text-center">
          {content.items.map((s, i) => (
            <div key={i}>
              <div className="font-[family-name:var(--site-font-display)] text-5xl md:text-6xl" style={{ color: "var(--site-accent)" }}>
                {s.value}
              </div>
              <div className="mt-2 text-sm uppercase tracking-[0.2em]" style={{ color: "color-mix(in srgb, var(--site-inverse-text) 70%, transparent)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </BlockShell>
    );
  }
  return (
    <BlockShell>
      {content.title && <Display className="text-3xl md:text-4xl max-w-2xl mb-12">{content.title}</Display>}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        {content.items.map((s, i) => (
          <div key={i} className="border-t pt-6" style={{ borderColor: "var(--site-border)" }}>
            <div className="font-[family-name:var(--site-font-display)] text-4xl">{s.value}</div>
            <div className="mt-2 text-sm" style={{ color: "var(--site-text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </BlockShell>
  );
}
