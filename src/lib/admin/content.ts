import { getSupabaseServiceRole } from "@/lib/supabase";
import {
  chocolateFromRow,
  chocolateToRow,
  siteSettingsFromDocument,
  type ChocolateRow,
} from "@/lib/supabase-mappers";
import type { Chocolate, SiteSettings } from "@/lib/schemas";

export async function listAdminChocolates(): Promise<Chocolate[]> {
  const supabase = getSupabaseServiceRole();
  const { data, error } = await supabase
    .from("chocolates")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => chocolateFromRow(row as ChocolateRow));
}

export async function getAdminChocolate(
  slug: string
): Promise<Chocolate | null> {
  const supabase = getSupabaseServiceRole();
  const { data, error } = await supabase
    .from("chocolates")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return chocolateFromRow(data as ChocolateRow);
}

export async function upsertAdminChocolate(chocolate: Chocolate): Promise<void> {
  const supabase = getSupabaseServiceRole();
  const row = chocolateToRow(chocolate);
  const { error } = await supabase.from("chocolates").upsert(row, {
    onConflict: "slug",
  });
  if (error) throw new Error(error.message);
}

export async function deleteAdminChocolate(slug: string): Promise<void> {
  const supabase = getSupabaseServiceRole();
  const { error } = await supabase.from("chocolates").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
}

export async function archiveAdminChocolate(slug: string): Promise<void> {
  const supabase = getSupabaseServiceRole();
  const { error } = await supabase
    .from("chocolates")
    .update({ status: "draft" })
    .eq("slug", slug);
  if (error) throw new Error(error.message);
}

export async function getAdminSiteSettings(): Promise<SiteSettings | null> {
  const supabase = getSupabaseServiceRole();
  const { data, error } = await supabase
    .from("site_settings")
    .select("document")
    .eq("id", "default")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.document) return null;
  return siteSettingsFromDocument(data.document);
}

export async function saveAdminSiteSettings(
  settings: SiteSettings
): Promise<void> {
  const supabase = getSupabaseServiceRole();
  const { error } = await supabase.from("site_settings").upsert(
    {
      id: "default",
      document: settings,
    },
    { onConflict: "id" }
  );
  if (error) throw new Error(error.message);
}
