import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";
import {
  chocolateSchema,
  siteSettingsSchema,
  type Chocolate,
  type SiteSettings,
} from "./schemas";

const reader = createReader(process.cwd(), keystaticConfig);

export async function getSiteSettings(): Promise<SiteSettings> {
  const raw = await reader.singletons.siteSettings.read();
  if (!raw) {
    throw new Error("Missing site settings (content/site-settings/index.json)");
  }
  return siteSettingsSchema.parse(raw);
}

export async function getChocolates(): Promise<Chocolate[]> {
  const entries = await reader.collections.chocolates.all();
  const chocolates = entries.map(({ slug, entry }) =>
    chocolateSchema.parse({ ...entry, slug: entry.slug || slug })
  );

  return chocolates
    .filter((item) => item.status === "published")
    .sort((a, b) => {
      const rankA = a.recentRank ?? Number.MAX_SAFE_INTEGER;
      const rankB = b.recentRank ?? Number.MAX_SAFE_INTEGER;
      if (rankA !== rankB) return rankA - rankB;
      return a.title.localeCompare(b.title);
    });
}

export async function getChocolateBySlug(
  slug: string
): Promise<Chocolate | undefined> {
  const raw = await reader.collections.chocolates.read(slug);
  if (!raw) return undefined;
  const chocolate = chocolateSchema.parse({ ...raw, slug: raw.slug || slug });
  return chocolate.status === "published" ? chocolate : undefined;
}

export async function getRecentDiscoveries(limit = 5): Promise<Chocolate[]> {
  const chocolates = await getChocolates();
  return chocolates
    .filter((item) => item.recentRank != null)
    .sort((a, b) => (a.recentRank ?? 0) - (b.recentRank ?? 0))
    .slice(0, limit);
}

export async function getRelatedChocolates(
  chocolate: Chocolate,
  limit = 4
): Promise<Chocolate[]> {
  const chocolates = await getChocolates();
  return chocolates
    .filter((item) => item.slug !== chocolate.slug)
    .map((item) => ({
      item,
      score:
        item.tags.filter((tag) => chocolate.tags.includes(tag)).length +
        (item.originCode === chocolate.originCode ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

export type ExploreFilters = {
  q?: string;
  tag?: string;
  country?: string;
  sort?: "recent" | "rating" | "price";
};

export async function exploreChocolates(
  filters: ExploreFilters
): Promise<Chocolate[]> {
  let results = await getChocolates();
  const q = filters.q?.trim().toLowerCase();

  if (q) {
    results = results.filter((item) => {
      const haystack = [
        item.title,
        item.brand,
        item.shortDescription,
        item.originCountry,
        ...item.tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  if (filters.tag) {
    const tag = filters.tag.toLowerCase();
    results = results.filter((item) =>
      item.tags.some((value) => value.toLowerCase() === tag)
    );
  }

  if (filters.country) {
    const country = filters.country.toLowerCase();
    results = results.filter(
      (item) =>
        item.originCode.toLowerCase() === country ||
        item.originCountry.toLowerCase() === country
    );
  }

  switch (filters.sort) {
    case "rating":
      results = [...results].sort((a, b) => b.rating - a.rating);
      break;
    case "price":
      results = [...results].sort((a, b) => a.price - b.price);
      break;
    case "recent":
    default:
      results = [...results].sort((a, b) => {
        const rankA = a.recentRank ?? Number.MAX_SAFE_INTEGER;
        const rankB = b.recentRank ?? Number.MAX_SAFE_INTEGER;
        return rankA - rankB;
      });
  }

  return results;
}
