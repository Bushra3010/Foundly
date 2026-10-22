import Link from "next/link";
import { NAV } from "@/components/nav-items";
import { PageHeader } from "@/components/ui";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export const metadata = { title: "More" };

export default async function MorePage() {
  const locale = await getLocale();
  return (
    <>
      <PageHeader title={t(locale, "nav.more")} />
      <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
        {[...NAV.filter((i) => !["/app", "/app/website", "/app/visibility"].includes(i.href)).map((i) => ({ ...i, label: t(locale, i.key) })), { href: "/app/workspaces", label: "Workspaces", icon: "⧉" }].map((item) => (
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
