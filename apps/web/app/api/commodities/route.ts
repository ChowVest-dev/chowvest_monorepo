import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@chowvest/database";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50")));

    const whereClause: any = { isActive: true };

    if (type && ["SAVINGS", "MARKETPLACE"].includes(type)) {
      whereClause.OR = [{ marketType: type }, { marketType: "BOTH" }];
    } else if (type === "BOTH") {
      whereClause.marketType = "BOTH";
    }

    const [commodities, total] = await Promise.all([
      prisma.commodity.findMany({
        where: whereClause,
        orderBy: [{ category: "asc" }, { name: "asc" }, { size: "asc" }],
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true, sku: true, name: true, category: true,
          brand: true, price: true, unit: true, size: true,
          image: true, marketType: true, isActive: true,
        },
      }),
      prisma.commodity.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: commodities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch commodities:", error);
    return NextResponse.json(
      { error: "Failed to fetch commodities" },
      { status: 500 }
    );
  }
}
