"use server";

import { prisma } from "@chowvest/database";
import { requireAdminSession } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

export async function toggleUserSuspension(userId: string) {
  await requireAdminSession();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const newStatus = user.accountStatus === "active" ? "suspended" : "active";
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      accountStatus: newStatus,
      suspendedAt: newStatus === "suspended" ? new Date() : null,
      suspensionReason: newStatus === "suspended" ? "Admin forced suspension" : null,
    }
  });

  revalidatePath(`/users/${userId}`);
  revalidatePath(`/users`);
  return { success: true, status: newStatus };
}

export async function forceLogoutUser(userId: string) {
  await requireAdminSession();

  // Delete all active sessions to force re-authentication
  await prisma.session.deleteMany({
    where: { userId }
  });

  revalidatePath(`/users/${userId}`);
  return { success: true };
}

export async function creditUserWallet(userId: string, amount: number) {
  await requireAdminSession();

  if (amount <= 0) throw new Error("Amount must be positive");

  const wallet = await prisma.wallet.findUnique({
    where: { userId }
  });

  if (!wallet) throw new Error("Wallet not found");
  if (wallet.status === "frozen") throw new Error("Cannot credit frozen wallet");

  // Create CREDIT transaction and update wallet atomically
  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: "CREDIT_USER",
        amount,
        netAmount: amount, // Assuming no fees for admin direct credit
        description: "Admin manual credit / Refund",
        status: "COMPLETED",
        balanceBefore: wallet.balance,
        balanceAfter: Number(wallet.balance) + amount,
        completedAt: new Date(),
        metadata: { adminCredited: true }
      }
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: amount },
        totalDeposits: { increment: amount }
      }
    })
  ]);

  revalidatePath(`/users/${userId}`);
  return { success: true };
}
