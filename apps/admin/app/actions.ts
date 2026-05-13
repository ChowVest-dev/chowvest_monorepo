"use server";

import { prisma } from "@chowvest/database";
import bcrypt from "bcryptjs";
import { generateAdminToken, setAdminAuthCookiesAction, clearAdminAuthCookies } from "@/lib/auth/admin";
import { generateRefreshToken, hashRefreshToken } from "@/lib/auth/tokens";
import { redirect } from "next/navigation";

export async function loginAdmin(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please provide both email and password" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { error: "Access Denied: Customer accounts cannot log in here. Please use a dedicated staff email." };
    }

    let admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      // Auto-register the first 4 admins
      const count = await prisma.admin.count();
      if (count < 5) {
        const hashedPassword = await bcrypt.hash(password, 10);
        admin = await prisma.admin.create({
          data: {
            email: email.toLowerCase(),
            password: hashedPassword,
            fullName: email.split("@")[0],
            role: "SUPER_ADMIN",
            emailVerified: new Date(),
            isActive: true,
          }
        });
      } else {
        return { error: "Invalid credentials" };
      }
    } else {
      if (!admin.isActive) {
        return { error: "This admin account is deactivated" };
      }

      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return { error: "Invalid credentials" };
      }
    }

    // Success! Generate dual tokens
    const accessToken = await generateAdminToken(admin.id, admin.role);
    const refreshToken = generateRefreshToken();
    const hashedRefreshToken = await hashRefreshToken(refreshToken);

    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30 days

    // Update session tracking with hashed refresh token instead of JWT
    await prisma.adminSession.create({
      data: {
        adminId: admin.id,
        sessionToken: hashedRefreshToken,
        expires,
      },
    });

    await setAdminAuthCookiesAction(accessToken, refreshToken);

  } catch (error) {
    console.error("Admin login error", error);
    return { error: "Something went wrong during login" };
  }
  
  redirect("/");
}

export async function logoutAdmin() {
  await clearAdminAuthCookies();
  redirect("/login");
}
