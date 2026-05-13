/**
 * Seed script: DELETES all existing commodities and re-inserts the new set.
 * Run with:
 *   npx tsx scripts/seed-commodities.ts
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { prisma } from "@chowvest/database";
import { COMMODITIES } from "@/constants/commodities";

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 2,
  connectionTimeoutMillis: 15000,
});

const adapter = new PrismaPg(pool);

async function main() {
  console.log("🗑️  Deleting all existing commodities...");

  const deleted = await prisma.commodity.deleteMany({});
  console.log(`   Deleted ${deleted.count} old commodities.`);

  console.log(`\n🌱 Seeding ${COMMODITIES.length} new commodities...`);

  let created = 0;

  for (const c of COMMODITIES) {
    await prisma.commodity.create({
      data: {
        sku: c.sku,
        name: c.name,
        category: c.category,
        brand: c.brand,
        price: c.price,
        unit: c.unit,
        size: c.size,
        image: c.image,
        description: c.description,
        marketType: "SAVINGS",
        isActive: true,
      },
    });
    console.log(`   ✅ ${c.sku} — ${c.name} (${c.size}${c.unit})`);
    created++;
  }

  console.log(`\n✅ Done! ${created} commodities seeded.`);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
