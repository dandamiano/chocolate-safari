import Link from "next/link";
import { Star } from "lucide-react";
import type { Chocolate } from "@/lib/schemas";
import { formatPrice } from "@/lib/format";
import { SoftImage } from "@/components/ui/soft-image";
import { BookmarkButton } from "./bookmark-button";

export function ChocolateCard({ chocolate }: { chocolate: Chocolate }) {
  return (
    <Link
      href={`/chocolates/${chocolate.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated transition duration-300 hover:-translate-y-1 hover:border-brass/60 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-tag">
        <SoftImage
          src={chocolate.image}
          alt={`${chocolate.title} by ${chocolate.brand}`}
          fill
          sizes="(max-width: 768px) 70vw, (max-width: 1280px) 30vw, 18vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-2.5 top-2.5 rounded-md bg-bg-base/70 px-1.5 py-0.5 text-sm backdrop-blur">
          {chocolate.originFlagEmoji}
        </span>
        <BookmarkButton
          slug={chocolate.slug}
          className="absolute right-2.5 top-2.5"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <div>
          <h3 className="font-sans text-[15px] font-semibold text-text-on-dark">
            {chocolate.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-text-muted">
            {chocolate.shortDescription}
          </p>
        </div>
        <div className="mt-auto flex flex-wrap gap-1.5">
          {chocolate.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-tag px-2 py-0.5 text-[11px] text-text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1 text-[12.5px]">
          <span className="inline-flex items-center gap-1 text-brass">
            <Star className="size-3.5 fill-current" />
            {chocolate.rating.toFixed(1)}
          </span>
          <span className="font-medium text-text-on-dark">
            {formatPrice(chocolate.price, chocolate.currency)}
          </span>
        </div>
      </div>
    </Link>
  );
}
