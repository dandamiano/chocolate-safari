import { getSupabaseServiceRole } from "@/lib/supabase";

export const CHOCOLATE_IMAGE_BUCKET = "chocolates";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

function sanitizePathSegment(value: string): string {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return cleaned || "product";
}

/** Upload a product image to the public `chocolates` bucket; returns public URL. */
export async function uploadChocolateImageFile(
  file: File,
  slugHint?: string
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Use JPEG, PNG, WebP, GIF, or AVIF.");
  }
  if (file.size <= 0) {
    throw new Error("Choose an image file.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 5MB or smaller.");
  }

  const folder = sanitizePathSegment(slugHint ?? "product");
  const ext = extensionForMime(file.type);
  const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const supabase = getSupabaseServiceRole();
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from(CHOCOLATE_IMAGE_BUCKET)
    .upload(path, bytes, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600",
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(CHOCOLATE_IMAGE_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}
