import { prisma } from "@chowvest/database";
import {
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
} from "./cookies";
import { verifyAccessToken, hashRefreshToken } from "./tokens";

interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  profileImage: string | null;
  location: string | null;
  createdAt: string;
  hasCompletedOnboarding: boolean;
}

interface SessionResult {
  userId: string;
  user: SessionUser;
}

/**
 * Get the current session from cookies (for server components and actions)
 * @returns Session with userId and user data, or null if not authenticated
 */
export async function getSession(): Promise<SessionResult | null> {
  try {
    // Try access token first
    const accessToken = await getAccessTokenFromCookies();
    if (accessToken) {
      const payload = await verifyAccessToken(accessToken);
      if (payload) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            email: true,
            fullName: true,
            phoneNumber: true,
            profileImage: true,
            location: true,
            createdAt: true,
            hasCompletedOnboarding: true,
            accountStatus: true,
            sessions: { select: { id: true }, take: 1 }
          },
        });
        // Enforce suspension and force logout immediately
        if (user && user.accountStatus === "active" && user.sessions.length > 0) {
          return {
            userId: user.id,
            user: {
              ...user,
              createdAt: user.createdAt.toISOString(),
            },
          };
        }
      }
    }

    // Access token invalid/expired, try refresh token
    const refreshToken = await getRefreshTokenFromCookies();
    if (refreshToken) {
      const hashedToken = await hashRefreshToken(refreshToken);
      const session = await prisma.session.findUnique({
        where: { sessionToken: hashedToken },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phoneNumber: true,
              profileImage: true,
              location: true,
              createdAt: true,
              hasCompletedOnboarding: true,
              accountStatus: true,
            },
          },
        },
      });

      if (session && session.expires > new Date() && session.user.accountStatus === "active") {
        return {
          userId: session.userId,
          user: {
            ...session.user,
            createdAt: session.user.createdAt.toISOString(),
          },
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Require a valid session, throw if not authenticated
 * @throws Error if not authenticated
 */
export async function requireSession(): Promise<SessionResult> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Get just the user ID from session (lightweight check)
 * @returns User ID or null
 */
export async function getSessionUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId || null;
}
