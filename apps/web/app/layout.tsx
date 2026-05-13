import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { Toaster } from "@chowvest/ui";
import { MaintenanceBanner } from "@/components/maintenance/MaintenanceBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chowvest - Small Savings, Big meals",
  description: "Secure your food future with smart savings.",
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
          <OnboardingTour />
        </Providers>
      </body>
    </html>
  );
}

