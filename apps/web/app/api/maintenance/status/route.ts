import { NextResponse } from "next/server";
import { getMaintenanceStatus } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = getMaintenanceStatus();

  return NextResponse.json(status, {
    headers: {
      // Cache for 30 seconds so clients don't hammer this endpoint,
      // but changes still propagate quickly.
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
