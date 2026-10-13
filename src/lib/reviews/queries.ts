import { getSupabaseAnon, isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ReviewRow = {
  id: string;
  user_id: string;
  chocolate_slug: string;
  rating: number;
  body: string;
  created_at: string;
  status: string;
};

export type ReviewWithMeta = ReviewRow & {
  authorLabel: string;
  chocolateTitle?: string;
};

function authorLabel(userId: string): string {
  return `Taster ${userId.slice(0, 6)}`;
}

export async function getReviewsForChocolate(
  slug: string
): Promise<{ reviews: ReviewWithMeta[]; communityAvg: number | null; count: number }> {
  if (!isSupabaseConfigured()) {
    return { reviews: [], communityAvg: null, count: 0 };
  }

  const supabase = getSupabaseAnon();
  if (!supabase) {
    return { reviews: [], communityAvg: null, count: 0 };
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("id, user_id, chocolate_slug, rating, body, created_at, status")
    .eq("chocolate_slug", slug)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[reviews] list failed:", error.message);
    return { reviews: [], communityAvg: null, count: 0 };
  }

  const rows = (data ?? []) as ReviewRow[];
  const count = rows.length;
  const communityAvg =
    count > 0
      ? Math.round((rows.reduce((sum, row) => sum + row.rating, 0) / count) * 10) /
        10
      : null;

  return {
    reviews: rows.map((row) => ({
      ...row,
      authorLabel: authorLabel(row.user_id),
    })),
    communityAvg,
    count,
  };
}

export async function getRecentReviews(limit = 24): Promise<ReviewWithMeta[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabaseAnon();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("id, user_id, chocolate_slug, rating, body, created_at, status")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[reviews] recent failed:", error.message);
    return [];
  }

  const rows = (data ?? []) as ReviewRow[];
  const slugs = [...new Set(rows.map((row) => row.chocolate_slug))];
  const titles = new Map<string, string>();

  if (slugs.length > 0) {
    const { data: chocolates } = await supabase
      .from("chocolates")
      .select("slug, title")
      .in("slug", slugs);
    for (const row of chocolates ?? []) {
      titles.set(row.slug as string, row.title as string);
    }
  }

  return rows.map((row) => ({
    ...row,
    authorLabel: authorLabel(row.user_id),
    chocolateTitle: titles.get(row.chocolate_slug),
  }));
}

export async function getMyReviewForChocolate(
  slug: string,
  userId: string
): Promise<ReviewRow | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, user_id, chocolate_slug, rating, body, created_at, status")
      .eq("chocolate_slug", slug)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as ReviewRow;
  } catch {
    return null;
  }
}
