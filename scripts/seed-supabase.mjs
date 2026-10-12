#!/usr/bin/env node
/**
 * Upsert content/ JSON into Supabase.
 *
 * Requires:
 *   SUPABASE_URL (or legacy NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Anon / publishable key is not required for seed, but if present we accept:
 *   SUPABASE_ANON_KEY | NEXT_PUBLIC_SUPABASE_ANON_KEY | NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *
 * Optional: load from .env.local if present (dotenv not required — we parse simply).
 */
import { createClient } from "@supabase/supabase-js";
import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

async function loadEnvFile(filePath) {
  try {
    await access(filePath);
  } catch {
    return;
  }
  const text = await readFile(filePath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

await loadEnvFile(path.join(root, ".env.local"));
await loadEnvFile(path.join(root, ".env"));

const url =
  process.env.SUPABASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
// Anon key unused by seed; resolve for diagnostics (accepts new dashboard name).
const anonKey =
  process.env.SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

if (!url || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Copy .env.example → .env.local and paste keys from the Supabase project.\n" +
      `Detected: SUPABASE_URL=${url ? "yes" : "no"}, SUPABASE_SERVICE_ROLE_KEY=${serviceKey ? "yes" : "no"}, anon/publishable=${anonKey ? "yes" : "no"}.`
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function chocolateToRow(chocolate) {
  return {
    slug: chocolate.slug,
    title: chocolate.title,
    brand: chocolate.brand,
    short_description: chocolate.shortDescription,
    description: chocolate.description,
    image: chocolate.image,
    gallery: chocolate.gallery ?? [],
    origin_country: chocolate.originCountry,
    origin_code: chocolate.originCode,
    origin_flag_emoji: chocolate.originFlagEmoji,
    tags: chocolate.tags ?? [],
    rating: chocolate.rating,
    price: chocolate.price,
    currency: chocolate.currency ?? "USD",
    featured: Boolean(chocolate.featured),
    recent_rank: chocolate.recentRank ?? null,
    published_at: chocolate.publishedAt,
    status: chocolate.status ?? "published",
  };
}

async function seedChocolates() {
  const dir = path.join(root, "content", "chocolates");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  const rows = [];

  for (const file of files) {
    const raw = JSON.parse(await readFile(path.join(dir, file), "utf8"));
    const slug = raw.slug || path.basename(file, ".json");
    rows.push(chocolateToRow({ ...raw, slug }));
  }

  const { error } = await supabase.from("chocolates").upsert(rows, {
    onConflict: "slug",
  });
  if (error) throw new Error(`chocolates upsert failed: ${error.message}`);
  console.log(`Upserted ${rows.length} chocolates`);
}

async function seedSiteSettings() {
  const candidates = [
    path.join(root, "content", "site-settings", "index.json"),
    path.join(root, "content", "site-settings.json"),
  ];

  let document = null;
  for (const candidate of candidates) {
    try {
      document = JSON.parse(await readFile(candidate, "utf8"));
      console.log(`Loaded site settings from ${path.relative(root, candidate)}`);
      break;
    } catch {
      // try next
    }
  }

  if (!document) {
    throw new Error("Could not find content/site-settings/index.json");
  }

  const { error } = await supabase.from("site_settings").upsert(
    { id: "default", document },
    { onConflict: "id" }
  );
  if (error) throw new Error(`site_settings upsert failed: ${error.message}`);
  console.log("Upserted site_settings (id=default)");
}

try {
  await seedChocolates();
  await seedSiteSettings();
  console.log("Seed complete.");
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
