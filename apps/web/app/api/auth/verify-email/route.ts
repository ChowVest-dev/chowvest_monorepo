import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@chowvest/database";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiry,
  setAuthCookies,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const verificationRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: email.toLowerCase(),
        type: "email_verification",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { error: "No pending verification found for this email" },
        { status: 404 }
      );
    }

    if (verificationRecord.attempts >= 5) {
      return NextResponse.json(
        { error: "Maximum attempts reached. Please request a new code." },
        { status: 429 }
      );
    }

    if (new Date() > verificationRecord.expires) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new code." },
        { status: 400 }
      );
    }

    if (verificationRecord.token !== otp) {
      await prisma.verificationToken.update({
        where: {
          identifier_token_type: {
             identifier: verificationRecord.identifier,
             token: verificationRecord.token,
             type: verificationRecord.type
          }
        },
        data: { attempts: { increment: 1 } },
      });

      const remainingRef = 5 - (verificationRecord.attempts + 1);

      return NextResponse.json(
        { error: `Invalid code. ${remainingRef} attempts remaining.` },
        { status: 400 }
      );
    }

    // Success! Update user.
    const user = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { emailVerified: true },
    });

    // Cleanup the token
    await prisma.verificationToken.delete({
       where: {
          identifier_token_type: {
             identifier: verificationRecord.identifier,
             token: verificationRecord.token,
             type: verificationRecord.type
          }
        }
    });

    // Create session
    const refreshToken = generateRefreshToken();
    const hashedRefreshToken = await hashRefreshToken(refreshToken);

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

    const accessToken = await generateAccessToken(user.id);

    const response = NextResponse.json(
      { success: true, message: "Email verified successfully", user },
      { status: 200 }
    );

    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    console.error("❌ Email verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
