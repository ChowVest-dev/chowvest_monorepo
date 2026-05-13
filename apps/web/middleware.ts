import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/tokens";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/wallet",
  "/profile",
  "/basket-goals",
  "/market",
];

// Routes that should redirect to dashboard if authenticated
const authRoutes = ["/auth"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── Hard Kill Switch: Maintenance Mode ───
  // When MAINTENANCE_MODE=true, redirect all user-facing routes to /maintenance.
  // Admin panel, API routes (webhooks, cron), and static assets are excluded.
  if (process.env.MAINTENANCE_MODE === "true") {
    const isExcluded =
      pathname === "/" ||
      pathname === "/maintenance" ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon");

    if (!isExcluded) {
      return NextResponse.rewrite(new URL("/maintenance", req.url));
    }
  }

  // Get access token from cookies
  const accessToken = req.cookies.get("access_token")?.value;

  // Verify token
  let isAuthenticated = false;
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    isAuthenticated = !!payload;
  }

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes to auth
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL("/auth", req.url);
    return NextResponse.redirect(url);
  }

  // We intentionally skip redirecting from "/auth" to "/dashboard" here 
  // because Edge middleware cannot consult the Postgres DB to check if the session is revoked/suspended.
  // This prevents infinite redirect loops. That validation is now natively handled by the Auth Client.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)).*)",
  ],
};
