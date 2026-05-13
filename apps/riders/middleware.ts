import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
);

const PUBLIC_ROUTES = ["/", "/logistics/login", "/logistics/register", "/rider/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Check for logistics portal access
  if (pathname.startsWith("/logistics")) {
    const session = req.cookies.get("logistics_session")?.value;
    const isPublicLogisticsRoute = pathname === "/logistics/login" || pathname === "/logistics/register";
    
    if (!session && !isPublicLogisticsRoute) {
      return NextResponse.redirect(new URL("/logistics/login", req.url));
    }
    return NextResponse.next();
  }

  // Check for rider portal access
  if (pathname.startsWith("/rider")) {
    const session = req.cookies.get("rider_session")?.value;
    if (!session && pathname !== "/rider/login") {
      return NextResponse.redirect(new URL("/rider/login", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
