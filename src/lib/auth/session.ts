import type { User } from "@supabase/supabase-js";
import { getSessionUser } from "@/lib/admin/auth";
import { isSupabaseConfigured } from "@/lib/supabase-env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PublicSession = {
  user: User | null;
  email: string | null;
  bookmarkCount: number;
};

/** Public-site session helper (same cookie session as admin Auth). */
export async function getPublicSession(): Promise<PublicSession> {
  if (!isSupabaseConfigured()) {
    return { user: null, email: null, bookmarkCount: 0 };
  }

  const user = await getSessionUser();
  if (!user) {
    return { user: null, email: null, bookmarkCount: 0 };
  }

  let bookmarkCount = 0;
  try {
    const supabase = await createServerSupabaseClient();
    const { count } = await supabase
      .from("bookmarks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    bookmarkCount = count ?? 0;
  } catch {
    bookmarkCount = 0;
  }

  return {
    user,
    email: user.email ?? null,
    bookmarkCount,
  };
}
