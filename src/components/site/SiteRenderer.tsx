import { useEffect } from "react";
import type { GeneratedSite } from "@/lib/site/types";
import { tokensToStyle, buildGoogleFontsUrl } from "@/lib/site/tokens";
import { renderBlock } from "./registry";

interface Props {
  site: GeneratedSite;
}

const FONTS_LINK_ID = "site-google-fonts";

export function SiteRenderer({ site }: Props) {
  // Inject Google Fonts based on tokens (idempotent per URL).
  useEffect(() => {
    const url = buildGoogleFontsUrl(site.tokens);
    let link = document.getElementById(FONTS_LINK_ID) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = FONTS_LINK_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    if (link.href !== url) link.href = url;
  }, [site.tokens]);

  const style = tokensToStyle(site.tokens);

  return (
    <div
      style={{ ...style, background: "var(--site-bg)", color: "var(--site-text)", fontFamily: "var(--site-font-body)" }}
      className="antialiased"
    >
      {site.blocks.map((b) => (
        <div key={b.id}>{renderBlock(b)}</div>
      ))}
    </div>
  );
}
