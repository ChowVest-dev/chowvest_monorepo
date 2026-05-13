import { Bell } from "lucide-react";
import { Button } from "@chowvest/ui";

interface DashboardHeaderProps {
  user: UserProps;
}

interface UserProps {
  fullName: string;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
          Good to see you, {user.fullName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Secure your kitchen's future with every top-up.
        </p>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full bg-transparent"
      >
        <Bell className="w-5 h-5" />
      </Button>
    </div>
  );
}
