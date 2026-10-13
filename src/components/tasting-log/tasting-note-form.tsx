"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { adminInputClass, adminTextareaClass, Field } from "@/components/admin/field";
import {
  saveTastingNoteAction,
  type NoteActionState,
} from "@/lib/tasting-log/actions";

const initialState: NoteActionState | null = null;

export function TastingNoteForm({
  slug,
  initialNote = "",
  initialRating = "",
}: {
  slug: string;
  initialNote?: string;
  initialRating?: number | null | "";
}) {
  const [state, action, pending] = useActionState(
    saveTastingNoteAction,
    initialState
  );

  return (
    <form action={action} className="mt-3 space-y-3 border-t border-border/60 pt-3">
      <input type="hidden" name="slug" value={slug} />
      <Field label="Private note">
        <textarea
          name="note"
          defaultValue={initialNote}
          rows={2}
          placeholder="Texture, melt, aftertaste…"
          className={adminTextareaClass}
        />
      </Field>
      <Field label="Your rating (optional)">
        <input
          name="rating"
          type="number"
          min={1}
          max={5}
          defaultValue={initialRating ?? ""}
          placeholder="1–5"
          className={adminInputClass}
        />
      </Field>
      {state?.message ? (
        <p
          className={`text-xs ${state.ok ? "text-brass" : "text-red-400"}`}
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        variant="ghost"
        className="h-9 text-brass hover:bg-brass/10"
      >
        {pending ? "Saving…" : "Save note"}
      </Button>
    </form>
  );
}
