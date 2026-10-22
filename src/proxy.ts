import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "abgp_session";

/**
 * 1. Customer sites on their own origin: `<slug>.<SITES_ROOT_DOMAIN>` is
 *    rewritten to /s/<slug>, and app routes are never served on that origin.
 * 2. Optimistic auth redirect for the owner app. Real checks happen in the
 *    data access layer on every request.
 */
export function proxy(req: NextRequest) {
  const host = req.headers.get("host")?.split(":")[0] ?? "";
  const sitesRoot = process.env.SITES_ROOT_DOMAIN;
  const { pathname } = req.nextUrl;

  if (sitesRoot && host.endsWith(`.${sitesRoot}`)) {
    const slug = host.slice(0, -(sitesRoot.length + 1));
    if (pathname.startsWith("/_next") || pathname === "/favicon.ico") return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = `/s/${slug}${pathname === "/" ? "" : pathname}`;
    const res = NextResponse.rewrite(url);
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    return res;
  }

  if ((pathname.startsWith("/app") || pathname.startsWith("/onboarding")) && !req.cookies.has(SESSION_COOKIE)) {
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
