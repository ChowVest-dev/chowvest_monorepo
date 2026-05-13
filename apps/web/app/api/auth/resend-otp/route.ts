import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@chowvest/database";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
    }

    // Delete any existing pending tokens for this email
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email.toLowerCase(),
        type: "email_verification",
      },
    });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token: otp,
        type: "email_verification",
        expires: expiry,
        attempts: 0,
      },
    });

    await sendVerificationEmail(email.toLowerCase(), otp);

    return NextResponse.json({ success: true, message: "Verification code sent" });
  } catch (error) {
    console.error("❌ Resend OTP error:", error);
    return NextResponse.json({ error: "Failed to resend code" }, { status: 500 });
  }
}
