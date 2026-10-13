"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, Menu, Search } from "lucide-react";
import { FormEvent, useState } from "react";
import type { SiteSettings } from "@/lib/schemas";
import { Logo } from "@/components/brand/logo";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SoftImage } from "@/components/ui/soft-image";
import { publicSignOutAction } from "@/lib/auth/actions";

export type HeaderAuth = {
  signedIn: boolean;
  email: string | null;
  bookmarkCount: number;
};

export function SiteHeader({
  settings,
  auth,
}: {
  settings: SiteSettings;
  auth: HeaderAuth;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
    setOpen(false);
  }

  const countLabel = auth.signedIn
    ? `${auth.bookmarkCount} ${auth.bookmarkCount === 1 ? "chocolate" : "chocolates"}`
    : "Sign in to sync";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-md transition-colors",
        pathname === "/"
          ? "border-transparent bg-bg-base/45"
          : "border-border/40 bg-bg-base/70"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo className="shrink-0" />

        <nav className="hidden flex-1 items-center justify-center gap-5 lg:flex">
          {settings.navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href.replace("/#sommelier", "/sommelier")) ||
                  (link.href.includes("#") && pathname === "/");
            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={cn(
                  "text-[13px] text-text-muted transition-colors hover:text-brass",
                  active && "text-brass"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          <form onSubmit={onSearch} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search chocolates..."
              className="h-9 w-48 rounded-full border-border bg-bg-elevated pl-9 text-[13px] text-text-on-dark placeholder:text-text-muted lg:w-56"
              aria-label="Search chocolates"
            />
          </form>
          <Link
            href="/tasting-log"
            aria-label="Tasting log"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border text-text-muted transition hover:border-brass hover:text-brass"
          >
            <Bookmark className="size-4" />
          </Link>
          <Link
            href="/tasting-log"
            className="hidden items-center gap-2.5 rounded-full border border-border bg-bg-elevated py-1 pl-1 pr-3 transition hover:border-brass lg:inline-flex"
          >
            <SoftImage
              src={settings.tastingLog.avatar}
              alt=""
              width={30}
              height={30}
              className="size-[30px] rounded-full object-cover"
            />
            <span className="leading-tight">
              <span className="block max-w-[9rem] truncate text-[12px] font-medium text-text-on-dark">
                {auth.signedIn
                  ? auth.email ?? settings.tastingLog.title
                  : settings.tastingLog.title}
              </span>
              <span className="block text-[11px] text-text-muted">
                {countLabel}
              </span>
            </span>
          </Link>
          {auth.signedIn ? (
            <form action={publicSignOutAction}>
              <button
                type="submit"
                className="text-[12px] text-text-muted transition hover:text-brass"
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="text-[12px] font-medium text-brass transition hover:underline"
            >
              Sign in
            </Link>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="ml-auto inline-flex size-9 items-center justify-center rounded-lg text-text-on-dark transition hover:bg-bg-elevated lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="border-border bg-bg-elevated text-text-on-dark"
          >
            <SheetHeader>
              <SheetTitle className="font-display text-left text-text-on-dark">
                Menu
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-4 px-1">
              <form onSubmit={onSearch} className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search chocolates..."
                  className="h-10 rounded-full border-border bg-bg-base pl-9"
                />
              </form>
              {settings.navLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm text-text-muted transition hover:text-brass"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/tasting-log"
                onClick={() => setOpen(false)}
                className="text-sm text-text-muted transition hover:text-brass"
              >
                My Tasting Log ({countLabel})
              </Link>
              {auth.signedIn ? (
                <form action={publicSignOutAction}>
                  <button
                    type="submit"
                    className="text-sm text-text-muted transition hover:text-brass"
                  >
                    Sign out
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-sm text-brass transition hover:underline"
                >
                  Sign in
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
