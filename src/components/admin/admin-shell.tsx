import Link from "next/link";
import { signOutAction } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/chocolates", label: "Chocolates" },
  { href: "/admin/settings", label: "Site settings" },
];

export function AdminShell({
  email,
  children,
}: {
  email?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-bg-base text-text-on-dark">
      <header className="border-b border-border bg-bg-elevated">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/admin"
              className="font-display text-lg text-brass hover:text-brass-hover"
            >
              Admin
            </Link>
            <nav className="flex flex-wrap gap-3 text-sm text-text-muted">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-text-on-dark"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/" className="hover:text-text-on-dark">
                View site
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {email ? (
              <span className="hidden text-text-muted sm:inline">{email}</span>
            ) : null}
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
