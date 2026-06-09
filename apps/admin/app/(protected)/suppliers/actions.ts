"use server";

import { prisma } from "@chowvest/database";
import { revalidatePath } from "next/cache";

export async function createSupplier(data: { name: string; phoneNumber: string; location: string }) {
  try {
    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        location: data.location,
        isActive: true,
      },
    });

    revalidatePath("/suppliers");
    return { success: true, supplier };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSupplier(id: string, data: { name?: string; phoneNumber?: string; location?: string; isActive?: boolean }) {
  try {
    const supplier = await prisma.supplier.update({
      where: { id },
      data,
    });

    revalidatePath("/suppliers");
    return { success: true, supplier };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSupplier(id: string) {
  try {
    await prisma.supplier.delete({
      where: { id },
    });

    revalidatePath("/suppliers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
