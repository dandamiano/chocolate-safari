"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  archiveChocolateAction,
  deleteChocolateAction,
  saveChocolateAction,
  type ActionState,
} from "@/lib/admin/actions";
import type { Chocolate } from "@/lib/schemas";
import {
  adminInputClass,
  adminTextareaClass,
  Field,
} from "@/components/admin/field";
import { cn } from "cn";

const initial: ActionState = { ok: false };

function toDatetimeLocal(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 16);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ChocolateForm({
  chocolate,
  mode,
}: {
  chocolate?: Chocolate | null;
  mode: "create" | "edit";
}) {
  const [state, formAction, pending] = useActionState(
    saveChocolateAction,
    initial
  );

  const defaults: Partial<Chocolate> = chocolate ?? {
    slug: "",
    title: "",
    brand: "",
    shortDescription: "",
    description: "",
    image: "/images/chocolates/",
    gallery: [],
    originCountry: "",
    originCode: "",
    originFlagEmoji: "",
    tags: [],
    rating: 4,
    price: 0,
    currency: "USD",
    featured: false,
    publishedAt: new Date().toISOString(),
    status: "draft",
  };

  const fieldError = (key: string) => state.fieldErrors?.[key]?.[0];

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-5">
        <input
          type="hidden"
          name="originalSlug"
          value={chocolate?.slug ?? ""}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug" error={fieldError("slug")} hint="URL key, unique">
            <input
              name="slug"
              required
              defaultValue={defaults.slug}
              className={adminInputClass}
            />
          </Field>
          <Field label="Status" error={fieldError("status")}>
            <select
              name="status"
              defaultValue={defaults.status ?? "draft"}
              className={adminInputClass}
            >
              <option value="published">published</option>
              <option value="draft">draft</option>
            </select>
          </Field>
          <Field label="Title" error={fieldError("title")}>
            <input
              name="title"
              required
              defaultValue={defaults.title}
              className={adminInputClass}
            />
          </Field>
          <Field label="Brand" error={fieldError("brand")}>
            <input
              name="brand"
              required
              defaultValue={defaults.brand}
              className={adminInputClass}
            />
          </Field>
        </div>

        <Field
          label="Short description"
          error={fieldError("shortDescription")}
        >
          <textarea
            name="shortDescription"
            required
            defaultValue={defaults.shortDescription}
            className={adminTextareaClass}
          />
        </Field>
        <Field label="Description" error={fieldError("description")}>
          <textarea
            name="description"
            required
            rows={6}
            defaultValue={defaults.description}
            className={adminTextareaClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Image path" error={fieldError("image")}>
            <input
              name="image"
              required
              defaultValue={defaults.image}
              className={adminInputClass}
            />
          </Field>
          <Field
            label="Gallery"
            hint="Comma or newline separated paths"
            error={fieldError("gallery")}
          >
            <textarea
              name="gallery"
              defaultValue={(defaults.gallery ?? []).join("\n")}
              className={adminTextareaClass}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Origin country" error={fieldError("originCountry")}>
            <input
              name="originCountry"
              defaultValue={defaults.originCountry}
              className={adminInputClass}
            />
          </Field>
          <Field label="Origin code" error={fieldError("originCode")}>
            <input
              name="originCode"
              defaultValue={defaults.originCode}
              className={adminInputClass}
            />
          </Field>
          <Field label="Flag emoji" error={fieldError("originFlagEmoji")}>
            <input
              name="originFlagEmoji"
              defaultValue={defaults.originFlagEmoji}
              className={adminInputClass}
            />
          </Field>
        </div>

        <Field
          label="Tags"
          hint="Comma or newline separated"
          error={fieldError("tags")}
        >
          <textarea
            name="tags"
            defaultValue={(defaults.tags ?? []).join(", ")}
            className={adminTextareaClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Rating (0–5)" error={fieldError("rating")}>
            <input
              name="rating"
              type="number"
              step="0.01"
              min="0"
              max="5"
              required
              defaultValue={defaults.rating}
              className={adminInputClass}
            />
          </Field>
          <Field label="Price" error={fieldError("price")}>
            <input
              name="price"
              type="number"
              step="0.01"
              required
              defaultValue={defaults.price}
              className={adminInputClass}
            />
          </Field>
          <Field label="Currency" error={fieldError("currency")}>
            <input
              name="currency"
              defaultValue={defaults.currency ?? "USD"}
              className={adminInputClass}
            />
          </Field>
          <Field label="Recent rank" error={fieldError("recentRank")}>
            <input
              name="recentRank"
              type="number"
              defaultValue={defaults.recentRank ?? ""}
              className={adminInputClass}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Published at" error={fieldError("publishedAt")}>
            <input
              name="publishedAt"
              type="datetime-local"
              required
              defaultValue={toDatetimeLocal(defaults.publishedAt ?? "")}
              className={adminInputClass}
            />
          </Field>
          <Field label="Featured">
            <label className="flex h-10 items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={Boolean(defaults.featured)}
                className="size-4 accent-[var(--accent-brass)]"
              />
              Show as featured
            </label>
          </Field>
        </div>

        {state.message && !state.ok ? (
          <p className="text-sm text-red-400" role="alert">
            {state.message}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : mode === "create" ? "Create" : "Save"}
          </Button>
          <Link
            href="/admin/chocolates"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
        </div>
      </form>

      {mode === "edit" && chocolate ? (
        <div className="flex flex-wrap gap-3 border-t border-border pt-6">
          <form action={archiveChocolateAction}>
            <input type="hidden" name="slug" value={chocolate.slug} />
            <Button type="submit" variant="secondary">
              Archive (draft)
            </Button>
          </form>
          <form action={deleteChocolateAction}>
            <input type="hidden" name="slug" value={chocolate.slug} />
            <Button type="submit" variant="destructive">
              Delete permanently
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
