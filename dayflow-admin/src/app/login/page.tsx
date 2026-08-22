"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("admin@dayflow.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: unknown) {
      setError((err as Error).message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#F7F6F1", fontFamily: "'Lato', sans-serif",
    }}>
      <div style={{
        display: "flex", width: "100%", maxWidth: "900px", borderRadius: "1.5rem",
        overflow: "hidden", boxShadow: "0 8px 40px rgba(83,67,50,0.12)", border: "1px solid #DED9CF",
      }}>
        {/* Brand panel */}
        <div style={{
          flex: 1, background: "linear-gradient(160deg, #394032, #454F2D, #534332)",
          padding: "3rem 2.5rem", color: "#F5F1E7", display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          <div style={{ fontFamily: "'Aboreto', cursive", fontSize: "2rem", letterSpacing: "0.25em", color: "#9F7E4A" }}>
            DAYFLOW
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.75, marginTop: "0.5rem", fontStyle: "italic" }}>
            Every workday, perfectly aligned.
          </div>
          <div style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>✦ Workforce oversight & analytics</div>
            <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>✦ Leave request approvals</div>
            <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>✦ Payroll & compensation management</div>
          </div>
          <div style={{
            marginTop: "2rem", padding: "0.75rem 1rem", borderRadius: "0.75rem",
            background: "rgba(159,126,74,0.15)", border: "1px solid rgba(159,126,74,0.3)",
            fontSize: "0.75rem", color: "#9F7E4A", fontWeight: 600,
          }}>
            🔒 Admin Console — HR & Admin access only
          </div>
        </div>

        {/* Login form */}
        <div style={{ flex: 1, background: "#fff", padding: "3rem 2.5rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontFamily: "'Aboreto', cursive", fontSize: "1.5rem", color: "#534332", marginBottom: "0.4rem" }}>
            Admin Sign In
          </h2>
          <p style={{ fontSize: "0.8125rem", color: "#6D6A61", marginBottom: "1.75rem" }}>
            Access the Dayflow HR administration console.
          </p>

          {error && (
            <div style={{
              padding: "0.75rem 1rem", borderRadius: "0.75rem",
              background: "#fee2e2", border: "1px solid #fca5a5",
              color: "#b91c1c", fontSize: "0.8125rem", marginBottom: "1rem",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#534332" }}>Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: "0.65rem 0.9rem", borderRadius: "0.75rem",
                  border: "1px solid #DED9CF", background: "#F7F6F1",
                  fontSize: "0.875rem", color: "#534332", outline: "none",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#534332" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  padding: "0.65rem 0.9rem", borderRadius: "0.75rem",
                  border: "1px solid #DED9CF", background: "#F7F6F1",
                  fontSize: "0.875rem", color: "#534332", outline: "none",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "0.5rem", padding: "0.7rem 1.25rem",
                background: loading ? "#6D6A61" : "#454F2D",
                color: "#fff", border: "none", borderRadius: "0.75rem",
                fontSize: "0.875rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s", fontFamily: "'Lato', sans-serif",
              }}
            >
              {loading ? "Signing in…" : "Sign In to Admin Console"}
            </button>
          </form>

          <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#6D6A61", textAlign: "center" }}>
            Employee? Use the{" "}
            <a href="http://localhost:5173" style={{ color: "#454F2D", fontWeight: 700 }}>
              Employee Portal
            </a>{" "}
            instead.
          </p>
        </div>
      </div>
    </div>
  );
}
