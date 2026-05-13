"use client";

import { Card } from "@chowvest/ui";
import { Label } from "@chowvest/ui";
import { Input } from "@chowvest/ui";
import { Button } from "@chowvest/ui";
import { Switch } from "@chowvest/ui";
import React, { useState } from "react";
import axios from "axios";
import { useSession } from "../providers/session-provider";
import { useRouter } from "next/navigation";

interface UserProps {
  id: string;
  fullName: string;
  email: string;
  location?: string | null;
  phoneNumber?: string | null;
  createdAt: string;
}

export function ProfileSettings({ user }: { user: UserProps }) {
  const session = useSession();
  const router = useRouter();

  const [updateFullName, setUpdateFullName] = useState("");
  const [updateEmail, setUpdateEmail] = useState("");
  const [updatePhone, setUpdatePhone] = useState("");
  const [updateLocation, setUpdateLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdates = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setIsLoading(true);

      const res = await axios.put(`/api/auth/current`, {
        fullName: updateFullName || undefined,
        email: updateEmail || undefined,
        phoneNumber: updatePhone || undefined,
        location: updateLocation || undefined,
      });

      console.log("UPDATED", res.data);

      // TODO: Update local state via API refetch or state management

      // ✅ Trigger session update via refetch
      await session.refetch();

      // ✅ Force router refresh to get updated session from server
      router.refresh();

      setSuccess("Profile updated successfully!");

      // Clear form fields
      setUpdateFullName("");
      setUpdateEmail("");
      setUpdatePhone("");
      setUpdateLocation("");
    } catch (error: unknown) {
      console.error(error);
      let errorMessage = "Update failed";

      if (axios.isAxiosError(error)) {
        const data = error.response?.data as { error?: string } | undefined;
        errorMessage = data?.error || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">
          Personal Information
        </h3>

        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-md bg-green-50 border border-green-200 mb-4">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <form onSubmit={handleUpdates} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullname">Full Name</Label>
            <Input
              id="fullname"
              name="name"
              placeholder={user.fullName || "Enter full name"}
              value={updateFullName}
              onChange={(e) => setUpdateFullName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder={user.email}
              value={updateEmail}
              onChange={(e) => setUpdateEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              name="phoneNumber"
              placeholder={user.phoneNumber || "Enter phone number"}
              value={updatePhone}
              onChange={(e) => setUpdatePhone(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder={user.location || "Enter location"}
              value={updateLocation}
              onChange={(e) => setUpdateLocation(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">
          Preferences
        </h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates via email
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get SMS for transactions
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Goal Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Remind me about my goals
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Market Updates</Label>
              <p className="text-sm text-muted-foreground">
                Price changes and deals
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>
    </div>
  );
}
