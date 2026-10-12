import { SommelierPanel } from "@/components/home/sommelier-panel";
import { getSiteSettings } from "@/lib/content";

export const metadata = {
  title: "AI Sommelier",
};

export default async function SommelierPage() {
  const settings = await getSiteSettings();

  return (
    <main className="pb-10 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="section-label">Guide</p>
        <h1 className="mt-2 font-display text-4xl text-text-on-dark">
          AI Chocolate Sommelier
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-muted sm:text-base">
          A rule-based tasting guide for now — pick flavors and start a
          conversation. Real LLM wiring can plug into the same API later.
        </p>
      </div>
      <SommelierPanel settings={settings.sommelier} />
    </main>
  );
}
