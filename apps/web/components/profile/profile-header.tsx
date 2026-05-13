import { Avatar, AvatarFallback, AvatarImage } from "@chowvest/ui";
import { Button } from "@chowvest/ui";
import { Card } from "@chowvest/ui";
import { Camera, MapPin } from "lucide-react";
import { SignOutButton } from "../auth-components/sign-out-button";

interface UserProps {
  fullName: string;
  email: string;
  location?: string | null;
}

export function ProfileHeader({ user }: { user: UserProps }) {
  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src="/placeholder.svg?height=96&width=96" />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {user.fullName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full shadow-lg"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-foreground">
            {user.fullName}
          </h1>
          <p className="text-muted-foreground mt-1">{user.email}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{user.location || "Not specified"}</span>
          </div>
        </div>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </div>
    </Card>
  );
}
