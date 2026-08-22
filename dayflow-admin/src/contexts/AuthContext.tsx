"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { AuthenticatedUser } from "@/types";
import { login as apiLogin, getCurrentUser, clearSession, saveSession, getSavedUser, getToken } from "@/services/api";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateUser = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    // Use cached user from session first for instant load
    const cached = getSavedUser();
    if (cached) {
      setUser(cached);
      setLoading(false);
      return;
    }

    // Verify token is still valid
    try {
      const me = await getCurrentUser();
      setUser(me);
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { hydrateUser(); }, [hydrateUser]);

  const signIn = async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    // Only allow HR / ADMIN to access the admin portal
    if (result.user.role === "EMPLOYEE") {
      throw new Error("Access denied. Please use the Employee Portal instead.");
    }
    saveSession(result.token, result.user);
    setUser(result.user);
  };

  const signOut = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
