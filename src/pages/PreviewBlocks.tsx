import { useMemo, useState } from "react";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { buildDemoSite } from "@/lib/site/demoSite";
import { MOOD_LIST } from "@/lib/site/moods";
import type { MoodId, VariantId } from "@/lib/site/types";

export default function PreviewBlocks() {
  const [mood, setMood] = useState<MoodId>("editorial");
  const [variant, setVariant] = useState<VariantId>("a");

  const site = useMemo(() => buildDemoSite(mood, variant), [mood, variant]);

  return (
    <div className="min-h-screen bg-background">
      {/* Control bar */}
      <div className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium">Block library preview</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Mood:</span>
            {MOOD_LIST.map((m) => (
              <button
                key={m.id}
                onClick={() => setMood(m.id)}
                className={`px-3 py-1 rounded-full border transition ${
                  mood === m.id ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Variant:</span>
            {(["a", "b"] as VariantId[]).map((v) => (
              <button
                key={v}
                onClick={() => setVariant(v)}
                className={`px-3 py-1 rounded-full border transition uppercase ${
                  variant === v ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <SiteRenderer site={site} />
    </div>
  );
}
