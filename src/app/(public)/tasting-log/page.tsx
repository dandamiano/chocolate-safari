import Link from "next/link";
import { Bookmark, Star } from "lucide-react";
import { SoftImage } from "@/components/ui/soft-image";
import { TastingNoteForm } from "@/components/tasting-log/tasting-note-form";
import { getPublicSession } from "@/lib/auth/session";
import { getTastingLogEntries } from "@/lib/tasting-log/queries";
import { formatPrice } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase-env";

export const metadata = { title: "Tasting log" };

export default async function TastingLogPage() {
  const session = await getPublicSession();

  if (!session.user) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <p className="section-label">Your collection</p>
        <h1 className="mt-2 font-display text-3xl text-text-on-dark">
          Tasting log
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          Sign in to sync bookmarks and private notes. Guests can still bookmark
          bars locally on this device.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login?next=/tasting-log"
            className="inline-flex h-11 items-center rounded-xl bg-brass px-5 text-sm font-semibold text-bg-base transition hover:bg-brass-hover"
          >
            Sign in
          </Link>
          <Link
            href="/signup?next=/tasting-log"
            className="inline-flex h-11 items-center rounded-xl border border-brass px-5 text-sm font-semibold text-brass transition hover:bg-brass/10"
          >
            Create account
          </Link>
        </div>
        {!isSupabaseConfigured() ? (
          <p className="mt-6 text-xs text-text-muted">
            Supabase isn’t configured in this environment yet.
          </p>
        ) : null}
      </main>
    );
  }

  const entries = await getTastingLogEntries(session.user.id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-label">Your collection</p>
          <h1 className="mt-2 font-display text-3xl text-text-on-dark sm:text-4xl">
            Tasting log
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            {session.email} · {entries.length}{" "}
            {entries.length === 1 ? "chocolate" : "chocolates"} saved
          </p>
        </div>
        <Link
          href="/explore"
          className="text-sm text-brass transition hover:underline"
        >
          Explore more →
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-border bg-bg-elevated/60 px-6 py-12 text-center">
          <Bookmark className="mx-auto size-8 text-brass" />
          <p className="mt-4 text-sm text-text-muted">
            No bookmarks yet. Tap the bookmark on any bar to start your log.
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-flex h-10 items-center rounded-xl bg-brass px-4 text-sm font-semibold text-bg-base hover:bg-brass-hover"
          >
            Browse chocolates
          </Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {entries.map((entry) => (
            <li
              key={entry.slug}
              className="rounded-2xl border border-border bg-bg-elevated p-4 sm:p-5"
            >
              <div className="flex gap-4">
                <Link
                  href={`/chocolates/${entry.slug}`}
                  className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-tag sm:size-24"
                >
                  {entry.chocolate ? (
                    <SoftImage
                      src={entry.chocolate.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : null}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/chocolates/${entry.slug}`}
                    className="font-display text-xl text-text-on-dark transition hover:text-brass"
                  >
                    {entry.chocolate?.title ?? entry.slug}
                  </Link>
                  {entry.chocolate ? (
                    <p className="mt-1 text-sm text-text-muted">
                      {entry.chocolate.brand}
                      {entry.chocolate.price != null
                        ? ` · ${formatPrice(entry.chocolate.price, entry.chocolate.currency)}`
                        : null}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-text-muted">
                      Chocolate unavailable or unpublished.
                    </p>
                  )}
                  {entry.noteRating != null ? (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-brass">
                      <Star className="size-3 fill-current" />
                      Your note: {entry.noteRating}/5
                    </p>
                  ) : null}
                  {entry.note ? (
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">
                      {entry.note}
                    </p>
                  ) : null}
                  <TastingNoteForm
                    slug={entry.slug}
                    initialNote={entry.note ?? ""}
                    initialRating={entry.noteRating}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
