import Link from "next/link";
import { Star } from "lucide-react";
import { deleteReviewAction } from "@/lib/reviews/actions";
import type { ReviewWithMeta } from "@/lib/reviews/queries";

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function ReviewList({
  reviews,
  currentUserId,
  showChocolateLink = false,
}: {
  reviews: ReviewWithMeta[];
  currentUserId?: string | null;
  showChocolateLink?: boolean;
}) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        No community reviews yet. Be the first to share a tasting note.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="rounded-2xl border border-border/80 bg-bg-base/30 px-4 py-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 text-brass">
                <Star className="size-3.5 fill-current" />
                {review.rating.toFixed(1)}
              </span>
              <span className="text-text-muted">{review.authorLabel}</span>
              <span className="text-text-muted/70">·</span>
              <time
                dateTime={review.created_at}
                className="text-xs text-text-muted"
              >
                {formatDate(review.created_at)}
              </time>
            </div>
            {currentUserId && currentUserId === review.user_id ? (
              <form action={deleteReviewAction}>
                <input type="hidden" name="id" value={review.id} />
                <input type="hidden" name="slug" value={review.chocolate_slug} />
                <button
                  type="submit"
                  className="text-xs text-text-muted transition hover:text-red-300"
                >
                  Delete
                </button>
              </form>
            ) : null}
          </div>
          {showChocolateLink ? (
            <Link
              href={`/chocolates/${review.chocolate_slug}`}
              className="mt-2 inline-block text-sm font-medium text-brass hover:underline"
            >
              {review.chocolateTitle ?? review.chocolate_slug}
            </Link>
          ) : null}
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            {review.body}
          </p>
        </li>
      ))}
    </ul>
  );
}
