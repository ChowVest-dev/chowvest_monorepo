"use server";

import { prisma } from "@chowvest/database";
import { revalidatePath } from "next/cache";

const MARKET_PATHS = ["/market", "/market/savings", "/market/marketplace"];
const revalidateAll = () => MARKET_PATHS.forEach((p) => revalidatePath(p));

export async function updateCommodityPrice(commodityId: string, newPrice: number) {
  if (isNaN(newPrice) || newPrice <= 0) throw new Error("Invalid price");
  await prisma.commodity.update({
    where: { id: commodityId },
    data: { price: newPrice, updatedAt: new Date() },
  });
  revalidateAll();
}

export async function toggleCommodityStatus(commodityId: string, isActive: boolean) {
  await prisma.commodity.update({
    where: { id: commodityId },
    data: { isActive, updatedAt: new Date() },
  });
  revalidateAll();
}

export async function createCommodity(data: {
  name: string;
  sku: string;
  category: string;
  brand?: string;
  price: number;
  unit: string;
  size: number;
  image?: string;
  description?: string;
  marketType?: string;
}) {
  if (!data.name || !data.sku || !data.category || !data.unit || data.price <= 0 || data.size <= 0) {
    throw new Error("All required fields must be valid.");
  }
  await prisma.commodity.create({
    data: {
      name: data.name,
      sku: data.sku.toUpperCase(),
      category: data.category,
      brand: data.brand || null,
      price: data.price,
      unit: data.unit,
      size: data.size,
      image: data.image || null,
      description: data.description || null,
      marketType: data.marketType ?? "SAVINGS",
      isActive: true,
    },
  });
  revalidateAll();
}

export async function updateCommodity(
  commodityId: string,
  data: {
    name?: string;
    sku?: string;
    category?: string;
    brand?: string | null;
    price?: number;
    unit?: string;
    size?: number;
    image?: string | null;
    description?: string | null;
    marketType?: string;
  }
) {
  if (data.price !== undefined && (isNaN(data.price) || data.price <= 0))
    throw new Error("Invalid price");
  if (data.size !== undefined && (isNaN(data.size) || data.size <= 0))
    throw new Error("Invalid size");

  await prisma.commodity.update({
    where: { id: commodityId },
    data: { ...data, updatedAt: new Date() },
  });
  revalidateAll();
}

export async function updatePlatformConfig(key: string, value: string) {
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue < 0) throw new Error("Value must be a non-negative number");

  await prisma.platformConfig.upsert({
    where: { key },
    update: { value: String(numValue) },
    create: { key, value: String(numValue), label: key },
  });
  revalidateAll();
}
