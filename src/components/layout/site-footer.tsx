import Link from "next/link";
import type { SiteSettings } from "@/lib/schemas";
import { Logo } from "@/components/brand/logo";
import { NewsletterForm } from "./newsletter-form";

function SocialGlyph({ icon }: { icon: string }) {
  if (icon === "twitter") {
    return (
      <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (icon === "youtube") {
    return (
      <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden>
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden>
      <path d="M12 2.2A9.8 9.8 0 1 0 21.8 12 9.8 9.8 0 0 0 12 2.2zm0 3.6a3.5 3.5 0 1 1-3.5 3.5A3.5 3.5 0 0 1 12 5.8zm0 12.9a7.2 7.2 0 0 1-4.8-1.8 4.2 4.2 0 0 1 4.8-2.9 4.2 4.2 0 0 1 4.8 2.9 7.2 7.2 0 0 1-4.8 1.8z" />
    </svg>
  );
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-border bg-bg-base">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))_1.1fr] lg:px-8">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-text-muted">
            {settings.footerAbout}
          </p>
        </div>

        {settings.footerColumns.map((column) => (
          <div key={column.title}>
            <h3 className="mb-4 text-sm font-semibold text-text-on-dark">
              {column.title}
            </h3>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted transition hover:text-brass"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="mb-3 text-sm font-semibold text-text-on-dark">
            Stay in the loop
          </h4>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-xs text-text-muted">
            © 2026 Chocolate Safari
          </p>
          <div className="flex items-center gap-2">
            {settings.socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="inline-flex size-9 items-center justify-center rounded-full border border-border text-text-muted transition hover:border-brass hover:text-brass"
              >
                <SocialGlyph icon={social.icon} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
