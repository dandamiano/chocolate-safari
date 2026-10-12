import { Hero } from "@/components/home/hero";
import { RecentDiscoveries } from "@/components/home/recent-discoveries";
import { SommelierPanel } from "@/components/home/sommelier-panel";
import { UpcomingFeatures } from "@/components/home/upcoming-features";
import { ValueProps } from "@/components/home/value-props";
import { getRecentDiscoveries, getSiteSettings } from "@/lib/content";

export default async function HomePage() {
  const [settings, discoveries] = await Promise.all([
    getSiteSettings(),
    getRecentDiscoveries(5),
  ]);

  return (
    <main>
      <Hero settings={settings} />
      <SommelierPanel settings={settings.sommelier} />
      <RecentDiscoveries chocolates={discoveries} />
      <ValueProps items={settings.valueProps} />
      <UpcomingFeatures settings={settings} />
    </main>
  );
}
