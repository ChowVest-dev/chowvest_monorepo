import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@chowvest/ui", "@chowvest/shared", "@chowvest/database"],
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
