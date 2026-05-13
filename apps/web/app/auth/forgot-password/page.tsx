"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContainer } from "@/components/auth-components/auth-container";
import { Button } from "@chowvest/ui";
import { Input } from "@chowvest/ui";
import { Label } from "@chowvest/ui";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";

export default function ForgotPassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      await axios.post("/api/auth/forgot-password", { email });
      toast.success("Reset code sent! Check your email.");
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error)
          ? error.response?.data?.error || "Failed to send reset code"
          : "Failed to send reset code";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <div className="w-full max-w-md">
        <div className="space-y-2 text-center md:text-left mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Forgot your password?
          </h2>
          <p className="text-muted-foreground">
            Enter your email and we&apos;ll send you a 6-digit code to reset
            your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{errorMsg}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 h-10 cursor-pointer"
          >
            {isLoading ? "Sending code..." : "Send Reset Code"}
          </Button>
        </form>

        <div className="text-center text-sm mt-6">
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
