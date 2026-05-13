"use client";

import { useActionState, useEffect } from "react";
import { loginLogistics } from "../actions";
import { toast } from "sonner";
import { Button } from "@chowvest/ui";
import { Input } from "@chowvest/ui";
import { Label } from "@chowvest/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@chowvest/ui";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LogisticsLoginPage() {
  const [state, formAction, pending] = useActionState(loginLogistics, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md mb-4">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Selection
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="w-16 h-16 bg-accent rounded-2xl mx-auto flex items-center justify-center mb-6">
            <img src="/chowvest-logo-nobg.png" alt="Chowvest logo" className="w-10 h-10 object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Logistics Portal</CardTitle>
          <CardDescription>
            Secure access for logistics managers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="manager@logistics.com" 
                required 
                className="py-6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="py-6"
              />
            </div>
            <Button className="w-full text-lg py-6 h-auto" type="submit" disabled={pending}>
              {pending ? "Signing in..." : "Access Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Chowvest?{" "}
        <Link href="/logistics/register" className="text-primary font-bold hover:underline">
          Register your company
        </Link>
      </p>
    </div>
  );
}
