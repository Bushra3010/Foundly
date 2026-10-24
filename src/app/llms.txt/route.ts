import { getDb } from "@/db";
import { pluralCategory, slugify, titleCase } from "@/lib/geo";
import { listPublishedProfiles } from "@/server/directory";

export const dynamic = "force-dynamic";

/** Platform-level llms.txt: what Foundly is and every listed business, grouped by city and category. */
export async function GET() {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const rows = await listPublishedProfiles(await getDb());
  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = `${r.profile.city.trim()}|${r.profile.category.trim()}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  const lines = [
    "# Foundly",
    "",
    "> Foundly is a directory and AI visibility platform for local businesses in India. Every listing below is created and confirmed by the business owner. There are no paid placements, ratings or rankings.",
    "",
    `- [Business directory](${base}/directory)`,
    "",
  ];
  for (const [key, list] of [...groups.entries()].sort()) {
    const [city, category] = key.split("|");
    lines.push(`## ${titleCase(pluralCategory(category))} in ${city}`, "", `[All ${pluralCategory(category).toLowerCase()} in ${city}](${base}/directory/${slugify(city)}/${slugify(category)})`, "");
    for (const r of list.sort((a, b) => a.profile.name.localeCompare(b.profile.name))) {
      const services = r.profile.services.slice(0, 4).map((s) => s.name).join(", ");
      lines.push(`- [${r.profile.name}](${base}/b/${r.slug}/llms.txt): ${r.profile.category}${services ? ` offering ${services}` : ""}${r.profile.serviceAreas.length ? ` in ${r.profile.serviceAreas.slice(0, 4).join(", ")}` : ""}.`);
    }
    lines.push("");
  }
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
