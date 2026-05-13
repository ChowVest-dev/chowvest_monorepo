import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@chowvest/database";
import { hashPassword, validatePassword } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Find the most recent password_reset token for this email
    const verificationRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        type: "password_reset",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { error: "No pending password reset found. Please request a new code." },
        { status: 404 }
      );
    }

    // Check max attempts (5)
    if (verificationRecord.attempts >= 5) {
      return NextResponse.json(
        { error: "Maximum attempts reached. Please request a new code." },
        { status: 429 }
      );
    }

    // Check expiry
    if (new Date() > verificationRecord.expires) {
      return NextResponse.json(
        { error: "Reset code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check OTP match
    if (verificationRecord.token !== otp) {
      await prisma.verificationToken.update({
        where: {
          identifier_token_type: {
            identifier: verificationRecord.identifier,
            token: verificationRecord.token,
            type: verificationRecord.type,
          },
        },
        data: { attempts: { increment: 1 } },
      });

      const remaining = 5 - (verificationRecord.attempts + 1);
      return NextResponse.json(
        { error: `Invalid code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` },
        { status: 400 }
      );
    }

    // OTP is valid — hash and update the password
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword },
    });

    // Clean up the token
    await prisma.verificationToken.delete({
      where: {
        identifier_token_type: {
          identifier: verificationRecord.identifier,
          token: verificationRecord.token,
          type: verificationRecord.type,
        },
      },
    });

    // Invalidate all existing sessions for security
    await prisma.session.deleteMany({
      where: {
        user: { email: normalizedEmail },
      },
    });

    // Log the security event
    await logSecurityEvent({
      eventType: "password_change",
      severity: "medium",
      description: `Password reset via OTP for ${normalizedEmail}`,
    });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. Please sign in with your new password.",
    });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
