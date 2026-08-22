"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AdminShell } from "@/components/AdminShell";
import LoginPage from "@/app/login/page";
import type { ReactNode } from "react";

// AuthShell routes the user to either LoginPage or AdminShell + protected content.
export function AuthShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#F7F6F1", fontFamily: "'Lato', sans-serif", color: "#6D6A61",
      }}>
        Loading Dayflow…
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <AdminShell>{children}</AdminShell>;
}
