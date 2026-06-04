import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@chowvest/database";
import { compare } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, pin } = body;

    if (!phone || !pin) {
      return NextResponse.json({ error: "Phone and PIN are required" }, { status: 400 });
    }

    const rider = await prisma.rider.findUnique({
      where: { phoneNumber: phone }
    });

    if (!rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    const isValidPin = await compare(pin, rider.loginPin);
    if (!isValidPin) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    if (!rider.isActive) {
      return NextResponse.json({ error: "Account suspended. Contact your dispatcher." }, { status: 403 });
    }

    const response = NextResponse.json({ success: true, message: "Logged in successfully" }, { status: 200 });

    response.cookies.set("rider_session", rider.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Rider API Login error", error);
    return NextResponse.json({ error: error.message || "An error occurred during login" }, { status: 500 });
  }
}
