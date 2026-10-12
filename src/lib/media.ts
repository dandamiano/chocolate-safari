/** True when `src` is an absolute http(s) URL (e.g. Supabase Storage public URL). */
export function isAbsoluteMediaSrc(src: string): boolean {
  return /^https?:\/\//i.test(src.trim());
}

/**
 * Normalize product / CMS image paths for `next/image`.
 * Accepts relative `/images/...` paths and absolute `https://...` URLs.
 */
export function resolveMediaSrc(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;
  if (isAbsoluteMediaSrc(trimmed)) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
