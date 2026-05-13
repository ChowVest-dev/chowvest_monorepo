import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@chowvest/database";
import { hashPassword } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, phoneNumber } = await req.json();

    // Validation
    if (!fullName || !email || !password || !phoneNumber) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
        phoneNumber,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        profileImage: true,
      },
    });

    //console.log("✅ User registered:", newUser);

    // Generate 6 digit OTP and save to VerificationToken
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token: otp,
        type: "email_verification",
        expires: expiry,
        attempts: 0,
      },
    });

    // Send the Verification Email using Resend
    await sendVerificationEmail(email.toLowerCase(), otp);

    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful. Please verify your email.",
        requireVerification: true,
      },
      { status: 201 }
    );

    return response;
  } catch (error) {
    console.error("❌ Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
