import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@chowvest/database";
import {
  getRefreshTokenFromCookies,
  hashRefreshToken,
  clearAuthCookies,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = await getRefreshTokenFromCookies();

    if (refreshToken) {
      // Delete session from database
      const hashedToken = await hashRefreshToken(refreshToken);
      await prisma.session.deleteMany({
        where: { sessionToken: hashedToken },
      });
    }

    // Clear cookies
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    clearAuthCookies(response);

    console.log("✅ User logged out");

    return response;
  } catch (error) {
    console.error("❌ Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
