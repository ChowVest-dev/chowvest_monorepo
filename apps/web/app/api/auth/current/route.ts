import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@chowvest/database";
import { getSession } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fullName, email, phoneNumber, location } = await req.json();

    // Validation
    if (!fullName && !email && !phoneNumber && !location) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    // Check if email is being updated and if it's already taken
    if (email && email.toLowerCase() !== session.user.email.toLowerCase()) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 },
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fullName: fullName || undefined,
        email: email ? email.toLowerCase() : undefined,
        phoneNumber: phoneNumber || undefined,
        location: location || undefined,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        profileImage: true,
        location: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
