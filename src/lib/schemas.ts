import { z } from "zod";

export const chocolateSchema = z.object({
  slug: z.string(),
  title: z.string(),
  brand: z.string(),
  shortDescription: z.string(),
  description: z.string(),
  image: z.string().min(1, "Primary image is required"),
  gallery: z.array(z.string()).default([]),
  originCountry: z.string(),
  originCode: z.string(),
  originFlagEmoji: z.string(),
  tags: z.array(z.string()),
  rating: z.number().min(0).max(5),
  price: z.number(),
  currency: z.string().default("USD"),
  featured: z.boolean().default(false),
  // Keystatic optional integers come through as null when unset
  recentRank: z.preprocess(
    (value) => (value == null ? undefined : value),
    z.number().optional()
  ),
  publishedAt: z.string(),
  status: z.enum(["draft", "published"]).default("published"),
});

export type Chocolate = z.infer<typeof chocolateSchema>;

export const siteSettingsSchema = z.object({
  siteName: z.string(),
  heroHeadline: z.object({
    discover: z.string(),
    taste: z.string(),
    remember: z.string(),
  }),
  heroSubcopy: z.string(),
  heroImage: z.string(),
  stats: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      icon: z.string(),
    })
  ),
  navLinks: z.array(
    z.object({
      label: z.string(),
      href: z.string(),
    })
  ),
  valueProps: z.array(
    z.object({
      icon: z.string(),
      title: z.string(),
      blurb: z.string(),
    })
  ),
  upcomingFeatures: z.array(
    z.object({
      icon: z.string(),
      title: z.string(),
      blurb: z.string(),
      slug: z.string(),
      comingSoon: z.boolean().default(true),
    })
  ),
  footerAbout: z.string(),
  footerColumns: z.array(
    z.object({
      title: z.string(),
      links: z.array(
        z.object({
          label: z.string(),
          href: z.string(),
        })
      ),
    })
  ),
  socialLinks: z.array(
    z.object({
      label: z.string(),
      href: z.string(),
      icon: z.string(),
    })
  ),
  sommelier: z.object({
    name: z.string(),
    title: z.string(),
    portrait: z.string(),
    intro: z.string(),
    defaultTags: z.array(z.string()),
    starterPrompts: z.array(z.string()),
    chatPreview: z.object({
      user: z.string(),
      ai: z.string(),
    }),
    cannedReplies: z.array(
      z.object({
        tags: z.array(z.string()),
        reply: z.string(),
      })
    ),
  }),
  tastingLog: z.object({
    title: z.string(),
    countLabel: z.string(),
    avatar: z.string(),
  }),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;
