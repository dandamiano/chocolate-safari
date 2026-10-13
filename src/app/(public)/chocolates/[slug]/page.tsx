import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { ChocolateCard } from "@/components/chocolates/chocolate-card";
import { BookmarkButton } from "@/components/chocolates/bookmark-button";
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewList } from "@/components/reviews/review-list";
import { SoftImage } from "@/components/ui/soft-image";
import { getPublicSession } from "@/lib/auth/session";
import {
  getChocolateBySlug,
  getChocolates,
  getRelatedChocolates,
} from "@/lib/content";
import { formatPrice } from "@/lib/format";
import {
  getMyReviewForChocolate,
  getReviewsForChocolate,
} from "@/lib/reviews/queries";

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

  const [related, reviewData, session] = await Promise.all([
    getRelatedChocolates(chocolate, 4),
    getReviewsForChocolate(slug),
    getPublicSession(),
  ]);

  const myReview = session.user
    ? await getMyReviewForChocolate(slug, session.user.id)
    : null;

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
              Editorial {chocolate.rating.toFixed(1)}
            </span>
            {reviewData.communityAvg != null ? (
              <span className="inline-flex items-center gap-1.5 text-text-muted">
                Community {reviewData.communityAvg.toFixed(1)}
                <span className="text-xs">
                  ({reviewData.count}{" "}
                  {reviewData.count === 1 ? "review" : "reviews"})
                </span>
              </span>
            ) : (
              <span className="text-xs text-text-muted">No community reviews yet</span>
            )}
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

      <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <h2 className="section-label">Community reviews</h2>
          <div className="mt-5">
            <ReviewList
              reviews={reviewData.reviews}
              currentUserId={session.user?.id}
            />
          </div>
        </div>
        <div>
          {session.user ? (
            <ReviewForm
              slug={slug}
              initialRating={myReview?.rating ?? 5}
              initialBody={myReview?.body ?? ""}
            />
          ) : (
            <div className="rounded-2xl border border-border bg-bg-elevated/50 px-5 py-6 text-sm text-text-muted">
              <p>
                <Link href={`/login?next=/chocolates/${slug}`} className="text-brass hover:underline">
                  Sign in
                </Link>{" "}
                to leave a community review. Editorial ratings stay separate.
              </p>
            </div>
          )}
        </div>
      </section>

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
