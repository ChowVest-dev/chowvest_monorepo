import prisma from "../lib/db";

async function main() {
  console.log("Renaming historical combined fees to DELIVERY_FEE...");
  try {
    const result = await prisma.$executeRawUnsafe(`
      UPDATE transactions 
      SET type = 'DELIVERY_FEE' 
      WHERE type = 'SERVICE_FEE' 
      AND description LIKE 'Delivery and Service Fee for%';
    `);
    console.log(`Updated ${result} rows.`);
  } catch (e) {
    console.error("Migration error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
