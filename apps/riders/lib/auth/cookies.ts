import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

const isProduction = process.env.NODE_ENV === "production";

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "none";
  path: string;
  maxAge?: number;
}

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

/**
 * Set auth cookies on a NextResponse
 * @param response NextResponse to modify
 * @param accessToken JWT access token
 * @param refreshToken Refresh token (plain, not hashed)
 */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  // Access token: 15 minutes
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60, // 15 minutes in seconds
  });

  // Refresh token: 30 days
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseCookieOptions,
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  });
}

/**
 * Clear auth cookies on a NextResponse
 * @param response NextResponse to modify
 */
export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    ...baseCookieOptions,
    maxAge: 0,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    ...baseCookieOptions,
    maxAge: 0,
  });
}

/**
 * Get access token from request cookies (server-side)
 * @returns Access token or null
 */
export async function getAccessTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;
}

/**
 * Get refresh token from request cookies (server-side)
 * @returns Refresh token or null
 */
export async function getRefreshTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value || null;
}

/**
 * Parse cookies from a raw cookie header string (for WebSocket)
 * @param cookieHeader Raw Cookie header
 * @returns Object with parsed cookies
 */
export function parseCookieHeader(
  cookieHeader: string
): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    if (name && rest.length > 0) {
      cookies[name] = rest.join("=");
    }
  });

  return cookies;
}

/**
 * Get access token from raw cookie header (for WebSocket)
 */
export function getAccessTokenFromHeader(cookieHeader: string): string | null {
  const cookies = parseCookieHeader(cookieHeader);
  return cookies[ACCESS_TOKEN_COOKIE] || null;
}

/**
 * Get refresh token from raw cookie header (for WebSocket)
 */
export function getRefreshTokenFromHeader(cookieHeader: string): string | null {
  const cookies = parseCookieHeader(cookieHeader);
  return cookies[REFRESH_TOKEN_COOKIE] || null;
}
