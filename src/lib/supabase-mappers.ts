import {
  chocolateSchema,
  siteSettingsSchema,
  type Chocolate,
  type SiteSettings,
} from "./schemas";

/** Row shape from public.chocolates */
export type ChocolateRow = {
  slug: string;
  title: string;
  brand: string;
  short_description: string;
  description: string;
  image: string;
  gallery: string[] | null;
  origin_country: string;
  origin_code: string;
  origin_flag_emoji: string;
  tags: string[] | null;
  rating: number | string;
  price: number | string;
  currency: string;
  featured: boolean;
  recent_rank: number | null;
  published_at: string;
  status: string;
};

export function chocolateFromRow(row: ChocolateRow): Chocolate {
  return chocolateSchema.parse({
    slug: row.slug,
    title: row.title,
    brand: row.brand,
    shortDescription: row.short_description,
    description: row.description,
    image: row.image,
    gallery: row.gallery ?? [],
    originCountry: row.origin_country,
    originCode: row.origin_code,
    originFlagEmoji: row.origin_flag_emoji,
    tags: row.tags ?? [],
    rating: Number(row.rating),
    price: Number(row.price),
    currency: row.currency,
    featured: row.featured,
    recentRank: row.recent_rank ?? undefined,
    publishedAt: row.published_at,
    status: row.status,
  });
}

export function chocolateToRow(chocolate: Chocolate): ChocolateRow {
  return {
    slug: chocolate.slug,
    title: chocolate.title,
    brand: chocolate.brand,
    short_description: chocolate.shortDescription,
    description: chocolate.description,
    image: chocolate.image,
    gallery: chocolate.gallery ?? [],
    origin_country: chocolate.originCountry,
    origin_code: chocolate.originCode,
    origin_flag_emoji: chocolate.originFlagEmoji,
    tags: chocolate.tags,
    rating: chocolate.rating,
    price: chocolate.price,
    currency: chocolate.currency,
    featured: chocolate.featured,
    recent_rank: chocolate.recentRank ?? null,
    published_at: chocolate.publishedAt,
    status: chocolate.status,
  };
}

export function siteSettingsFromDocument(document: unknown): SiteSettings {
  return siteSettingsSchema.parse(document);
}
