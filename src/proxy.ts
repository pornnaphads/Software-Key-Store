import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const mockUser = request.cookies.get("mock_user")?.value;
  const { pathname } = request.nextUrl;

  // Define pages that require login (e.g., checkouts, account profiles)
  const isProtectedRoute = pathname.startsWith("/checkout") || pathname.startsWith("/profile") || pathname.startsWith("/dashboard");
  const isAuthPage = pathname.startsWith("/login");

  if (isProtectedRoute && !mockUser) {
    // Redirect anonymous users to login page
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && mockUser) {
    // Redirect already authenticated users away from the login page to home
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static / chunk files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
