import { NextResponse, type NextRequest } from "next/server";
import { countryFromHeaders, GEO_COUNTRY_COOKIE } from "@/lib/regional-pricing";

const SESSION_COOKIE = "abgp_session";
const PASSTHROUGH = /^\/(_next|media|favicon\.ico|icon-|icon\.png|apple-icon\.png|sw\.js|offline\.html)/;
const PROTECTED = /^\/(app|onboarding|admin)(\/|$)/;

function rewriteToSite(req: NextRequest, target: string) {
  const url = req.nextUrl.clone();
  url.pathname = target;
  const res = NextResponse.rewrite(url);
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  return res;
}

/**
 * 1. Customer sites on their own origin, separate from the owner app:
 *    `<slug>.<SITES_ROOT_DOMAIN>` and verified custom domains → /d/<host>.
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
    return rewriteToSite(req, `/d/${host}${sub}`);
  }
  // The host's own preview addresses (e.g. *.netlify.app) always serve the app,
  // never an owner's custom domain, so the site keeps working there too.
  const platformHost = host.endsWith(".netlify.app") || host.endsWith(".vercel.app");
  if (appHost && host !== appHost && !platformHost && host !== sitesRoot && host !== "localhost" && host !== "127.0.0.1") {
    if (PASSTHROUGH.test(pathname)) return NextResponse.next();
    return rewriteToSite(req, `/d/${host}${sub}`);
  }

  // Whole path segments only, so files like /apple-icon.png are never caught.
  if (PROTECTED.test(pathname) && pathname !== "/admin/login" && !req.cookies.has(SESSION_COOKIE)) {
    const url = req.nextUrl.clone();
    // The founder console has its own sign-in page.
    url.pathname = /^\/admin(\/|$)/.test(pathname) ? "/admin/login" : "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  // Lets the static landing page show local prices on the first visit.
  const country = countryFromHeaders(req.headers);
  if (country && req.cookies.get(GEO_COUNTRY_COOKIE)?.value !== country) {
    res.cookies.set(GEO_COUNTRY_COOKIE, country, { path: "/", maxAge: 86_400, sameSite: "lax" });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon-).*)"],
};
