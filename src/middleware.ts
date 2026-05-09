import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin panel routes are disabled for this retailer storefront demo.
 * Remove this file (or the /admin branch below) to serve `src/app/admin` again.
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
