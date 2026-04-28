import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  className?: string;
  alt?: boolean;       // use surfaceAlt background
  inverse?: boolean;   // dark/inverse section
  noPadding?: boolean;
  id?: string;
}

// Section wrapper that consumes site CSS vars set by the renderer.
export function BlockShell({ children, className, alt, inverse, noPadding, id }: Props) {
  const bg = inverse
    ? "bg-[var(--site-inverse)] text-[var(--site-inverse-text)]"
    : alt
    ? "bg-[var(--site-surface-alt)] text-[var(--site-text)]"
    : "bg-[var(--site-bg)] text-[var(--site-text)]";

  return (
    <section
      id={id}
      className={cn(
        bg,
        !noPadding && "py-[var(--site-section-py)]",
        className
      )}
    >
      <div
        className="mx-auto px-6"
        style={{ maxWidth: "var(--site-container)" }}
      >
        {children}
      </div>
    </section>
  );
}

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-block text-xs uppercase tracking-[0.2em] text-[var(--site-text-muted)]",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Display({ children, className, as: Tag = "h2" }: { children: ReactNode; className?: string; as?: "h1" | "h2" | "h3" }) {
  return (
    <Tag
      className={cn("font-[family-name:var(--site-font-display)] leading-[1.05] tracking-tight", className)}
    >
      {children}
    </Tag>
  );
}
