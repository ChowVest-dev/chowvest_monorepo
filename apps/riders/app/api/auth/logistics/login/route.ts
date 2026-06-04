import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@chowvest/database";
import { compare } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const company = await prisma.logisticsCompany.findUnique({
      where: { email },
    });

    if (!company) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await compare(password, company.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!company.isActive) {
      return NextResponse.json({ error: "Account suspended. Contact Chowvest support." }, { status: 403 });
    }

    const response = NextResponse.json({ success: true, message: "Logged in successfully" }, { status: 200 });

    response.cookies.set("logistics_session", company.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Logistics API Login error", error);
    return NextResponse.json({ error: error.message || "An error occurred during login" }, { status: 500 });
  }
}
