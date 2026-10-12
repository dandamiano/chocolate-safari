import { ComingSoon } from "@/components/layout/coming-soon";

const copy: Record<string, { title: string; description: string }> = {
  rankings: {
    title: "Rankings",
    description:
      "Community leaderboards by origin, style, and season are on the roadmap.",
  },
  comparisons: {
    title: "Comparisons",
    description:
      "Side-by-side tasting comparisons will land after the catalogue MVP.",
  },
  guides: {
    title: "Guides",
    description: "Editorial guides are stubbed until the content workflow expands.",
  },
  community: {
    title: "Community",
    description: "Community spaces are planned after accounts and reviews.",
  },
  "brand-stories": {
    title: "Brand Stories",
    description: "Maker profiles and brand stories will appear here later.",
  },
  mission: {
    title: "Mission",
    description: "A fuller about page is coming. Chocolate Safari is a tasting catalogue for curious palates.",
  },
  "how-it-works": {
    title: "How it Works",
    description: "Browse, bookmark, and ask the Sommelier — accounts come later.",
  },
  contact: {
    title: "Contact",
    description: "Contact details will ship with the public launch.",
  },
  "tasting-log": {
    title: "My Tasting Log",
    description:
      "Cloud tasting logs need accounts. Bookmarks already save locally in this browser.",
  },
  saved: {
    title: "Saved Bars",
    description:
      "A dedicated saved view is coming. Use the bookmark control on each card for now.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: copy[slug]?.title ?? "Coming soon" };
}

export default async function ComingSoonSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = copy[slug] ?? {
    title: "Coming soon",
    description: "This trail marker isn’t built yet — explore the catalogue meanwhile.",
  };

  return <ComingSoon title={page.title} description={page.description} />;
}
