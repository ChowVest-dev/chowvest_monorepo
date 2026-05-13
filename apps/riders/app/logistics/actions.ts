"use server";

import { prisma } from "@chowvest/database";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { compare } from "bcryptjs"; // Need to ensure bcryptjs is in dependencies

export async function loginLogistics(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const company = await prisma.logisticsCompany.findUnique({
      where: { email },
    });

    if (!company) {
      return { error: "Invalid credentials" };
    }

    const isValid = await compare(password, company.password);
    if (!isValid) {
      return { error: "Invalid credentials" };
    }

    if (!company.isActive) {
      return { error: "Account suspended. Contact Chowvest support." };
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("logistics_session", company.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    redirect("/logistics/dashboard");
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    return { error: error.message || "An error occurred during login" };
  }
}

export async function registerLogistics(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !phoneNumber || !password) {
    return { error: "All fields are required" };
  }

  try {
    const { hash } = await import("bcryptjs");
    
    // Check if email already exists
    const existing = await prisma.logisticsCompany.findUnique({
      where: { email },
    });

    if (existing) {
      return { error: "A company with this email already exists" };
    }

    const hashedPassword = await hash(password, 10);

    const company = await prisma.logisticsCompany.create({
      data: {
        name,
        email,
        phoneNumber,
        password: hashedPassword,
      },
    });

    // Send notification emails
    try {
      const { sendLogisticsWelcomeEmail, sendAdminLogisticsNotification } = await import("@/lib/email");
      await Promise.all([
        sendLogisticsWelcomeEmail(email, name),
        sendAdminLogisticsNotification({ name, email, phoneNumber })
      ]);
    } catch (emailError) {
      console.error("Failed to send registration emails:", emailError);
      // We don't fail the registration if emails fail, but we log it
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("logistics_session", company.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    redirect("/logistics/dashboard");
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    return { error: error.message || "An error occurred during registration" };
  }
}

export async function addRider(prevState: any, formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const loginPin = formData.get("loginPin") as string;

  if (!fullName || !phoneNumber || !loginPin) {
    return { error: "All fields are required" };
  }

  try {
    const cookieStore = await cookies();
    const companyId = cookieStore.get("logistics_session")?.value;

    if (!companyId) {
      return { error: "Session expired. Please log in again." };
    }

    // Check if phone number is already taken
    const existing = await prisma.rider.findUnique({
      where: { phoneNumber },
    });

    if (existing) {
      return { error: "A rider with this phone number is already registered." };
    }

    const { hash } = await import("bcryptjs");
    const hashedPin = await hash(loginPin, 10);

    await prisma.rider.create({
      data: {
        fullName,
        phoneNumber,
        loginPin: hashedPin,
        companyId: companyId,
        isActive: true,
      },
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "An error occurred while adding rider" };
  }
}

export async function assignRiderToDelivery(deliveryId: string, riderId: string) {
  try {
    const cookieStore = await cookies();
    const companyId = cookieStore.get("logistics_session")?.value;

    if (!companyId) {
      throw new Error("Session expired");
    }

    // Verify this company owns the delivery
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery || delivery.logisticsCompanyId !== companyId) {
      throw new Error("Unauthorized assignment");
    }

    // Update the delivery with the rider but DO NOT move status automatically.
    // Order stays PENDING until the rider arrives at the hub.
    await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        riderId,
      },
    });

    revalidatePath("/logistics/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to assign rider" };
  }
}

export async function logoutLogistics() {
  const cookieStore = await cookies();
  cookieStore.delete("logistics_session");
  redirect("/");
}
