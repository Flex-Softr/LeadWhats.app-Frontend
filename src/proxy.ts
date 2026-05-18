import { NextResponse, type NextRequest } from "next/server";

const LEGACY_DASHBOARD_PREFIX = "/user/dashboard";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname === LEGACY_DASHBOARD_PREFIX ||
    pathname.startsWith(`${LEGACY_DASHBOARD_PREFIX}/`)
  ) {
    const canonicalPath =
      pathname.slice(LEGACY_DASHBOARD_PREFIX.length) || "/";
    const url = request.nextUrl.clone();
    url.pathname = canonicalPath;
    url.search = search;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/dashboard/:path*"],
};
