import prisma from "../lib/db";

async function main() {
  const txs = await prisma.transaction.findMany({
    where: { type: 'SERVICE_FEE' },
    take: 5
  });
  console.log(txs);
}

main();
