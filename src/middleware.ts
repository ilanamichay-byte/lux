import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["he", "en"] as const;
const DEFAULT_LOCALE = "he";

function isPublicFile(pathname: string) {
  // כל קובץ עם נקודה: favicon.ico, robots.txt, sitemap.xml, images וכו'
  return pathname.includes(".");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // לא נוגעים ב-Next internals וב-API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    isPublicFile(pathname)
  ) {
    return NextResponse.next();
  }

  // כבר יש locale ב-URL? (/he/..., /en/...)
  const firstSegment = pathname.split("/")[1];
  if (LOCALES.includes(firstSegment as any)) {
    const locale = firstSegment;

    // שומרים cookie כדי שה-layout ידע האם RTL/LTR
    const res = NextResponse.next();
    res.cookies.set("locale", locale, { path: "/" });

    // עושים rewrite פנימי: /he/marketplace -> /marketplace
    const strippedPath = pathname.replace(/^\/(he|en)(?=\/|$)/, "") || "/";
    const url = req.nextUrl.clone();
    url.pathname = strippedPath;

    return NextResponse.rewrite(url, { headers: res.headers });
  }

  // אין locale ב-URL -> מפנים ל-default (/he/...)
  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next).*)"],
};
