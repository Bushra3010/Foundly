import Link from "next/link";
import type { PublicProfile } from "@/lib/profile";

export type ListingRow = { slug: string; profile: PublicProfile; verification: string };

/** One business in a city or category list. Facts only, as confirmed by the owner. */
export function ListingCard({ row }: { row: ListingRow }) {
  const p = row.profile;
  return (
    <li className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="text-lg font-semibold">
        <Link href={`/b/${row.slug}`} className="hover:underline">{p.name}</Link>
      </h3>
      <p className="text-sm text-muted">
        {p.category} · {p.city}
        {p.serviceAreas.length > 0 && ` · serves ${p.serviceAreas.slice(0, 4).join(", ")}`}
      </p>
      {p.description && <p className="mt-2 line-clamp-3 text-[15px]">{p.description}</p>}
      {p.services.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {p.services.slice(0, 6).map((s) => (
            <li key={s.name} className="rounded-full border border-border px-3 py-1 text-sm">{s.name}</li>
          ))}
        </ul>
      )}
      <p className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
        <Link href={`/b/${row.slug}`} className="underline">Profile</Link>
        {row.profile.websiteUrl && <a href={row.profile.websiteUrl} rel="noopener nofollow" className="underline">Website</a>}
        {row.verification !== "none" && <span className="text-ok-fg">Ownership verified</span>}
      </p>
    </li>
  );
}

export function listToText(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
