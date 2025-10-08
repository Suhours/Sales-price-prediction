import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get("auth")?.value === "1";
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const path = request.nextUrl.pathname;

  // Skip middleware for API, Next internals, static assets
  const isAsset =
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path === "/favicon.ico" ||
    path.includes(".");
  if (isAsset) return NextResponse.next();

  if (!isLoggedIn && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}


