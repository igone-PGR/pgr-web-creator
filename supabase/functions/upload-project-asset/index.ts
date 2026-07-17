import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const BUCKET = "project-photos";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

// pathBase must be "<uuid>/photo-<n>" or "logos/<uuid>"
const PATH_RE = /^(?:[0-9a-f-]{8,64}\/photo-\d{1,2}|logos\/[0-9a-f-]{8,64})$/i;

const BodySchema = z.object({
  pathBase: z.string().min(3).max(120).regex(PATH_RE, "invalid path"),
  contentType: z.string().refine((v) => ALLOWED.has(v), "unsupported mime"),
  base64: z.string().min(10).max(Math.ceil((MAX_BYTES * 4) / 3) + 128),
});

// naive in-memory IP throttle (per isolate)
const hits = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 60_000;
const LIMIT = 20;

function throttle(ip: string): boolean {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now - cur.ts > WINDOW_MS) {
    hits.set(ip, { count: 1, ts: now });
    return true;
  }
  cur.count += 1;
  return cur.count <= LIMIT;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    if (!throttle(ip)) {
      return new Response(JSON.stringify({ error: "Too many uploads, try again later" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { pathBase, contentType, base64 } = parsed.data;

    // decode base64 (strip data URL prefix if present)
    const cleaned = base64.includes(",") ? base64.split(",")[1] : base64;
    let bytes: Uint8Array;
    try {
      const bin = atob(cleaned);
      bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid base64" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (bytes.byteLength > MAX_BYTES) {
      return new Response(JSON.stringify({ error: "File too large (max 5MB)" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ext = EXT_BY_MIME[contentType];
    const fullPath = `${pathBase}.${ext}`;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fullPath, bytes, { contentType, upsert: true });

    if (error) {
      console.error("upload error", error);
      return new Response(JSON.stringify({ error: "Upload failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fullPath);
    return new Response(JSON.stringify({ url: data.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
