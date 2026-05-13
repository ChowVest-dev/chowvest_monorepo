"use server";

import { prisma } from "@chowvest/database";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare } from "bcryptjs";

export async function loginRider(formData: FormData) {
  const phone = formData.get("phone") as string;
  const pin = formData.get("pin") as string;

  if (!phone || !pin) {
    throw new Error("Phone and PIN are required");
  }

  // Find the rider
  const rider = await prisma.rider.findUnique({
    where: { phoneNumber: phone }
  });

  if (!rider) {
    throw new Error("Rider not found");
  }

  const isValidPin = await compare(pin, rider.loginPin);
  if (!isValidPin) {
    throw new Error("Invalid PIN");
  }

  if (!rider.isActive) {
    throw new Error("Account suspended. Contact your dispatcher.");
  }

  // Set auth cookie
  const cookieStore = await cookies();
  cookieStore.set("rider_session", rider.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  redirect("/rider/dashboard");
}

export async function logoutRider() {
  const cookieStore = await cookies();
  cookieStore.delete("rider_session");
  redirect("/rider/login");
}
