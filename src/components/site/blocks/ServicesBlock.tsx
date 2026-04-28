import type { ServicesContent } from "@/lib/site/blockContent";
import { BlockShell, Eyebrow, Display } from "../BlockShell";
import * as Icons from "lucide-react";

interface Props { content: ServicesContent; variant: "a" | "b" }

function Icon({ name }: { name?: string }) {
  if (!name) return null;
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>>)[name];
  if (!Cmp) return null;
  return <Cmp className="w-6 h-6" strokeWidth={1.5} />;
}

export function ServicesBlock({ content, variant }: Props) {
  if (variant === "b") {
    // Numbered list, editorial
    return (
      <BlockShell alt id="servicios">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
          <div>
            {content.eyebrow && <Eyebrow className="mb-5">{content.eyebrow}</Eyebrow>}
            <Display className="text-4xl md:text-5xl">{content.title}</Display>
            {content.subtitle && (
              <p className="mt-5 text-base" style={{ color: "var(--site-text-muted)" }}>
                {content.subtitle}
              </p>
            )}
          </div>
          <ul className="divide-y" style={{ borderColor: "var(--site-border)" }}>
            {content.items.map((item, i) => (
              <li key={i} className="py-7 flex gap-6 first:pt-0">
                <span
                  className="font-[family-name:var(--site-font-display)] text-3xl shrink-0 w-12"
                  style={{ color: "var(--site-accent)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-[family-name:var(--site-font-display)] text-2xl mb-2">{item.title}</h3>
                  <p style={{ color: "var(--site-text-muted)" }}>{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </BlockShell>
    );
  }

  // Variant A — grid of cards
  return (
    <BlockShell id="servicios">
      <div className="max-w-3xl mb-14">
        {content.eyebrow && <Eyebrow className="mb-4">{content.eyebrow}</Eyebrow>}
        <Display className="text-4xl md:text-5xl">{content.title}</Display>
        {content.subtitle && (
          <p className="mt-4 text-lg" style={{ color: "var(--site-text-muted)" }}>
            {content.subtitle}
          </p>
        )}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {content.items.map((item, i) => (
          <article
            key={i}
            className="p-7 border transition hover:-translate-y-0.5"
            style={{
              background: "var(--site-surface)",
              borderColor: "var(--site-border)",
              borderRadius: "var(--site-radius-lg)",
              boxShadow: "var(--site-shadow-card)",
            }}
          >
            {item.icon && (
              <div className="mb-5" style={{ color: "var(--site-accent)" }}>
                <Icon name={item.icon} />
              </div>
            )}
            <h3 className="font-[family-name:var(--site-font-display)] text-xl mb-2">{item.title}</h3>
            <p className="text-sm" style={{ color: "var(--site-text-muted)" }}>{item.description}</p>
          </article>
        ))}
      </div>
    </BlockShell>
  );
}
