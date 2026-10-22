import Link from "next/link";
import { Card } from "@/components/ui";
import type { Ratio } from "@/server/monitoring/metrics";

export function pct(r: Ratio) {
  return r.rate === null ? "—" : `${Math.round(r.rate * 1000) / 10}%`;
}

export function MetricCard({ title, ratio, definition, href, unit }: { title: string; ratio: Ratio; definition: string; href: string; unit: string }) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-muted">{title}</h3>
      <p className="mt-1 text-3xl font-bold">{pct(ratio)}</p>
      <p className="text-sm">
        {ratio.numerator} of {ratio.denominator} {unit}
      </p>
      <p className="mt-2 text-xs text-muted">{definition}</p>
      <Link href={href} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-brand underline">
        See the answers behind this
      </Link>
    </Card>
  );
}
