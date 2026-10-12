import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { ChocolateCard } from "@/components/chocolates/chocolate-card";
import { BookmarkButton } from "@/components/chocolates/bookmark-button";
import { SoftImage } from "@/components/ui/soft-image";
import {
  getChocolateBySlug,
  getChocolates,
  getRelatedChocolates,
} from "@/lib/content";
import { formatPrice } from "@/lib/format";

export async function generateStaticParams() {
  const chocolates = await getChocolates();
  return chocolates.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chocolate = await getChocolateBySlug(slug);
  if (!chocolate) return { title: "Chocolate" };
  return {
    title: chocolate.title,
    description: chocolate.shortDescription,
  };
}

export default async function ChocolateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chocolate = await getChocolateBySlug(slug);
  if (!chocolate) notFound();

  const related = await getRelatedChocolates(chocolate, 4);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-bg-elevated">
          <SoftImage
            src={chocolate.image}
            alt={`${chocolate.title} by ${chocolate.brand}`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
        </div>

        <div>
          <p className="section-label">
            {chocolate.originFlagEmoji} {chocolate.originCountry} ·{" "}
            {chocolate.brand}
          </p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <h1 className="font-display text-4xl text-text-on-dark">
              {chocolate.title}
            </h1>
            <BookmarkButton slug={chocolate.slug} />
          </div>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            {chocolate.shortDescription}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 text-brass">
              <Star className="size-4 fill-current" />
              {chocolate.rating.toFixed(1)}
            </span>
            <span className="font-semibold text-text-on-dark">
              {formatPrice(chocolate.price, chocolate.currency)}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {chocolate.tags.map((tag) => (
              <Link
                key={tag}
                href={`/explore?tag=${encodeURIComponent(tag)}`}
                className="rounded-full bg-tag px-3 py-1 text-xs text-text-muted transition hover:text-brass"
              >
                {tag}
              </Link>
            ))}
          </div>

          <div className="mt-8 space-y-4 text-sm leading-relaxed text-text-muted">
            {chocolate.description.split("\n").map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <Link
            href="/explore"
            className="mt-8 inline-flex h-11 items-center rounded-xl border border-brass px-5 text-sm font-semibold text-brass transition hover:bg-brass/10"
          >
            Back to explore
          </Link>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="section-label">Related discoveries</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ChocolateCard key={item.slug} chocolate={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
