import type { NavContent } from "@/lib/site/blockContent";

interface Props { content: NavContent; variant: "a" | "b" }

export function NavBlock({ content, variant }: Props) {
  if (variant === "b") {
    // Centered with brand on top, links below — editorial feel
    return (
      <header
        className="border-b"
        style={{ borderColor: "var(--site-border)", background: "var(--site-bg)" }}
      >
        <div
          className="mx-auto px-6 py-6 flex flex-col items-center gap-3"
          style={{ maxWidth: "var(--site-container)" }}
        >
          <a
            href="#"
            className="font-[family-name:var(--site-font-display)] text-2xl tracking-tight"
            style={{ color: "var(--site-text)" }}
          >
            {content.brand}
          </a>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            {content.links.map((l) => (
              <a key={l.href} href={l.href} className="hover:opacity-70 transition" style={{ color: "var(--site-text-muted)" }}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
    );
  }

  // Variant A — classic horizontal
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b"
      style={{ borderColor: "var(--site-border)", background: "color-mix(in srgb, var(--site-bg) 88%, transparent)" }}
    >
      <div
        className="mx-auto px-6 h-16 flex items-center justify-between"
        style={{ maxWidth: "var(--site-container)" }}
      >
        <a href="#" className="font-[family-name:var(--site-font-display)] text-xl tracking-tight" style={{ color: "var(--site-text)" }}>
          {content.brand}
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {content.links.map((l) => (
            <a key={l.href} href={l.href} className="hover:opacity-70 transition" style={{ color: "var(--site-text)" }}>
              {l.label}
            </a>
          ))}
        </nav>
        {content.cta && (
          <a
            href={content.cta.href}
            className="text-sm px-4 py-2 transition hover:opacity-90"
            style={{
              background: "var(--site-accent)",
              color: "var(--site-accent-text)",
              borderRadius: "var(--site-radius-pill)",
            }}
          >
            {content.cta.label}
          </a>
        )}
      </div>
    </header>
  );
}
