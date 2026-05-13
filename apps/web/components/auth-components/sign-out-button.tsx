"use client";

import { Button } from "@chowvest/ui";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

import { useSession } from "@/components/providers/session-provider";

export function SignOutButton() {
  const router = useRouter();
  const { refetch } = useSession();

  const handleSignOut = async () => {
    try {
      await axios.post("/api/auth/logout");
      toast.success("Logged out successfully");
      await refetch(); // Clear session state immediately
      router.push("/auth");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </Button>
  );
}
