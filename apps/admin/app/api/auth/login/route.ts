import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@chowvest/database";
import bcrypt from "bcryptjs";
import { generateAdminToken } from "@/lib/auth/admin";
import { generateRefreshToken, hashRefreshToken } from "@/lib/auth/tokens";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!admin.isActive) {
      return NextResponse.json({ error: "This admin account is deactivated" }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const accessToken = await generateAdminToken(admin.id, admin.role);
    const refreshToken = generateRefreshToken();
    const hashedRefreshToken = await hashRefreshToken(refreshToken);

    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30 days

    await prisma.adminSession.create({
      data: {
        adminId: admin.id,
        sessionToken: hashedRefreshToken,
        expires,
      },
    });

    const response = NextResponse.json({ success: true, message: "Logged in successfully" }, { status: 200 });

    response.cookies.set("admin_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    response.cookies.set("admin_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Admin API Login error", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
