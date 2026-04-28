import type { MapContent } from "@/lib/site/blockContent";
import { BlockShell, Display } from "../BlockShell";

interface Props { content: MapContent; variant: "a" | "b" }

export function MapBlock({ content, variant }: Props) {
  const src = content.embedUrl || `https://www.google.com/maps?q=${encodeURIComponent(content.address)}&output=embed`;

  if (variant === "b") {
    // Full-bleed map with floating address card
    return (
      <section className="relative" style={{ background: "var(--site-bg)" }}>
        <div className="aspect-[16/9] w-full">
          <iframe src={src} className="w-full h-full border-0" loading="lazy" title="Mapa" />
        </div>
        <div className="mx-auto px-6" style={{ maxWidth: "var(--site-container)" }}>
          <div
            className="-mt-16 relative p-6 max-w-md"
            style={{
              background: "var(--site-surface)",
              borderRadius: "var(--site-radius-lg)",
              boxShadow: "var(--site-shadow-elevated)",
            }}
          >
            {content.title && <Display className="text-xl mb-2">{content.title}</Display>}
            <p style={{ color: "var(--site-text-muted)" }}>{content.address}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <BlockShell>
      <div className="grid lg:grid-cols-[1fr_2fr] gap-8 items-start">
        <div>
          {content.title && <Display className="text-3xl mb-3">{content.title}</Display>}
          <p style={{ color: "var(--site-text-muted)" }}>{content.address}</p>
        </div>
        <div className="aspect-[16/9] overflow-hidden" style={{ borderRadius: "var(--site-radius-lg)" }}>
          <iframe src={src} className="w-full h-full border-0" loading="lazy" title="Mapa" />
        </div>
      </div>
    </BlockShell>
  );
}
