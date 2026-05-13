"use client";

import { useState, useRef } from "react";
import { Button } from "@chowvest/ui";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { FullPageLoader } from "@/components/loaders/full-page-loader";
import { useSession } from "@/components/providers/session-provider";
import { Mail, RefreshCw } from "lucide-react";

interface VerifyEmailProps {
  email: string;
  onBack: () => void;
}

export function VerifyEmail({ email, onBack }: VerifyEmailProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { refetch } = useSession();

  const handleChange = (index: number, value: string) => {
    if (!/^[a-zA-Z0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.toUpperCase();
    setOtp(newOtp);
    setError("");

    // Move focus forward
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\s/g, "").toUpperCase().slice(0, 6);
    const newOtp = Array(6).fill("");
    pasted.split("").forEach((char, i) => {
      if (/^[A-Z0-9]$/.test(char)) newOtp[i] = char;
    });
    setOtp(newOtp);
    // Focus last filled or next empty
    const nextEmpty = newOtp.findIndex((v) => !v);
    const focusIndex = nextEmpty >= 0 ? nextEmpty : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await axios.post("/api/auth/verify-email", { email, otp: code });
      toast.success("Email verified successfully! Welcome to Chowvest!");
      setIsAuthenticating(true);
      await refetch();
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Verification failed"
          : "Verification failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");
    setOtp(Array(6).fill(""));
    try {
      await axios.post("/api/auth/resend-otp", { email });
      toast.success("A new verification code has been sent to your email.");
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Failed to resend code"
          : "Failed to resend code";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <FullPageLoader show={isAuthenticating} message="Verifying your email..." />

      <div className="w-full max-w-md">
        <div className="space-y-2 text-center md:text-left mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground">Check your email</h2>
          <p className="text-muted-foreground">
            We sent a 6-character code to{" "}
            <span className="font-medium text-foreground">{email}</span>. It expires in 30 minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* OTP Inputs */}
          <div className="flex gap-2 justify-between" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all uppercase"
              />
            ))}
          </div>

          <Button
            type="submit"
            disabled={isLoading || otp.join("").length < 6}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 h-10 cursor-pointer"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
            >
              {isResending ? (
                <><RefreshCw className="w-3 h-3 animate-spin" /> Sending...</>
              ) : (
                "Resend code"
              )}
            </button>
          </p>

          <button
            type="button"
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to sign up
          </button>
        </div>
      </div>
    </>
  );
}
