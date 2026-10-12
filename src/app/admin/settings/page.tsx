import { AdminShell } from "@/components/admin/admin-shell";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminSiteSettings } from "@/lib/admin/content";
import { getSiteSettings } from "@/lib/content";

export const metadata = {
  title: "Site settings · Admin",
};

export default async function AdminSettingsPage() {
  const user = await requireAdmin();

  let settings;
  let note: string | null = null;
  try {
    settings = await getAdminSiteSettings();
    if (!settings) {
      settings = await getSiteSettings();
      note =
        "No site_settings row in Supabase yet — form is prefilled from the public content fallback. Saving will create the row.";
    }
  } catch (error) {
    settings = await getSiteSettings();
    note =
      error instanceof Error
        ? `${error.message} — showing JSON/content fallback.`
        : "Could not load from Supabase — showing content fallback.";
  }

  return (
    <AdminShell email={user.email}>
      <h1 className="font-display text-3xl">Site settings</h1>
      <p className="mt-2 text-sm text-text-muted">
        Edits the singleton <code className="text-brass">site_settings</code>{" "}
        document in Supabase.
      </p>
      {note ? (
        <p className="mt-3 rounded-lg border border-border bg-bg-elevated p-3 text-sm text-text-muted">
          {note}
        </p>
      ) : null}
      <div className="mt-8">
        <SettingsForm settings={settings} />
      </div>
    </AdminShell>
  );
}
