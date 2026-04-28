import type { GalleryContent } from "@/lib/site/blockContent";
import { BlockShell, Eyebrow, Display } from "../BlockShell";

interface Props { content: GalleryContent; variant: "a" | "b" }

export function GalleryBlock({ content, variant }: Props) {
  if (variant === "b") {
    // Mosaic asymmetric
    return (
      <BlockShell>
        {(content.title || content.eyebrow) && (
          <div className="mb-10 max-w-2xl">
            {content.eyebrow && <Eyebrow className="mb-4">{content.eyebrow}</Eyebrow>}
            {content.title && <Display className="text-4xl">{content.title}</Display>}
          </div>
        )}
        <div className="grid grid-cols-12 gap-3 md:gap-4">
          {content.images.map((img, i) => {
            const span =
              i % 5 === 0 ? "col-span-12 md:col-span-8 row-span-2 aspect-[16/10]"
              : i % 5 === 1 ? "col-span-6 md:col-span-4 aspect-square"
              : i % 5 === 2 ? "col-span-6 md:col-span-4 aspect-square"
              : i % 5 === 3 ? "col-span-12 md:col-span-6 aspect-[4/3]"
              : "col-span-12 md:col-span-6 aspect-[4/3]";
            return (
              <figure key={i} className={`${span} overflow-hidden`} style={{ borderRadius: "var(--site-radius-md)" }}>
                <img src={img.src} alt={img.alt || ""} className="w-full h-full object-cover" />
              </figure>
            );
          })}
        </div>
      </BlockShell>
    );
  }
  return (
    <BlockShell alt>
      {(content.title || content.eyebrow) && (
        <div className="mb-10 max-w-2xl">
          {content.eyebrow && <Eyebrow className="mb-4">{content.eyebrow}</Eyebrow>}
          {content.title && <Display className="text-4xl">{content.title}</Display>}
        </div>
      )}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {content.images.map((img, i) => (
          <figure key={i} className="aspect-[4/3] overflow-hidden" style={{ borderRadius: "var(--site-radius-md)" }}>
            <img src={img.src} alt={img.alt || ""} className="w-full h-full object-cover hover:scale-105 transition duration-700" />
          </figure>
        ))}
      </div>
    </BlockShell>
  );
}
