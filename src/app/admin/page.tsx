import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export default async function AdminDashboardPage() {
  const user = await requireAdmin();

  return (
    <AdminShell email={user.email}>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-2 text-sm text-text-muted">
        Production CMS writing to Supabase. Keystatic remains available at{" "}
        <Link href="/keystatic" className="text-brass hover:underline">
          /keystatic
        </Link>{" "}
        for local file editing.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/chocolates"
          className="rounded-xl border border-border bg-bg-elevated p-5 transition hover:border-brass/50"
        >
          <h2 className="font-display text-xl text-brass">Chocolates</h2>
          <p className="mt-2 text-sm text-text-muted">
            List, create, edit, archive, or delete catalogue entries.
          </p>
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-xl border border-border bg-bg-elevated p-5 transition hover:border-brass/50"
        >
          <h2 className="font-display text-xl text-brass">Site settings</h2>
          <p className="mt-2 text-sm text-text-muted">
            Hero, stats, nav, value props, footer, sommelier, tasting log.
          </p>
        </Link>
      </div>

      <div className="mt-8">
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Open public site
        </Link>
      </div>
    </AdminShell>
  );
}
