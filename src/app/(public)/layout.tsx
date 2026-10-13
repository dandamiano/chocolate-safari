import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getPublicSession } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/content";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, session] = await Promise.all([
    getSiteSettings(),
    getPublicSession(),
  ]);

  return (
    <>
      <SiteHeader
        settings={settings}
        auth={{
          signedIn: Boolean(session.user),
          email: session.email,
          bookmarkCount: session.bookmarkCount,
        }}
      />
      <div className="flex-1">{children}</div>
      <SiteFooter settings={settings} />
    </>
  );
}
