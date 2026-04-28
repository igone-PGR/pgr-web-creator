import type { HoursContent } from "@/lib/site/blockContent";
import { BlockShell, Display } from "../BlockShell";

interface Props { content: HoursContent; variant: "a" | "b" }

export function HoursBlock({ content, variant }: Props) {
  if (variant === "b") {
    return (
      <BlockShell inverse>
        <div className="max-w-2xl mx-auto text-center">
          {content.title && <Display className="text-3xl md:text-4xl mb-8">{content.title}</Display>}
          <ul className="space-y-2 text-lg">
            {content.rows.map((r, i) => (
              <li key={i} className="flex justify-between border-b pb-2" style={{ borderColor: "color-mix(in srgb, var(--site-inverse-text) 15%, transparent)" }}>
                <span>{r.day}</span>
                <span style={{ color: "var(--site-accent)" }}>{r.hours}</span>
              </li>
            ))}
          </ul>
          {content.note && <p className="mt-6 text-sm" style={{ color: "color-mix(in srgb, var(--site-inverse-text) 70%, transparent)" }}>{content.note}</p>}
        </div>
      </BlockShell>
    );
  }
  return (
    <BlockShell alt>
      <div
        className="max-w-xl mx-auto p-8"
        style={{ background: "var(--site-surface)", borderRadius: "var(--site-radius-lg)", boxShadow: "var(--site-shadow-card)" }}
      >
        {content.title && <Display className="text-2xl mb-6">{content.title}</Display>}
        <ul className="divide-y" style={{ borderColor: "var(--site-border)" }}>
          {content.rows.map((r, i) => (
            <li key={i} className="flex justify-between py-3">
              <span>{r.day}</span>
              <span style={{ color: "var(--site-text-muted)" }}>{r.hours}</span>
            </li>
          ))}
        </ul>
        {content.note && <p className="mt-4 text-sm" style={{ color: "var(--site-text-muted)" }}>{content.note}</p>}
      </div>
    </BlockShell>
  );
}
