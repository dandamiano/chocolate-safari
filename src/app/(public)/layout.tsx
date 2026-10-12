import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSiteSettings } from "@/lib/content";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
      <SiteHeader settings={settings} />
      <div className="flex-1">{children}</div>
      <SiteFooter settings={settings} />
    </>
  );
}
