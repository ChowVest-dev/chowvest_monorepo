import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@chowvest/database";
import { WalletPageClient } from "./client-wrapper";
import { WalletSkeleton } from "@/components/loaders/wallet-skeleton";
//import { WalletSync } from "@/hooks/wallet-sync";

export default async function WalletPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth");
  }

  // Get or create wallet
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
      data: { userId: session.user.id },
      include: { transactions: true },
    });
  }

  // Get user's baskets
  const baskets = await prisma.basket.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      goalAmount: true,
      currentAmount: true,
      status: true,
    },
  });

  // Serialize wallet data for client
  const serializedWallet = {
    balance: Number(wallet.balance),
    totalDeposits: Number(wallet.totalDeposits),
    totalSpent: Number(wallet.totalSpent),
    transactions: wallet.transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      netAmount: Number(t.netAmount ?? t.amount),
      metadata: t.metadata as { baseAmount?: number } | null,
      description: t.description,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      basketId: t.basketId,
    })),
  };

  const serializedBaskets = baskets.map((b) => ({
    id: b.id,
    name: b.name,
    goalAmount: Number(b.goalAmount),
    currentAmount: Number(b.currentAmount),
    status: b.status,
  }));

  return (
    <Suspense fallback={<WalletSkeleton />}>
      <WalletPageClient wallet={serializedWallet} baskets={serializedBaskets} />
    </Suspense>
  );
}
