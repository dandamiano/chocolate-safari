import Image, { type ImageProps } from "next/image";
import { isAbsoluteMediaSrc, resolveMediaSrc } from "@/lib/media";

type SoftImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

/**
 * `next/image` wrapper that accepts relative `/images/...` paths and absolute
 * https URLs (Supabase Storage). Remote URLs use `unoptimized` so a missing
 * `remotePatterns` entry cannot 500 the page; local paths stay optimized.
 */
export function SoftImage({ src, unoptimized, alt, ...props }: SoftImageProps) {
  const resolved = resolveMediaSrc(src);
  const remote = isAbsoluteMediaSrc(resolved);

  return (
    <Image
      src={resolved}
      alt={alt}
      unoptimized={unoptimized ?? remote}
      {...props}
    />
  );
}
