"use client";
import { useState } from "react";
import { AuthContainer } from "@/components/auth-components/auth-container";
import { SignIn } from "@/components/auth-components/sign-in";
import { SignUp } from "@/components/auth-components/sign-up";
import { VerifyEmail } from "@/components/auth-components/verify-email";

type AuthView = "signIn" | "signUp" | "verifyEmail";

export default function Auth() {
  const [view, setView] = useState<AuthView>("signIn");
  const [pendingEmail, setPendingEmail] = useState("");

  const handleVerify = (email: string) => {
    setPendingEmail(email);
    setView("verifyEmail");
  };

  return (
    <AuthContainer>
      {view === "verifyEmail" ? (
        <VerifyEmail
          email={pendingEmail}
          onBack={() => setView("signUp")}
        />
      ) : view === "signUp" ? (
        <SignUp
          onToggle={() => setView("signIn")}
          onVerify={handleVerify}
        />
      ) : (
        <SignIn onToggle={() => setView("signUp")} />
      )}
    </AuthContainer>
  );
}
