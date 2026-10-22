import Link from "next/link";
import { NAV } from "@/components/nav-items";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "More" };

export default function MorePage() {
  return (
    <>
      <PageHeader title="More" />
      <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
        {NAV.filter((i) => !["/app", "/app/website", "/app/visibility"].includes(i.href)).map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="flex min-h-14 items-center gap-3 px-4 font-medium">
              <span aria-hidden="true" className="w-5 text-center">
                {item.icon}
              </span>
              {item.label}
              <span aria-hidden="true" className="ml-auto text-muted">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
