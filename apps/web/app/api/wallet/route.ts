import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@chowvest/database";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: session.user.id,
        },
        include: {
          transactions: true,
        },
      });
    }

    // Serialize wallet data
    const serializedWallet = {
      ...wallet,
      balance: wallet.balance.toString(),
      totalDeposits: wallet.totalDeposits.toString(),
      totalSpent: wallet.totalSpent.toString(),
      pendingDeposits: wallet.pendingDeposits.toString(),
      transactions: wallet.transactions.map((t: any) => ({
        ...t,
        amount: t.amount.toString(),
        netAmount: t.netAmount.toString(),
        balanceBefore: t.balanceBefore.toString(),
        balanceAfter: t.balanceAfter.toString(),
        fee: t.fee?.toString(),
        processorFee: t.processorFee?.toString(),
      })),
    };

    return NextResponse.json({ wallet: serializedWallet }, { status: 200 });
  } catch (error) {
    console.error("Fetch wallet error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}
