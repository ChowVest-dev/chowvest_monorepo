import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  transpilePackages: ["@chowvest/ui", "@chowvest/shared", "@chowvest/database"],
  serverExternalPackages: ['@prisma/client'],
};

export default withPWA(nextConfig);
