import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@chowvest/database";
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiry,
  setAuthCookies,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    console.log("DEBUG: Login attempt for:", email);

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        profileImage: true,
        password: true,
        accountStatus: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check account status
    if (user.accountStatus !== "active") {
      return NextResponse.json(
        { error: "Account is suspended or closed" },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session
    const refreshToken = generateRefreshToken();
    const hashedRefreshToken = await hashRefreshToken(refreshToken);

    // Get request metadata for security tracking
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    await prisma.session.create({
      data: {
        sessionToken: hashedRefreshToken,
        userId: user.id,
        expires: getRefreshTokenExpiry(),
        ipAddress,
        userAgent,
      },
    });

    // Generate access token
    const accessToken = await generateAccessToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Create response with cookies
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: userWithoutPassword,
      },
      { status: 200 }
    );

    setAuthCookies(response, accessToken, refreshToken);

    console.log("✅ User logged in:", user.email);

    return response;
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json({ error: "Login failed", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
