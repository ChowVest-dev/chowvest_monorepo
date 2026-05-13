"use client";

import { Wrench, Sprout, RefreshCw } from "lucide-react";

export default function MaintenanceContent({
  message,
}: {
  message: string | null;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-[0.07]"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            animation: "pulse-slow 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] rounded-full opacity-[0.05]"
          style={{
            background:
              "radial-gradient(circle, var(--secondary) 0%, transparent 70%)",
            animation: "pulse-slow 8s ease-in-out infinite 2s",
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full opacity-[0.04]"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            animation: "pulse-slow 7s ease-in-out infinite 1s",
          }}
        />
      </div>

      {/* Main content card */}
      <div className="relative z-10 w-full max-w-lg mx-6">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-10 text-center space-y-8">
          {/* Animated icon container */}
          <div className="flex justify-center">
            <div
              className="relative w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--secondary))",
              }}
            >
              {/* Spinning gear ring */}
              <div
                className="absolute inset-0 rounded-full border-4 border-dashed opacity-30"
                style={{
                  borderColor: "var(--primary-foreground)",
                  animation: "spin-slow 12s linear infinite",
                }}
              />

              <Wrench
                className="w-10 h-10 text-primary-foreground"
                style={{ animation: "wrench-wobble 3s ease-in-out infinite" }}
              />

              {/* Live pulse indicator */}
              <div className="absolute -top-1 -right-1">
                <span className="relative flex h-4 w-4">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: "var(--secondary)" }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-4 w-4 border-2"
                    style={{
                      backgroundColor: "var(--secondary)",
                      borderColor: "var(--card)",
                    }}
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Logo + heading */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sprout className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-foreground tracking-tight">
                Chowvest
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              We&apos;re improving things
            </h1>

            <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
              {message ||
                "Our team is performing scheduled maintenance to make Chowvest even better. We'll be back shortly."}
            </p>
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-center gap-3 py-4 px-5 rounded-xl bg-accent/50">
            <div className="relative flex h-3 w-3">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: "var(--secondary)" }}
              />
              <span
                className="relative inline-flex rounded-full h-3 w-3"
                style={{ backgroundColor: "var(--secondary)" }}
              />
            </div>
            <span className="text-sm font-medium text-foreground">
              Maintenance in progress
            </span>
          </div>

          {/* Refresh hint */}
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Check again
          </button>

          <p className="text-xs text-muted-foreground">
            Your savings and data are safe. This page will update automatically
            when we&apos;re back.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          Need help?{" "}
          <a
            href="mailto:hello@chowvest.com"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Contact support
          </a>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.07;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.12;
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes wrench-wobble {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-12deg);
          }
          75% {
            transform: rotate(12deg);
          }
        }
      `}</style>
    </div>
  );
}
