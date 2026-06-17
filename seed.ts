import { PrismaClient } from '@prisma/client';
import { COMMODITIES } from './apps/web/constants/commodities';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ${COMMODITIES.length} commodities...`);
  for (const c of COMMODITIES) {
    const commodity = await prisma.commodity.upsert({
      where: { sku: c.sku },
      update: {
        name: c.name,
        category: c.category,
        brand: c.brand || null,
        price: c.price,
        unit: c.unit,
        size: c.size,
        image: c.image,
        description: c.description,
        marketType: "SAVINGS",
        isActive: true,
      },
      create: {
        sku: c.sku,
        name: c.name,
        category: c.category,
        brand: c.brand || null,
        price: c.price,
        unit: c.unit,
        size: c.size,
        image: c.image,
        description: c.description,
        marketType: "SAVINGS",
        isActive: true,
      },
    });
    console.log(`Created/Updated commodity: ${commodity.name} (${commodity.sku})`);
  }
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
