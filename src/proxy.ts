import { NextResponse, type NextRequest } from "next/server";
import { countryFromHeaders, GEO_COUNTRY_COOKIE } from "@/lib/regional-pricing";

const SESSION_COOKIE = "abgp_session";
const PROTECTED = /^\/(app|onboarding|admin)(\/|$)/;

/**
 * Optimistic auth redirect for the owner app. Real checks happen in the data
 * access layer on every request.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
