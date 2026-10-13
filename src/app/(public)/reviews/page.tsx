import Link from "next/link";
import { ReviewList } from "@/components/reviews/review-list";
import { getPublicSession } from "@/lib/auth/session";
import { getRecentReviews } from "@/lib/reviews/queries";
import { isSupabaseConfigured } from "@/lib/supabase-env";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const [reviews, session] = await Promise.all([
    getRecentReviews(30),
    getPublicSession(),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="section-label">Community</p>
      <h1 className="mt-2 font-display text-3xl text-text-on-dark sm:text-4xl">
        Recent reviews
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-muted">
        Tasters share notes on bars from the catalogue. Editorial ratings on each
        chocolate stay separate from this community average.
      </p>

      {!isSupabaseConfigured() ? (
        <p className="mt-8 rounded-xl border border-border bg-bg-elevated/60 px-4 py-5 text-sm text-text-muted">
          Reviews need Supabase. Configure{" "}
          <code className="text-brass">SUPABASE_URL</code> and run the accounts
          migration.
        </p>
      ) : (
        <div className="mt-10">
          <ReviewList
            reviews={reviews}
            currentUserId={session.user?.id}
            showChocolateLink
          />
        </div>
      )}

      <p className="mt-10 text-sm text-text-muted">
        <Link href="/explore" className="text-brass hover:underline">
          Explore chocolates
        </Link>{" "}
        to leave your own note.
      </p>
    </main>
  );
}
