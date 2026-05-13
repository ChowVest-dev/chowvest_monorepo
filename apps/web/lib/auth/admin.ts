import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { prisma } from "@chowvest/database";
import { generateRefreshToken, hashRefreshToken } from "./tokens";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
);
const ADMIN_ACCESS_TOKEN_COOKIE = "admin_access_token";
const ADMIN_REFRESH_TOKEN_COOKIE = "admin_refresh_token";
const ACCESS_TOKEN_EXPIRY = "15m"; // 15 mins to match default auth

interface AdminSessionPayload {
  adminId: string;
  role: string;
  type: "admin_access";
}

export async function generateAdminToken(adminId: string, role: string): Promise<string> {
  return new SignJWT({ adminId, role, type: "admin_access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

// For server actions where we interact directly with cookies instead of NextResponse
export async function setAdminAuthCookiesAction(accessToken: string, refreshToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 mins
  });
  cookieStore.set(ADMIN_REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearAdminAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  cookieStore.set(ADMIN_REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function verifyAdminToken(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== "admin_access") {
      return null;
    }
    return payload as unknown as AdminSessionPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;

  // 1. Try Fast Path Access Token
  if (accessToken) {
    const payload = await verifyAdminToken(accessToken);
    if (payload && payload.adminId) {
      const admin = await prisma.admin.findUnique({
        where: { id: payload.adminId },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          sessions: { select: { id: true }, take: 1 }
        },
      });

      if (admin && admin.isActive && admin.sessions.length > 0) return admin;
    }
  }

  // 2. Try Fallback Refresh Token
  const refreshToken = cookieStore.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) {
    const hashedToken = await hashRefreshToken(refreshToken);
    const session = await prisma.adminSession.findUnique({
      where: { sessionToken: hashedToken },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            isActive: true,
          }
        }
      }
    });

    if (session && session.expires > new Date() && session.admin.isActive) {
       return session.admin;
    }
  }

  return null;
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
