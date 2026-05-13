"use client";

import { Button, Input, Label } from "@chowvest/ui";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loginRider } from "./actions";
import { useState } from "react";

export default function RiderLogin() {
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError("");
    try {
      await loginRider(formData);
    } catch (err: any) {
      setError(err.message);
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Selection
        </Link>
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-accent rounded-2xl mx-auto flex items-center justify-center mb-6">
            <img src="/chowvest-logo-nobg.png" alt="Chowvest logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Rider Login</h1>
          <p className="text-sm text-muted-foreground">Enter the details provided by your dispatcher</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" type="tel" placeholder="e.g. 08012345678" className="text-lg py-6" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pin">Login PIN</Label>
            <Input id="pin" name="pin" type="password" placeholder="••••" maxLength={4} className="text-center text-2xl tracking-widest py-6" required />
          </div>
          <Button className="w-full text-lg py-6 h-auto" type="submit" disabled={isPending}>
            {isPending ? "Logging in..." : "Start Riding"}
          </Button>
        </form>
      </div>
    </div>
  );
}
