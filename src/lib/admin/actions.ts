"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminForAction } from "@/lib/admin/auth";
import {
  archiveAdminChocolate,
  deleteAdminChocolate,
  saveAdminSiteSettings,
  upsertAdminChocolate,
} from "@/lib/admin/content";
import { chocolateSchema, siteSettingsSchema } from "@/lib/schemas";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function csvToList(value: FormDataEntryValue | null): string[] {
  const text = String(value ?? "").trim();
  if (!text) return [];
  return text
    .split(/[\n,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseOptionalNumber(value: FormDataEntryValue | null): number | undefined {
  const text = String(value ?? "").trim();
  if (!text) return undefined;
  const num = Number(text);
  return Number.isFinite(num) ? num : undefined;
}

function parseBoolean(value: FormDataEntryValue | null): boolean {
  if (value == null) return false;
  const text = String(value).toLowerCase();
  return text === "on" || text === "true" || text === "1";
}

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function saveChocolateAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdminForAction();
  } catch {
    return { ok: false, message: "Not authorized" };
  }

  const originalSlug = String(formData.get("originalSlug") ?? "").trim();
  const recentRank = parseOptionalNumber(formData.get("recentRank"));

  const raw = {
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    brand: String(formData.get("brand") ?? "").trim(),
    shortDescription: String(formData.get("shortDescription") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    image: String(formData.get("image") ?? "").trim(),
    gallery: csvToList(formData.get("gallery")),
    originCountry: String(formData.get("originCountry") ?? "").trim(),
    originCode: String(formData.get("originCode") ?? "").trim(),
    originFlagEmoji: String(formData.get("originFlagEmoji") ?? "").trim(),
    tags: csvToList(formData.get("tags")),
    rating: Number(formData.get("rating") ?? 0),
    price: Number(formData.get("price") ?? 0),
    currency: String(formData.get("currency") ?? "USD").trim() || "USD",
    featured: parseBoolean(formData.get("featured")),
    recentRank,
    publishedAt: (() => {
      const rawPublished = String(formData.get("publishedAt") ?? "").trim();
      if (!rawPublished) return "";
      const asDate = new Date(rawPublished);
      return Number.isNaN(asDate.getTime())
        ? rawPublished
        : asDate.toISOString();
    })(),
    status: String(formData.get("status") ?? "draft"),
  };

  const parsed = chocolateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    if (originalSlug && originalSlug !== parsed.data.slug) {
      await deleteAdminChocolate(originalSlug);
    }
    await upsertAdminChocolate(parsed.data);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Save failed",
    };
  }

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath(`/chocolates/${parsed.data.slug}`);
  revalidatePath("/admin/chocolates");
  redirect(`/admin/chocolates/${parsed.data.slug}?saved=1`);
}

export async function archiveChocolateAction(
  formData: FormData
): Promise<void> {
  await requireAdminForAction();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) throw new Error("Missing slug");
  await archiveAdminChocolate(slug);
  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath(`/chocolates/${slug}`);
  revalidatePath("/admin/chocolates");
  redirect(`/admin/chocolates/${slug}?saved=1`);
}

export async function deleteChocolateAction(formData: FormData): Promise<void> {
  await requireAdminForAction();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) throw new Error("Missing slug");
  await deleteAdminChocolate(slug);
  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/admin/chocolates");
  redirect("/admin/chocolates");
}

function parseJsonField<T>(
  label: string,
  value: FormDataEntryValue | null,
  fallback: T
): { ok: true; value: T } | { ok: false; message: string } {
  const text = String(value ?? "").trim();
  if (!text) return { ok: true, value: fallback };
  try {
    return { ok: true, value: JSON.parse(text) as T };
  } catch {
    return { ok: false, message: `${label} must be valid JSON` };
  }
}

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdminForAction();
  } catch {
    return { ok: false, message: "Not authorized" };
  }

  const stats = parseJsonField("Stats", formData.get("statsJson"), []);
  if (!stats.ok) return { ok: false, message: stats.message };

  const navLinks = parseJsonField("Nav links", formData.get("navLinksJson"), []);
  if (!navLinks.ok) return { ok: false, message: navLinks.message };

  const valueProps = parseJsonField(
    "Value props",
    formData.get("valuePropsJson"),
    []
  );
  if (!valueProps.ok) return { ok: false, message: valueProps.message };

  const upcomingFeatures = parseJsonField(
    "Upcoming features",
    formData.get("upcomingFeaturesJson"),
    []
  );
  if (!upcomingFeatures.ok) {
    return { ok: false, message: upcomingFeatures.message };
  }

  const footerColumns = parseJsonField(
    "Footer columns",
    formData.get("footerColumnsJson"),
    []
  );
  if (!footerColumns.ok) return { ok: false, message: footerColumns.message };

  const socialLinks = parseJsonField(
    "Social links",
    formData.get("socialLinksJson"),
    []
  );
  if (!socialLinks.ok) return { ok: false, message: socialLinks.message };

  const cannedReplies = parseJsonField(
    "Canned replies",
    formData.get("cannedRepliesJson"),
    []
  );
  if (!cannedReplies.ok) return { ok: false, message: cannedReplies.message };

  const raw = {
    siteName: String(formData.get("siteName") ?? "").trim(),
    heroHeadline: {
      discover: String(formData.get("heroDiscover") ?? "").trim(),
      taste: String(formData.get("heroTaste") ?? "").trim(),
      remember: String(formData.get("heroRemember") ?? "").trim(),
    },
    heroSubcopy: String(formData.get("heroSubcopy") ?? "").trim(),
    heroImage: String(formData.get("heroImage") ?? "").trim(),
    stats: stats.value,
    navLinks: navLinks.value,
    valueProps: valueProps.value,
    upcomingFeatures: upcomingFeatures.value,
    footerAbout: String(formData.get("footerAbout") ?? "").trim(),
    footerColumns: footerColumns.value,
    socialLinks: socialLinks.value,
    sommelier: {
      name: String(formData.get("sommelierName") ?? "").trim(),
      title: String(formData.get("sommelierTitle") ?? "").trim(),
      portrait: String(formData.get("sommelierPortrait") ?? "").trim(),
      intro: String(formData.get("sommelierIntro") ?? "").trim(),
      defaultTags: csvToList(formData.get("sommelierDefaultTags")),
      starterPrompts: csvToList(formData.get("sommelierStarterPrompts")),
      chatPreview: {
        user: String(formData.get("sommelierChatUser") ?? "").trim(),
        ai: String(formData.get("sommelierChatAi") ?? "").trim(),
      },
      cannedReplies: cannedReplies.value,
    },
    tastingLog: {
      title: String(formData.get("tastingLogTitle") ?? "").trim(),
      countLabel: String(formData.get("tastingLogCountLabel") ?? "").trim(),
      avatar: String(formData.get("tastingLogAvatar") ?? "").trim(),
    },
  };

  const parsed = siteSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix invalid settings fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    await saveAdminSiteSettings(parsed.data);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Save failed",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true, message: "Settings saved" };
}
