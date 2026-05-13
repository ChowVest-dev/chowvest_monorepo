"use client";

import { useActionState, useEffect } from "react";
import { loginAdmin } from "@/app/actions";
import { toast } from "sonner";
import { Button } from "@chowvest/ui";
import { Input } from "@chowvest/ui";
import { Label } from "@chowvest/ui";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@chowvest/ui";
import { ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAdmin, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldAlert className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Staff Portal</CardTitle>
          <CardDescription>
            Secure access for Chowvest administrators.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="admin@chowvest.com" 
                required 
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required 
                className="bg-background"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-11 font-bold mt-4" disabled={pending}>
              {pending ? "Authenticating..." : "Sign In Securely"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
