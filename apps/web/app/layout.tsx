import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { Toaster } from "@chowvest/ui";
import { MaintenanceBanner } from "@/components/maintenance/MaintenanceBanner";
import { PriceChangeModal } from "@/components/notifications/price-change-modal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const viewport: Viewport = {
  themeColor: "#16a34a",
};

export const metadata: Metadata = {
  title: "Chowvest - Small Savings, Big meals",
  description: "Secure your food future with smart savings.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Chowvest",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MaintenanceBanner />
        <Toaster />
        <Providers>
          {children}
          <PriceChangeModal />
          <OnboardingTour />
        </Providers>
      </body>
    </html>
  );
}

