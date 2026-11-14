// Writes the public portfolio (Our Work) to src/data/portfolio.json, so the live site needs no database for it.
// Usage: npx vite-node -c vitest.config.ts scripts/export-portfolio.ts
// Edit projects in the local admin (or a migration), run this, review the JSON diff, then commit and deploy.
import { writeFileSync } from "node:fs";
import { getDb } from "@/db";
import { listPublishedProjectsFromDb } from "@/server/portfolio";

async function main() {
  const projects = await listPublishedProjectsFromDb(await getDb());
  // Database-served screenshots (uploads) can't be shipped as a file; only static /work-shots images are kept.
  const data = projects.map((p) => ({ ...p, media: p.media.filter((m) => m.url.startsWith("/work-shots/")).map((m) => ({ ...m, id: m.url })) }));
  // Media ids are random per database, so the image path is used as a stable id.
  writeFileSync("src/data/portfolio.json", JSON.stringify(data, null, 2) + "\n");
  console.log(`Wrote ${data.length} projects to src/data/portfolio.json`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
