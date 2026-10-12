import { config, collection, fields, singleton } from "@keystatic/core";

const linkFields = {
  label: fields.text({ label: "Label" }),
  href: fields.text({ label: "Href" }),
};

const chocolateSchema = {
  slug: fields.slug({ name: { label: "Slug" } }),
  title: fields.text({ label: "Title", validation: { isRequired: true } }),
  brand: fields.text({ label: "Brand", validation: { isRequired: true } }),
  shortDescription: fields.text({
    label: "Short description",
    multiline: true,
    validation: { isRequired: true },
  }),
  description: fields.text({
    label: "Description",
    multiline: true,
    validation: { isRequired: true },
  }),
  image: fields.text({
    label: "Image path (under /public)",
    validation: { isRequired: true },
  }),
  gallery: fields.array(fields.text({ label: "Image path" }), {
    label: "Gallery",
  }),
  originCountry: fields.text({ label: "Origin country" }),
  originCode: fields.text({ label: "Origin code (ISO)" }),
  originFlagEmoji: fields.text({ label: "Flag emoji" }),
  tags: fields.array(fields.text({ label: "Tag" }), { label: "Flavor tags" }),
  rating: fields.number({
    label: "Rating (0–5)",
    step: 0.1,
    validation: { min: 0, max: 5, isRequired: true },
  }),
  price: fields.number({
    label: "Price",
    step: 0.01,
    validation: { isRequired: true },
  }),
  currency: fields.text({ label: "Currency", defaultValue: "USD" }),
  featured: fields.checkbox({ label: "Featured", defaultValue: false }),
  recentRank: fields.integer({
    label: "Recent rank (home grid; lower = earlier)",
  }),
  publishedAt: fields.text({ label: "Published at (ISO date)" }),
  status: fields.select({
    label: "Status",
    options: [
      { label: "Published", value: "published" },
      { label: "Draft", value: "draft" },
    ],
    defaultValue: "published",
  }),
};

export default config({
  storage: {
    kind: "local",
  },
  ui: {
    brand: { name: "Chocolate Safari" },
    navigation: ["siteSettings", "chocolates"],
  },
  singletons: {
    siteSettings: singleton({
      label: "Site settings",
      path: "content/site-settings/",
      format: "json",
      schema: {
        siteName: fields.text({ label: "Site name" }),
        heroHeadline: fields.object(
          {
            discover: fields.text({ label: "Discover" }),
            taste: fields.text({ label: "Taste" }),
            remember: fields.text({ label: "Remember" }),
          },
          { label: "Hero headline" }
        ),
        heroSubcopy: fields.text({ label: "Hero subcopy", multiline: true }),
        heroImage: fields.text({ label: "Hero image path" }),
        stats: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            value: fields.text({ label: "Value" }),
            icon: fields.text({ label: "Icon key" }),
          }),
          { label: "Hero stats" }
        ),
        navLinks: fields.array(fields.object(linkFields), {
          label: "Navigation links",
        }),
        valueProps: fields.array(
          fields.object({
            icon: fields.text({ label: "Icon key" }),
            title: fields.text({ label: "Title" }),
            blurb: fields.text({ label: "Blurb", multiline: true }),
          }),
          { label: "Value proposition band" }
        ),
        upcomingFeatures: fields.array(
          fields.object({
            icon: fields.text({ label: "Icon key" }),
            title: fields.text({ label: "Title" }),
            blurb: fields.text({ label: "Blurb", multiline: true }),
            slug: fields.text({ label: "Slug" }),
            comingSoon: fields.checkbox({ label: "Coming soon" }),
          }),
          { label: "Upcoming features" }
        ),
        footerAbout: fields.text({ label: "Footer about", multiline: true }),
        footerColumns: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            links: fields.array(fields.object(linkFields), { label: "Links" }),
          }),
          { label: "Footer columns" }
        ),
        socialLinks: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            href: fields.url({ label: "URL" }),
            icon: fields.text({ label: "Icon key" }),
          }),
          { label: "Social links" }
        ),
        sommelier: fields.object(
          {
            name: fields.text({ label: "Guide name" }),
            title: fields.text({ label: "Title" }),
            portrait: fields.text({ label: "Portrait image path" }),
            intro: fields.text({ label: "Intro", multiline: true }),
            defaultTags: fields.array(fields.text({ label: "Tag" }), {
              label: "Default flavor tags",
            }),
            starterPrompts: fields.array(fields.text({ label: "Prompt" }), {
              label: "Starter prompts",
            }),
            chatPreview: fields.object(
              {
                user: fields.text({ label: "User message", multiline: true }),
                ai: fields.text({ label: "AI message", multiline: true }),
              },
              { label: "Chat preview" }
            ),
            cannedReplies: fields.array(
              fields.object({
                tags: fields.array(fields.text({ label: "Tag" }), {
                  label: "Tags",
                }),
                reply: fields.text({ label: "Reply", multiline: true }),
              }),
              { label: "Canned replies" }
            ),
          },
          { label: "Sommelier" }
        ),
        tastingLog: fields.object(
          {
            title: fields.text({ label: "Title" }),
            countLabel: fields.text({ label: "Count label" }),
            avatar: fields.text({ label: "Avatar image path" }),
          },
          { label: "Tasting log (header)" }
        ),
      },
    }),
  },
  collections: {
    chocolates: collection({
      label: "Chocolates",
      slugField: "slug",
      path: "content/chocolates/*",
      format: "json",
      columns: ["title", "brand", "status", "recentRank"],
      schema: chocolateSchema,
    }),
  },
});
