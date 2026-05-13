import prisma from "@/lib/db";

async function diag() {
  try {
    const wallets = await prisma.wallet.findMany({
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    console.log("WALLETS DIAGNOSTIC:");
    wallets.forEach((w) => {
      console.log(`Wallet ID: ${w.id}`);
      console.log(`User ID: ${w.userId}`);
      console.log(`Balance: ${w.balance.toString()}`);
      console.log(`Total Deposits: ${w.totalDeposits.toString()}`);
      console.log("Recent Transactions:");
      w.transactions.forEach((t) => {
        console.log(
          `  - [${t.status}] ${
            t.type
          }: ${t.amount.toString()} (${t.createdAt.toISOString()})`
        );
      });
      console.log("--------------------");
    });
  } catch (error) {
    console.error("DIAG ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

diag();
