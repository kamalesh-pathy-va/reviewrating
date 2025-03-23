import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const authToken = req.cookies.get("authToken")?.value;

  const { pathname } = req.nextUrl;

  // Prevent logged-in users from accessing login or signup pages
  if (authToken && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup"))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect unauthenticated users trying to access protected pages
  const protectedRoutes = ["/dashboard", "/profile", "/settings"]; // Add more protected routes as needed
  if (!authToken && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next(); // Allow access if conditions are not met
}

// Apply the middleware only to relevant routes
export const config = {
  matcher: ["/auth/login", "/auth/signup", "/profile"],
};
