import Link from "next/link";
import { Icon } from "@/components/icon";
import { MOBILE_NAV, NAV } from "@/components/nav-items";
import { PageHeader } from "@/components/ui";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export const metadata = { title: "More" };

export default async function MorePage() {
  const locale = await getLocale();
  return (
    <>
      <PageHeader icon="more" title={t(locale, "nav.more")} />
      <ul className="more-list">
        {[
          ...NAV.filter(
            (i) =>
              !MOBILE_NAV.some((mobile) => mobile.href === i.href),
          ).map((i) => ({ ...i, label: t(locale, i.key) })),
        ].map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
            >
              <span className="more-icon" aria-hidden="true"><Icon name={item.href} size={19} /></span>
              {item.label}
              <Icon name="chevron" size={16} className="more-chevron" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
