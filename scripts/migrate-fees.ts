import prisma from "@/lib/db";

async function main() {
  console.log("Renaming existing FEE transactions to SERVICE_FEE (if any)...");
  try {
    // We have to use raw query because the Prisma client we have currently 
    // might still expect FEE and not SERVICE_FEE (since we haven't regenerated yet).
    // Or we can just use the literal string.
    const result = await prisma.$executeRawUnsafe(`
      UPDATE transactions 
      SET type = 'SERVICE_FEE' 
      WHERE type = 'FEE';
    `);
    console.log(`Updated ${result} rows.`);
  } catch (e) {
    console.error("Migration error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
