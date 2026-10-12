"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/admin/auth";
import { isSupabaseConfigured } from "@/lib/supabase-env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ReviewActionState = {
  ok: boolean;
  message?: string;
};

export async function submitReviewAction(
  _prev: ReviewActionState | null,
  formData: FormData
): Promise<ReviewActionState> {
  const slug = String(formData.get("slug") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);

  if (!slug) return { ok: false, message: "Missing chocolate." };
  if (!body || body.length < 8) {
    return { ok: false, message: "Write a short tasting note (at least 8 characters)." };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, message: "Pick a rating from 1 to 5." };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Reviews need Supabase to be configured." };
  }

  try {
    const user = await getSessionUser();
    if (!user) {
      return { ok: false, message: "Sign in to leave a review." };
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("reviews").upsert(
      {
        user_id: user.id,
        chocolate_slug: slug,
        rating,
        body,
        status: "published",
      },
      { onConflict: "user_id,chocolate_slug" }
    );

    if (error) {
      return { ok: false, message: error.message };
    }

    revalidatePath(`/chocolates/${slug}`);
    revalidatePath("/reviews");
    return { ok: true, message: "Review published." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not save review.",
    };
  }
}

export async function deleteReviewAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!id) return;

  const user = await getSessionUser();
  if (!user) return;

  const supabase = await createServerSupabaseClient();
  await supabase.from("reviews").delete().eq("id", id).eq("user_id", user.id);

  if (slug) revalidatePath(`/chocolates/${slug}`);
  revalidatePath("/reviews");
}
