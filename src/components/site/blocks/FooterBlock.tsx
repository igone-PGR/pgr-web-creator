import type { FooterContent } from "@/lib/site/blockContent";

interface Props { content: FooterContent; variant: "a" | "b" }

export function FooterBlock({ content, variant }: Props) {
  if (variant === "b") {
    // Minimal one-line
    return (
      <footer className="border-t" style={{ borderColor: "var(--site-border)", background: "var(--site-bg)" }}>
        <div
          className="mx-auto px-6 py-8 flex flex-col md:flex-row gap-3 items-center justify-between text-sm"
          style={{ maxWidth: "var(--site-container)", color: "var(--site-text-muted)" }}
        >
          <span className="font-[family-name:var(--site-font-display)]" style={{ color: "var(--site-text)" }}>
            {content.brand}
          </span>
          <span>{content.copyright || `© ${new Date().getFullYear()} ${content.brand}`}</span>
        </div>
      </footer>
    );
  }

  // Variant A — multi-column inverse
  return (
    <footer style={{ background: "var(--site-inverse)", color: "var(--site-inverse-text)" }}>
      <div className="mx-auto px-6 py-16" style={{ maxWidth: "var(--site-container)" }}>
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="font-[family-name:var(--site-font-display)] text-2xl">{content.brand}</div>
            {content.tagline && (
              <p className="mt-3 text-sm max-w-sm" style={{ color: "color-mix(in srgb, var(--site-inverse-text) 70%, transparent)" }}>
                {content.tagline}
              </p>
            )}
          </div>
          {content.columns?.map((col, i) => (
            <div key={i} className="md:col-span-2">
              <h4 className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "color-mix(in srgb, var(--site-inverse-text) 60%, transparent)" }}>
                {col.title}
              </h4>
              <ul className="space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="hover:opacity-80 transition">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {content.contact && (
            <div className="md:col-span-3">
              <h4 className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "color-mix(in srgb, var(--site-inverse-text) 60%, transparent)" }}>
                Contacto
              </h4>
              <ul className="space-y-2 text-sm">
                {content.contact.email && <li>{content.contact.email}</li>}
                {content.contact.phone && <li>{content.contact.phone}</li>}
                {content.contact.address && <li>{content.contact.address}</li>}
              </ul>
            </div>
          )}
        </div>
        <div
          className="mt-12 pt-6 border-t flex flex-col md:flex-row justify-between gap-3 text-xs"
          style={{
            borderColor: "color-mix(in srgb, var(--site-inverse-text) 15%, transparent)",
            color: "color-mix(in srgb, var(--site-inverse-text) 60%, transparent)",
          }}
        >
          <span>{content.copyright || `© ${new Date().getFullYear()} ${content.brand}. Todos los derechos reservados.`}</span>
          {content.socials && (
            <div className="flex gap-4">
              {content.socials.map((s) => (
                <a key={s.href} href={s.href} className="hover:opacity-80 transition">{s.label}</a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
