import type { Chocolate } from "@/lib/schemas";
import { getChocolateBySlug } from "@/lib/content";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type TastingLogEntry = {
  slug: string;
  bookmarkedAt: string;
  chocolate: Chocolate | null;
  note: string | null;
  noteRating: number | null;
};

export async function getTastingLogEntries(
  userId: string
): Promise<TastingLogEntry[]> {
  const supabase = await createServerSupabaseClient();

  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select("chocolate_slug, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[tasting-log] bookmarks failed:", error.message);
    return [];
  }

  const rows = bookmarks ?? [];
  if (rows.length === 0) return [];

  const slugs = rows.map((row) => row.chocolate_slug as string);
  const { data: notes } = await supabase
    .from("tasting_notes")
    .select("chocolate_slug, note, rating")
    .eq("user_id", userId)
    .in("chocolate_slug", slugs);

  const noteBySlug = new Map(
    (notes ?? []).map((row) => [
      row.chocolate_slug as string,
      {
        note: (row.note as string) || null,
        rating: (row.rating as number | null) ?? null,
      },
    ])
  );

  const entries: TastingLogEntry[] = [];
  for (const row of rows) {
    const slug = row.chocolate_slug as string;
    const chocolate = (await getChocolateBySlug(slug)) ?? null;
    const note = noteBySlug.get(slug);
    entries.push({
      slug,
      bookmarkedAt: row.created_at as string,
      chocolate,
      note: note?.note ?? null,
      noteRating: note?.rating ?? null,
    });
  }

  return entries;
}
