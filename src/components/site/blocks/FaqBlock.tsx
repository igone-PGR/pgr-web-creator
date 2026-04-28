import type { FaqContent } from "@/lib/site/blockContent";
import { BlockShell, Eyebrow, Display } from "../BlockShell";

interface Props { content: FaqContent; variant: "a" | "b" }

export function FaqBlock({ content, variant }: Props) {
  if (variant === "b") {
    return (
      <BlockShell alt>
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12">
          <div>
            {content.eyebrow && <Eyebrow className="mb-4">{content.eyebrow}</Eyebrow>}
            <Display className="text-4xl md:text-5xl">{content.title}</Display>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--site-border)" }}>
            {content.items.map((it, i) => (
              <details key={i} className="group py-6">
                <summary className="flex justify-between items-start cursor-pointer list-none gap-6">
                  <span className="font-[family-name:var(--site-font-display)] text-xl">{it.question}</span>
                  <span className="shrink-0 mt-1 text-2xl group-open:rotate-45 transition" style={{ color: "var(--site-accent)" }}>+</span>
                </summary>
                <p className="mt-4 max-w-2xl" style={{ color: "var(--site-text-muted)" }}>{it.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </BlockShell>
    );
  }
  return (
    <BlockShell>
      <div className="max-w-3xl mx-auto">
        {content.eyebrow && <Eyebrow className="mb-4">{content.eyebrow}</Eyebrow>}
        <Display className="text-4xl md:text-5xl text-center mb-12">{content.title}</Display>
        <div className="space-y-3">
          {content.items.map((it, i) => (
            <details
              key={i}
              className="group p-6 border"
              style={{ borderColor: "var(--site-border)", borderRadius: "var(--site-radius-md)", background: "var(--site-surface)" }}
            >
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <span className="font-medium">{it.question}</span>
                <span className="shrink-0 text-xl group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-4 text-sm" style={{ color: "var(--site-text-muted)" }}>{it.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </BlockShell>
  );
}
