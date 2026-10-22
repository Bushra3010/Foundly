import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "abgp_session";
const PASSTHROUGH = /^\/(_next|media|favicon\.ico|icon-)/;

function rewriteToSite(req: NextRequest, pathname: string, base: string, target: string) {
  const url = req.nextUrl.clone();
  url.pathname = target;
  const headers = new Headers(req.headers);
  // Tells the site renderer which link prefix this origin uses ("" on its own origin).
  headers.set("x-site-base", base);
  const res = NextResponse.rewrite(url, { request: { headers } });
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  return res;
}

/**
 * 1. Customer sites on their own origin, separate from the owner app:
 *    `<slug>.<SITES_ROOT_DOMAIN>` → /s/<slug>, verified custom domains → /d/<host>.
 *    App routes are never served on those origins.
 * 2. Optimistic auth redirect for the owner app. Real checks happen in the data
 *    access layer on every request.
 */
export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const { pathname } = req.nextUrl;
  const sitesRoot = process.env.SITES_ROOT_DOMAIN?.toLowerCase();
  const appHost = process.env.APP_URL ? new URL(process.env.APP_URL).hostname.toLowerCase() : null;
  const sub = pathname === "/" ? "" : pathname;

  if (sitesRoot && host.endsWith(`.${sitesRoot}`)) {
    if (PASSTHROUGH.test(pathname)) return NextResponse.next();
    return rewriteToSite(req, pathname, "", `/s/${host.slice(0, -(sitesRoot.length + 1))}${sub}`);
  }
  if (appHost && host !== appHost && host !== sitesRoot && host !== "localhost" && host !== "127.0.0.1") {
    if (PASSTHROUGH.test(pathname)) return NextResponse.next();
    return rewriteToSite(req, pathname, "", `/d/${host}${sub}`);
  }

  if ((pathname.startsWith("/app") || pathname.startsWith("/onboarding") || pathname.startsWith("/admin")) && !req.cookies.has(SESSION_COOKIE)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon-).*)"],
};
