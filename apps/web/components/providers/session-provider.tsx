"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  profileImage: string | null;
  location: string | null;
  createdAt: string;
  hasCompletedOnboarding: boolean;
}

interface SessionContextType {
  user: SessionUser | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const response = await axios.get("/api/auth/session");
      setUser(response.data.user || null);
    } catch (error) {
      console.error("Failed to fetch session:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, refetch: fetchSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
