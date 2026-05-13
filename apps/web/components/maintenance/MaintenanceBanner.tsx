"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export function MaintenanceBanner() {
  const [bannerText, setBannerText] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't fetch if already dismissed this session
    if (typeof window !== "undefined" && sessionStorage.getItem("maintenance-banner-dismissed")) {
      setDismissed(true);
      return;
    }

    fetch("/api/maintenance/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.banner) {
          setBannerText(data.banner);
        }
      })
      .catch(() => {
        // Silently fail — don't show a banner if the API is unreachable
      });
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("maintenance-banner-dismissed", "true");
    }
  };

  if (!bannerText || dismissed) return null;

  return (
    <div
      className="relative z-[100] w-full px-4 py-3 text-sm font-medium text-center"
      style={{
        background: "linear-gradient(135deg, #f59e0b, #d97706)",
        color: "#1c1917",
      }}
    >
      <div className="flex items-center justify-center gap-2 max-w-4xl mx-auto">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>{bannerText}</span>
        <button
          onClick={handleDismiss}
          className="ml-3 p-1 rounded-md hover:bg-black/10 transition-colors shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
