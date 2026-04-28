import type { ContactContent } from "@/lib/site/blockContent";
import { BlockShell, Eyebrow, Display } from "../BlockShell";
import { Mail, Phone, MapPin } from "lucide-react";

interface Props { content: ContactContent; variant: "a" | "b" }

export function ContactBlock({ content, variant }: Props) {
  const items = [
    content.email && { icon: Mail, label: "Email", value: content.email, href: `mailto:${content.email}` },
    content.phone && { icon: Phone, label: "Teléfono", value: content.phone, href: `tel:${content.phone.replace(/\s/g, "")}` },
    content.address && { icon: MapPin, label: "Dirección", value: content.address },
  ].filter(Boolean) as { icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { strokeWidth?: number }>; label: string; value: string; href?: string }[];

  if (variant === "b") {
    return (
      <BlockShell id="contacto" inverse>
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            {content.eyebrow && <Eyebrow className="mb-4">{content.eyebrow}</Eyebrow>}
            <Display className="text-4xl md:text-5xl">{content.title}</Display>
            {content.subtitle && (
              <p className="mt-5 max-w-md" style={{ color: "color-mix(in srgb, var(--site-inverse-text) 70%, transparent)" }}>{content.subtitle}</p>
            )}
          </div>
          <ul className="space-y-6">
            {items.map((it, i) => (
              <li key={i} className="flex items-start gap-4">
                <it.icon className="w-5 h-5 mt-1" style={{ color: "var(--site-accent)" }} strokeWidth={1.5} />
                <div>
                  <div className="text-xs uppercase tracking-[0.2em]" style={{ color: "color-mix(in srgb, var(--site-inverse-text) 60%, transparent)" }}>{it.label}</div>
                  {it.href ? (
                    <a href={it.href} className="text-lg hover:opacity-80">{it.value}</a>
                  ) : (
                    <div className="text-lg">{it.value}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </BlockShell>
    );
  }

  return (
    <BlockShell id="contacto">
      <div className="max-w-3xl mx-auto text-center">
        {content.eyebrow && <Eyebrow className="mb-4">{content.eyebrow}</Eyebrow>}
        <Display className="text-4xl md:text-5xl">{content.title}</Display>
        {content.subtitle && (
          <p className="mt-5" style={{ color: "var(--site-text-muted)" }}>{content.subtitle}</p>
        )}
      </div>
      <div className="mt-12 grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {items.map((it, i) => (
          <a
            key={i}
            href={it.href || "#"}
            className="p-6 border block text-center hover:-translate-y-0.5 transition"
            style={{ borderColor: "var(--site-border)", borderRadius: "var(--site-radius-lg)", background: "var(--site-surface)" }}
          >
            <it.icon className="w-5 h-5 mx-auto mb-3" style={{ color: "var(--site-accent)" }} strokeWidth={1.5} />
            <div className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--site-text-muted)" }}>{it.label}</div>
            <div className="mt-2 text-sm">{it.value}</div>
          </a>
        ))}
      </div>
    </BlockShell>
  );
}
