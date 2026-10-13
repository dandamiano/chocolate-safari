"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/admin/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type NoteActionState = {
  ok: boolean;
  message?: string;
};

export async function saveTastingNoteAction(
  _prev: NoteActionState | null,
  formData: FormData
): Promise<NoteActionState> {
  const slug = String(formData.get("slug") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const ratingRaw = String(formData.get("rating") ?? "").trim();
  const rating = ratingRaw ? Number(ratingRaw) : null;

  if (!slug) return { ok: false, message: "Missing chocolate." };
  if (rating != null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return { ok: false, message: "Rating must be 1–5." };
  }

  try {
    const user = await getSessionUser();
    if (!user) return { ok: false, message: "Sign in required." };

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("tasting_notes").upsert(
      {
        user_id: user.id,
        chocolate_slug: slug,
        note,
        rating,
      },
      { onConflict: "user_id,chocolate_slug" }
    );

    if (error) return { ok: false, message: error.message };

    revalidatePath("/tasting-log");
    return { ok: true, message: "Note saved." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not save note.",
    };
  }
}
