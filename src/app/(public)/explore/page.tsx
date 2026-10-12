import { Suspense } from "react";
import Link from "next/link";
import { ChocolateCard } from "@/components/chocolates/chocolate-card";
import { ExploreFilters } from "@/components/explore/explore-filters";
import { exploreChocolates, getChocolates } from "@/lib/content";

export const metadata = {
  title: "Explore",
};

async function ExploreResults({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    country?: string;
    sort?: "recent" | "rating" | "price";
  }>;
}) {
  const params = await searchParams;
  const [results, all] = await Promise.all([
    exploreChocolates({
      q: params.q,
      tag: params.tag,
      country: params.country,
      sort: params.sort,
    }),
    getChocolates(),
  ]);

  const tags = Array.from(new Set(all.flatMap((item) => item.tags))).sort();
  const countries = Array.from(
    new Map(
      all.map((item) => [
        item.originCode,
        { code: item.originCode, name: item.originCountry },
      ])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <ExploreFilters tags={tags} countries={countries} />

      {results.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <p className="font-display text-2xl text-text-on-dark">
            No chocolates match
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
            Try clearing filters or browse the full catalogue for something new
            to taste.
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-brass px-5 text-sm font-semibold text-bg-base hover:bg-brass-hover"
          >
            Reset filters
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-text-muted">
            {results.length} chocolate{results.length === 1 ? "" : "s"}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((chocolate) => (
              <ChocolateCard key={chocolate.slug} chocolate={chocolate} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    country?: string;
    sort?: "recent" | "rating" | "price";
  }>;
}) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="section-label">Catalogue</p>
        <h1 className="mt-2 font-display text-4xl text-text-on-dark">
          Explore chocolates
        </h1>
        <p className="mt-3 text-sm text-text-muted sm:text-base">
          Filter by flavor, origin, or search the tasting catalogue.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-28 animate-pulse rounded-2xl bg-bg-elevated" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-2xl bg-bg-elevated"
                />
              ))}
            </div>
          </div>
        }
      >
        <ExploreResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
