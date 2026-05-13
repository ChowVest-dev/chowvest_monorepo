import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@chowvest/database";

export async function PATCH() {
  try {
    const session = await requireSession();

    await prisma.user.update({
      where: { id: session.userId },
      data: { hasCompletedOnboarding: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking onboarding complete:", error);
    return NextResponse.json(
      { error: "Failed to update onboarding status" },
      { status: 401 }
    );
  }
}
