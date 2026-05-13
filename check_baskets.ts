import { prisma } from "./packages/database/index";

async function main() {
  const baskets = await prisma.basket.findMany({ select: { id: true, name: true, status: true, currentAmount: true, goalAmount: true } });
  console.log(baskets);
}
main().catch(console.error).finally(() => prisma.$disconnect());
