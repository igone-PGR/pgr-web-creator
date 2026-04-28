import type { ProcessContent } from "@/lib/site/blockContent";
import { BlockShell, Eyebrow, Display } from "../BlockShell";

interface Props { content: ProcessContent; variant: "a" | "b" }

export function ProcessBlock({ content, variant }: Props) {
  if (variant === "b") {
    return (
      <BlockShell alt>
        <div className="max-w-3xl mb-14">
          {content.eyebrow && <Eyebrow className="mb-4">{content.eyebrow}</Eyebrow>}
          <Display className="text-4xl md:text-5xl">{content.title}</Display>
        </div>
        <div className="space-y-12">
          {content.steps.map((step, i) => (
            <div key={i} className="grid md:grid-cols-[120px_1fr] gap-6 md:gap-12 border-t pt-8" style={{ borderColor: "var(--site-border)" }}>
              <span className="font-[family-name:var(--site-font-display)] text-4xl" style={{ color: "var(--site-accent)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-[family-name:var(--site-font-display)] text-2xl mb-2">{step.title}</h3>
                <p style={{ color: "var(--site-text-muted)" }}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </BlockShell>
    );
  }
  return (
    <BlockShell>
      <div className="max-w-3xl mb-12">
        {content.eyebrow && <Eyebrow className="mb-4">{content.eyebrow}</Eyebrow>}
        <Display className="text-4xl md:text-5xl">{content.title}</Display>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {content.steps.map((step, i) => (
          <div
            key={i}
            className="p-6 border h-full"
            style={{ borderColor: "var(--site-border)", borderRadius: "var(--site-radius-lg)", background: "var(--site-surface)" }}
          >
            <div className="text-sm font-mono mb-4" style={{ color: "var(--site-accent)" }}>
              {String(i + 1).padStart(2, "0")} / {String(content.steps.length).padStart(2, "0")}
            </div>
            <h3 className="font-[family-name:var(--site-font-display)] text-lg mb-2">{step.title}</h3>
            <p className="text-sm" style={{ color: "var(--site-text-muted)" }}>{step.description}</p>
          </div>
        ))}
      </div>
    </BlockShell>
  );
}
