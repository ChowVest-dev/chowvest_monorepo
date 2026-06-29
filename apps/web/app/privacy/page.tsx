import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy – Chowvest",
  description:
    "Read the Chowvest Privacy Policy to understand how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-8">
            Last updated: June 2025 · Version 1.0
          </p>

          {/* PDF Embed */}
          <div className="w-full rounded-lg border border-border overflow-hidden bg-muted">
            <iframe
              src="/Privacy Policy – ChowVest.pdf"
              title="Chowvest Privacy Policy"
              className="w-full h-[80vh] min-h-[600px]"
            />
          </div>

          {/* Download fallback */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Having trouble viewing the document?
            </p>
            <a
              href="/Privacy Policy – ChowVest.pdf"
              download
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
            >
              Download Privacy Policy (PDF)
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
