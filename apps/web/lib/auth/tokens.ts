import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
);
const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

interface AccessTokenPayload {
  userId: string;
  type: "access";
}

/**
 * Generate a short-lived access token (JWT) - Edge compatible
 * @param userId User ID to encode
 * @returns Signed JWT
 */
export async function generateAccessToken(userId: string): Promise<string> {
  return new SignJWT({ userId, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verify and decode an access token - Edge compatible
 * @param token JWT to verify
 * @returns Decoded payload or null if invalid
 */
export async function verifyAccessToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== "access") {
      return null;
    }
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

/**
 * Generate a cryptographically secure refresh token - Edge compatible
 * Uses Web Crypto API
 * @returns 64-character hex string
 */
export function generateRefreshToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hash a refresh token for secure storage - Edge compatible
 * Uses Web Crypto API (SubtleCrypto)
 * @param token Plain refresh token
 * @returns SHA-256 hash as hex string
 */
export async function hashRefreshToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Get refresh token expiry date
 * @returns Date object for expiry
 */
export function getRefreshTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  return expiry;
}

/**
 * Check if access token is close to expiry (within 2 minutes)
 * Used for proactive refresh - Edge compatible
 */
export async function isTokenExpiringSoon(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.exp) return true;
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    const twoMinutes = 2 * 60 * 1000;
    return Date.now() > expiryTime - twoMinutes;
  } catch {
    return true;
  }
}
