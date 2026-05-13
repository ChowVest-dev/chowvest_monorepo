"use client";

import { useState } from "react";
import { Button } from "@chowvest/ui";
import { Input } from "@chowvest/ui";
import { Label } from "@chowvest/ui";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { FullPageLoader } from "@/components/loaders/full-page-loader";

interface SignUpProps {
  onToggle: () => void;
  onVerify: (email: string) => void;
}

export function SignUp({ onToggle, onVerify }: SignUpProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password || !phoneNumber) {
      setError("Please fill all fields");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post("/api/auth/register", {
        fullName,
        email,
        password,
        phoneNumber,
      });

      const data = response.data;

      toast.success("Account created! Please check your email for a verification code.");
      onVerify(email);
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.error || error.message || "Registration failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>

      <div className="w-full max-w-md">
        <div className="space-y-2 text-center md:text-left mb-2">
          <h2 className="text-3xl font-bold text-foreground">Join Chowvest</h2>
          <p className="text-muted-foreground">
            Start investing in food businesses today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isLoading}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="password" className="text-foreground">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-foreground">
              Phone
            </Label>
            <Input
              id="phone"
              name="phoneNumber"
              type="tel"
              placeholder="+234 800 000 0000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              disabled={isLoading}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              required
              disabled={isLoading}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the{" "}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
              >
                Privacy Policy
              </button>
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 h-10 cursor-pointer"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">OR</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-border hover:bg-accent"
          onClick={() => {
            // TODO: Implement Google OAuth sign-up
            toast.info("Google sign-up coming soon!");
          }}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            Already have an account?{" "}
          </span>
          <button
            type="button"
            onClick={onToggle}
            className="text-primary hover:underline font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>
    </>
  );
}
