# Content (Git-based CMS)

Edit JSON in this folder to update the site without changing React code, or use the **Keystatic** admin at `/keystatic` while `npm run dev` is running (writes to the same files).

## Site settings

`content/site-settings/index.json` (Keystatic path `content/site-settings/` with trailing slash) controls:

- Hero headline / subcopy / image
- Stats, nav links, value props, upcoming features
- Footer copy, columns, socials
- Sommelier intro, portrait, tags, canned replies
- Tasting log display labels

## Chocolates

One file per bar in `chocolates/*.json`. Required fields match `src/lib/schemas.ts` (`slug`, `title`, `brand`, tags, rating, price, image path under `/public`, etc.).

Set `"status": "draft"` to hide a bar from the site.

After editing, refresh the page (or restart `npm run dev` if the file watcher misses a change).
