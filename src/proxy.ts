import { NextResponse } from "next/server";

import { auth } from "@/auth";

export const proxy = auth((request) => {
  const { pathname, search } = request.nextUrl;
  const protectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/profile");

  if (protectedRoute && !request.auth?.user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|assets).*)",
  ],
};
