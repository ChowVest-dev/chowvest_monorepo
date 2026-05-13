import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        user: session.user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Session error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
