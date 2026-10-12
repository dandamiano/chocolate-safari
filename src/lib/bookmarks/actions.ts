"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/admin/auth";
import { isSupabaseConfigured } from "@/lib/supabase-env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type BookmarkStateResult = {
  signedIn: boolean;
  slugs: string[];
  count: number;
};

export type ToggleBookmarkResult = {
  ok: boolean;
  saved?: boolean;
  needsAuth?: boolean;
  count?: number;
  message?: string;
};

export async function getBookmarkStateAction(): Promise<BookmarkStateResult> {
  if (!isSupabaseConfigured()) {
    return { signedIn: false, slugs: [], count: 0 };
  }

  try {
    const user = await getSessionUser();
    if (!user) {
      return { signedIn: false, slugs: [], count: 0 };
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("bookmarks")
      .select("chocolate_slug")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[bookmarks] list failed:", error.message);
      return { signedIn: true, slugs: [], count: 0 };
    }

    const slugs = (data ?? []).map((row) => row.chocolate_slug as string);
    return { signedIn: true, slugs, count: slugs.length };
  } catch {
    return { signedIn: false, slugs: [], count: 0 };
  }
}

export async function toggleBookmarkAction(
  slug: string
): Promise<ToggleBookmarkResult> {
  const clean = slug.trim();
  if (!clean) {
    return { ok: false, message: "Missing chocolate." };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, needsAuth: true };
  }

  try {
    const user = await getSessionUser();
    if (!user) {
      return { ok: false, needsAuth: true };
    }

    const supabase = await createServerSupabaseClient();
    const { data: existing } = await supabase
      .from("bookmarks")
      .select("chocolate_slug")
      .eq("user_id", user.id)
      .eq("chocolate_slug", clean)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("chocolate_slug", clean);
      if (error) {
        return { ok: false, message: error.message };
      }
    } else {
      const { error } = await supabase.from("bookmarks").insert({
        user_id: user.id,
        chocolate_slug: clean,
      });
      if (error) {
        return { ok: false, message: error.message };
      }
    }

    const { count } = await supabase
      .from("bookmarks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    revalidatePath("/tasting-log");
    revalidatePath(`/chocolates/${clean}`);

    return {
      ok: true,
      saved: !existing,
      count: count ?? 0,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Bookmark failed.",
    };
  }
}
