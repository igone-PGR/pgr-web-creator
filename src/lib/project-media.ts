import { supabase } from "@/integrations/supabase/client";
import type { UploadedMediaFile } from "@/types/project";

const DATA_URL_PATTERN = /^data:(image\/[a-z0-9.+-]+);base64,(.*)$/i;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);

type UploadSource = UploadedMediaFile | string | null | undefined;

function isUploadedMediaFile(source: UploadSource): source is UploadedMediaFile {
  return Boolean(source && typeof source !== "string" && source.file instanceof File);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = reader.result as string;
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.readAsDataURL(file);
  });
}

function normalizeContentType(raw: string | undefined, fallback: string): string {
  const ct = (raw || "").toLowerCase();
  if (ALLOWED_MIME.has(ct)) return ct;
  return fallback;
}

async function callUpload(pathBase: string, contentType: string, base64: string): Promise<string | null> {
  const { data, error } = await supabase.functions.invoke("upload-project-asset", {
    body: { pathBase, contentType, base64 },
  });
  if (error) {
    console.error("upload-project-asset error", error);
    return null;
  }
  return (data as { url?: string } | null)?.url ?? null;
}

export async function uploadProjectAsset(
  source: UploadSource,
  basePath: string,
  fallbackExtension: string,
): Promise<string | null> {
  if (!source) return null;

  const fallbackMime = fallbackExtension === "png" ? "image/png" : "image/jpeg";

  if (isUploadedMediaFile(source)) {
    if (source.file.size > 5 * 1024 * 1024) {
      console.error("File too large (max 5MB)");
      return null;
    }
    const contentType = normalizeContentType(source.file.type, fallbackMime);
    const base64 = await fileToBase64(source.file);
    return callUpload(basePath, contentType, base64);
  }

  if (source.startsWith("blob:")) {
    console.error("Blob preview received without original file");
    return null;
  }

  if (!source.startsWith("data:")) {
    return source;
  }

  const match = source.match(DATA_URL_PATTERN);
  if (!match) return null;

  const [, rawType, base64Content] = match;
  const contentType = normalizeContentType(rawType, fallbackMime);
  return callUpload(basePath, contentType, base64Content);
}
