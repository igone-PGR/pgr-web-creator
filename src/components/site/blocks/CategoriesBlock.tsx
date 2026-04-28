import type { CategoriesContent } from "@/lib/site/blockContent";
import { BlockShell, Eyebrow, Display } from "../BlockShell";

interface Props { content: CategoriesContent; variant: "a" | "b" }

export function CategoriesBlock({ content, variant }: Props) {
  if (variant === "b") {
    return (
      <BlockShell alt>
        {content.eyebrow && <Eyebrow className="mb-4">{content.eyebrow}</Eyebrow>}
        <Display className="text-3xl md:text-4xl mb-10 max-w-2xl">{content.title}</Display>
        <div className="flex flex-wrap gap-3">
          {content.items.map((item, i) => (
            <span
              key={i}
              className="px-5 py-2.5 text-sm border"
              style={{
                borderColor: "var(--site-border)",
                background: "var(--site-surface)",
                borderRadius: "var(--site-radius-pill)",
              }}
            >
              {item.title}
            </span>
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {content.items.map((item, i) => (
          <article
            key={i}
            className="overflow-hidden border"
            style={{ borderColor: "var(--site-border)", borderRadius: "var(--site-radius-lg)", background: "var(--site-surface)" }}
          >
            {item.image && (
              <div className="aspect-[4/3] overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5">
              <h3 className="font-[family-name:var(--site-font-display)] text-lg">{item.title}</h3>
              {item.description && (
                <p className="mt-2 text-sm" style={{ color: "var(--site-text-muted)" }}>{item.description}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </BlockShell>
  );
}
