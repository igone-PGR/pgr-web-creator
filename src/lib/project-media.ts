import { supabase } from "@/integrations/supabase/client";
import type { UploadedMediaFile } from "@/types/project";

const PROJECT_PHOTOS_BUCKET = "project-photos";
const DATA_URL_PATTERN = /^data:(image\/[a-z0-9.+-]+);base64,(.*)$/i;

type UploadSource = UploadedMediaFile | string | null | undefined;

function isUploadedMediaFile(source: UploadSource): source is UploadedMediaFile {
  return Boolean(source && typeof source !== "string" && source.file instanceof File);
}

function isBlobUrl(source: string): boolean {
  return source.startsWith("blob:");
}

function normalizeExtension(value: string | undefined, fallback: string): string {
  if (!value) return fallback;

  const raw = value.includes("/") ? value.split("/")[1] : value;
  const normalized = raw.toLowerCase().replace("svg+xml", "svg").replace("jpeg", "jpg");
  const sanitized = normalized.replace(/[^a-z0-9]/g, "");

  return sanitized || fallback;
}

function getPublicUrl(path: string): string {
  return supabase.storage.from(PROJECT_PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function uploadBytes(path: string, bytes: Uint8Array, contentType: string): Promise<string | null> {
  const { error } = await supabase.storage
    .from(PROJECT_PHOTOS_BUCKET)
    .upload(path, bytes, { contentType, upsert: true });

  if (error) {
    console.error("Storage upload error:", error);
    return null;
  }

  return getPublicUrl(path);
}

async function uploadFile(path: string, file: File, contentType: string): Promise<string | null> {
  const { error } = await supabase.storage
    .from(PROJECT_PHOTOS_BUCKET)
    .upload(path, file, { contentType, upsert: true });

  if (error) {
    console.error("Storage upload error:", error);
    return null;
  }

  return getPublicUrl(path);
}

export async function uploadProjectAsset(
  source: UploadSource,
  basePath: string,
  fallbackExtension: string,
): Promise<string | null> {
  if (!source) return null;

  if (isUploadedMediaFile(source)) {
    const extension = normalizeExtension(source.file.name.split(".").pop() || source.file.type, fallbackExtension);
    const contentType = source.file.type || `image/${extension}`;
    return uploadFile(`${basePath}.${extension}`, source.file, contentType);
  }

  if (isBlobUrl(source)) {
    console.error("Blob preview received without original file");
    return null;
  }

  if (!source.startsWith("data:")) {
    return source;
  }

  const match = source.match(DATA_URL_PATTERN);
  if (!match) {
    console.error("Invalid image data URL");
    return null;
  }

  const [, contentType, base64Content] = match;
  const binaryString = atob(base64Content);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const extension = normalizeExtension(contentType, fallbackExtension);
  return uploadBytes(`${basePath}.${extension}`, bytes, contentType);
}