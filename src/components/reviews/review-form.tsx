"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { adminInputClass, adminTextareaClass, Field } from "@/components/admin/field";
import {
  submitReviewAction,
  type ReviewActionState,
} from "@/lib/reviews/actions";

const initialState: ReviewActionState | null = null;

export function ReviewForm({
  slug,
  initialRating = 5,
  initialBody = "",
}: {
  slug: string;
  initialRating?: number;
  initialBody?: string;
}) {
  const [state, action, pending] = useActionState(
    submitReviewAction,
    initialState
  );

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-border bg-bg-elevated/50 p-4 sm:p-5">
      <input type="hidden" name="slug" value={slug} />
      <h3 className="font-display text-lg text-text-on-dark">
        {initialBody ? "Update your review" : "Leave a review"}
      </h3>
      <Field label="Rating">
        <select
          name="rating"
          defaultValue={initialRating}
          className={adminInputClass}
          required
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} / 5
            </option>
          ))}
        </select>
      </Field>
      <Field label="Tasting notes">
        <textarea
          name="body"
          required
          minLength={8}
          rows={4}
          defaultValue={initialBody}
          placeholder="How did it melt? What lingered?"
          className={adminTextareaClass}
        />
      </Field>
      {state?.message ? (
        <p
          className={`text-sm ${state.ok ? "text-brass" : "text-red-400"}`}
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        className="h-10 bg-brass text-bg-base hover:bg-brass-hover"
      >
        {pending ? "Publishing…" : "Publish review"}
      </Button>
    </form>
  );
}
