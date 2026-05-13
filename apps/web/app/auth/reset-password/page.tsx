"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContainer } from "@/components/auth-components/auth-container";
import { Button } from "@chowvest/ui";
import { Input } from "@chowvest/ui";
import { Label } from "@chowvest/ui";
import { ShieldCheck, Eye, EyeOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState<"otp" | "password">("otp");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\s/g, "")
      .slice(0, 6);
    const newOtp = Array(6).fill("");
    pasted.split("").forEach((char, i) => {
      if (/^[0-9]$/.test(char)) newOtp[i] = char;
    });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((v) => !v);
    const focusIndex = nextEmpty >= 0 ? nextEmpty : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleOtpContinue = () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setError("");
    setStep("password");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await axios.post("/api/auth/reset-password", {
        email: emailFromQuery,
        otp: otp.join(""),
        newPassword,
      });
      toast.success("Password reset successfully! Please sign in.");
      router.push("/auth");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to reset password"
        : "Failed to reset password";
      setError(message);
      toast.error(message);

      // If the error is OTP-related, go back to OTP step
      if (
        message.includes("Invalid code") ||
        message.includes("expired") ||
        message.includes("Maximum attempts") ||
        message.includes("No pending")
      ) {
        setStep("otp");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");
    setOtp(Array(6).fill(""));
    setStep("otp");
    try {
      await axios.post("/api/auth/forgot-password", {
        email: emailFromQuery,
      });
      toast.success("A new reset code has been sent to your email.");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to resend code"
        : "Failed to resend code";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthContainer>
      <div className="w-full max-w-md">
        <div className="space-y-2 text-center md:text-left mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            {step === "otp" ? "Enter reset code" : "Set new password"}
          </h2>
          <p className="text-muted-foreground">
            {step === "otp" ? (
              <>
                We sent a 6-digit code to{" "}
                <span className="font-medium text-foreground">
                  {emailFromQuery}
                </span>
                . It expires in 30 minutes.
              </>
            ) : (
              "Create a strong password for your account."
            )}
          </p>
        </div>

        {step === "otp" ? (
          /* ── OTP Step ── */
          <div className="space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div
              className="flex gap-2 justify-between"
              onPaste={handlePaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              ))}
            </div>

            <Button
              type="button"
              disabled={otp.join("").length < 6}
              onClick={handleOtpContinue}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 h-10 cursor-pointer"
            >
              Continue
            </Button>

            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the email?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" /> Sending...
                    </>
                  ) : (
                    "Resend code"
                  )}
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* ── Password Step ── */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-2 relative">
              <Label htmlFor="newPassword" className="text-foreground">
                New Password
              </Label>
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 transform translate-y-1/2 text-gray-500 hover:text-foreground transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 transform translate-y-1/2 text-gray-500 hover:text-foreground transition-colors duration-200"
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters with uppercase, lowercase, and a
              number.
            </p>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 h-10 cursor-pointer"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setStep("otp");
                setError("");
              }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
            >
              ← Back to code input
            </button>
          </form>
        )}

        <div className="text-center text-sm mt-4">
          <Link
            href="/auth"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </AuthContainer>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
