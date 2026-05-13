import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@chowvest/database";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Rate limit: max 5 password reset requests per 15 minutes per email
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const rateLimited = await checkRateLimit({
      identifier: normalizedEmail,
      action: "password_reset_request",
      maxAttempts: 5,
      windowMinutes: 15,
    });

    if (rateLimited) {
      return NextResponse.json(
        { error: "Too many reset requests. Please try again later." },
        { status: 429 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always return success even if user not found (prevents email enumeration)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account with this email exists, a reset code has been sent.",
      });
    }

    // Delete any existing password reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: normalizedEmail,
        type: "password_reset",
      },
    });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Store the token
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: otp,
        type: "password_reset",
        expires: expiry,
        attempts: 0,
      },
    });

    // Send the email
    await sendPasswordResetEmail(normalizedEmail, user.fullName, otp);

    return NextResponse.json({
      success: true,
      message: "If an account with this email exists, a reset code has been sent.",
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
