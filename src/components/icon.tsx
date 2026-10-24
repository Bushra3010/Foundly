import type { CSSProperties } from "react";
import Image from "next/image";
import appLogo from "../../public/App Logo.png";

const paths: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9",
  business: "M4 21V5h16v16M8 5V3h8v2M8 9h2m4 0h2M8 13h2m4 0h2M10 21v-4h4v4",
  website:
    "M3 8h18M7 5h.01M10 5h.01M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM8 12h8m-8 4h5",
  visibility:
    "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  improve: "m4 17 6-6 4 4 7-10m-6 0h6v6",
  presence: "M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  leads: "M3 5h18v14H3V5Zm0 1 9 7 9-7",
  reports: "M5 3h14v18H5V3Zm4 5h6m-6 4h6m-6 4h3",
  settings: "M4 7h16M4 17h16M8 4v6m8 4v6",
  workspaces: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z",
  more: "M4 6h16M4 12h16M4 18h16",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  compare: "M7 4 3 8l4 4M3 8h14m0 4 4 4-4 4m4-4H7",
  chevron: "m9 5 7 7-7 7",
  down: "m6 9 6 6 6-6",
  check: "m5 12 4 4L19 6",
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z",
  shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-6",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-5v5l3 2",
  globe:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z",
};
const hrefNames: Record<string, string> = {
  "/app": "home",
  "/admin": "shield",
  "/app/compare": "compare",
};
export function Icon({
  name,
  size = 20,
  className,
  style,
}: {
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const key = name.startsWith("/")
    ? (hrefNames[name] ?? name.split("/")[2])
    : name;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path d={paths[key] ?? paths.workspaces} />
    </svg>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`brand-lockup${compact ? " brand-lockup-compact" : ""}`}
      style={{
        display: "inline-flex",
        width: compact ? 120 : "clamp(150px, 18vw, 180px)",
        maxWidth: "100%",
        flexShrink: 0,
      }}
    >
      <Image
        src={appLogo}
        alt="Foundly"
        width={180}
        height={60}
        sizes={compact ? "120px" : "(max-width: 767px) 150px, 180px"}
        loading="eager"
        className="brand-logo"
        style={{ display: "block", width: "100%", height: "auto" }}
      />
    </span>
  );
}
