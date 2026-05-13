"use client";

import { useActionState, useEffect } from "react";
import { registerLogistics } from "../actions";
import { toast } from "sonner";
import { Button } from "@chowvest/ui";
import { Input } from "@chowvest/ui";
import { Label } from "@chowvest/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@chowvest/ui";
import { Truck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LogisticsRegisterPage() {
  const [state, formAction, pending] = useActionState(registerLogistics, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4 py-12">
      <div className="w-full max-w-md mb-4">
        <Link href="/logistics/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-primary">
            <Truck className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Register Company</CardTitle>
          <CardDescription>
            Join the Chowvest logistics network.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="e.g. Chowvest Express" 
                required 
                className="py-6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
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
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input 
                id="phoneNumber" 
                name="phoneNumber" 
                placeholder="e.g. 08012345678" 
                required 
                className="py-6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="py-6"
              />
            </div>
            <Button className="w-full text-lg py-6 h-auto mt-2" type="submit" disabled={pending}>
              {pending ? "Creating Account..." : "Register & Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have a portal?{" "}
        <Link href="/logistics/login" className="text-primary font-bold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
