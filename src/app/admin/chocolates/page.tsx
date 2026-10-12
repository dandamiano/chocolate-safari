import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";
import { listAdminChocolates } from "@/lib/admin/content";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export const metadata = {
  title: "Chocolates · Admin",
};

export default async function AdminChocolatesPage() {
  const user = await requireAdmin();
  let chocolates: Awaited<ReturnType<typeof listAdminChocolates>> = [];
  let loadError: string | null = null;

  try {
    chocolates = await listAdminChocolates();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Failed to load chocolates (is SUPABASE_SERVICE_ROLE_KEY set?)";
  }

  return (
    <AdminShell email={user.email}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Chocolates</h1>
          <p className="mt-1 text-sm text-text-muted">
            {chocolates.length} row{chocolates.length === 1 ? "" : "s"} in
            Supabase
          </p>
        </div>
        <Link
          href="/admin/chocolates/new"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          New chocolate
        </Link>
      </div>

      {loadError ? (
        <p className="mt-6 rounded-lg border border-red-500/40 p-3 text-sm text-red-200">
          {loadError}
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-bg-elevated text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Brand</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Featured</th>
              <th className="px-3 py-2 font-medium">Rating</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {chocolates.map((item) => (
              <tr
                key={item.slug}
                className="border-t border-border/80 hover:bg-bg-elevated/60"
              >
                <td className="px-3 py-2.5">
                  <div className="font-medium text-text-on-dark">
                    {item.title}
                  </div>
                  <div className="text-xs text-text-muted">{item.slug}</div>
                </td>
                <td className="px-3 py-2.5 text-text-muted">{item.brand}</td>
                <td className="px-3 py-2.5">
                  <span
                    className={
                      item.status === "published"
                        ? "text-brass"
                        : "text-text-muted"
                    }
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-text-muted">
                  {item.featured ? "yes" : "—"}
                </td>
                <td className="px-3 py-2.5 text-text-muted">{item.rating}</td>
                <td className="px-3 py-2.5 text-right">
                  <Link
                    href={`/admin/chocolates/${item.slug}`}
                    className="text-brass hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {chocolates.length === 0 && !loadError ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-text-muted"
                >
                  No chocolates yet.{" "}
                  <Link
                    href="/admin/chocolates/new"
                    className="text-brass hover:underline"
                  >
                    Create one
                  </Link>{" "}
                  or run <code>npm run seed:supabase</code>.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
