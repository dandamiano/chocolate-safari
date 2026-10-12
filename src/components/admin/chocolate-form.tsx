"use client";

import { useActionState, useState } from "react";
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
import { FormSection } from "@/components/admin/form-section";
import {
  GalleryImageField,
  PrimaryImageField,
} from "@/components/admin/image-uploader";
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
    image: "",
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

  const [slug, setSlug] = useState(defaults.slug ?? "");
  const [image, setImage] = useState(defaults.image ?? "");
  const [gallery, setGallery] = useState<string[]>(defaults.gallery ?? []);
  const [showAdvancedPaths, setShowAdvancedPaths] = useState(false);

  const fieldError = (key: string) => state.fieldErrors?.[key]?.[0];

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-6">
        <input
          type="hidden"
          name="originalSlug"
          value={chocolate?.slug ?? ""}
        />

        <FormSection
          title="Basics"
          description="Identity and copy shown on the catalogue and detail page."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Slug"
              error={fieldError("slug")}
              hint="URL key · must be unique"
            >
              <input
                name="slug"
                required
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                className={adminInputClass}
                placeholder="e.g. lunch-bar"
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
            <Field label="Title" error={fieldError("title")} className="sm:col-span-2">
              <input
                name="title"
                required
                defaultValue={defaults.title}
                className={adminInputClass}
              />
            </Field>
          </div>
          <Field
            label="Short description"
            error={fieldError("shortDescription")}
            hint="One or two lines for cards"
          >
            <textarea
              name="shortDescription"
              required
              rows={2}
              defaultValue={defaults.shortDescription}
              className={adminTextareaClass}
            />
          </Field>
          <Field
            label="Description"
            error={fieldError("description")}
            hint="Full tasting notes for the detail page"
          >
            <textarea
              name="description"
              required
              rows={6}
              defaultValue={defaults.description}
              className={adminTextareaClass}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Media"
          description="Upload to Supabase Storage, or paste a path under Advanced."
        >
          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-brass">
              Primary image
            </span>
            <PrimaryImageField
              name="image"
              value={image}
              onChange={setImage}
              slugHint={slug}
              error={fieldError("image")}
              required
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-brass">
              Gallery
            </span>
            <GalleryImageField
              name="gallery"
              value={gallery}
              onChange={setGallery}
              slugHint={slug}
              error={fieldError("gallery")}
            />
          </div>
          <details
            className="rounded-lg border border-border/70 bg-bg-base/30"
            open={showAdvancedPaths}
            onToggle={(event) =>
              setShowAdvancedPaths((event.target as HTMLDetailsElement).open)
            }
          >
            <summary className="cursor-pointer px-4 py-3 text-sm text-text-muted hover:text-text-on-dark">
              Advanced · manual paths / URLs
            </summary>
            <div className="grid gap-4 border-t border-border/60 px-4 py-4 sm:grid-cols-2">
              <Field
                label="Primary path or URL"
                hint="Overrides upload when edited here"
              >
                <input
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                  className={adminInputClass}
                  placeholder="/images/chocolates/… or https://…"
                />
              </Field>
              <Field
                label="Gallery paths"
                hint="One path or URL per line"
              >
                <textarea
                  value={gallery.join("\n")}
                  onChange={(event) =>
                    setGallery(
                      event.target.value
                        .split(/[\n,]/)
                        .map((part) => part.trim())
                        .filter(Boolean)
                    )
                  }
                  className={adminTextareaClass}
                  placeholder="/images/…&#10;https://…"
                />
              </Field>
            </div>
          </details>
        </FormSection>

        <FormSection
          title="Origin"
          description="Where the bar or cacao comes from."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Country" error={fieldError("originCountry")}>
              <input
                name="originCountry"
                defaultValue={defaults.originCountry}
                className={adminInputClass}
                placeholder="Malawi"
              />
            </Field>
            <Field label="Country code" error={fieldError("originCode")}>
              <input
                name="originCode"
                defaultValue={defaults.originCode}
                className={adminInputClass}
                placeholder="MW"
              />
            </Field>
            <Field label="Flag emoji" error={fieldError("originFlagEmoji")}>
              <input
                name="originFlagEmoji"
                defaultValue={defaults.originFlagEmoji}
                className={adminInputClass}
                placeholder="🇲🇼"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Flavor / tags"
          description="Filter chips on Explore and product cards."
        >
          <Field
            label="Tags"
            hint="Comma or newline separated · e.g. dark, fruity, single-origin"
            error={fieldError("tags")}
          >
            <textarea
              name="tags"
              defaultValue={(defaults.tags ?? []).join(", ")}
              className={adminTextareaClass}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Pricing / status"
          description="Commerce fields and publish state."
        >
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </FormSection>

        {state.message && !state.ok ? (
          <p
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
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
