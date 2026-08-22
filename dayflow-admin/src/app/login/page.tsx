"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { addEmployee } from "@/services/api";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("admin@dayflow.local");
  const [password, setPassword] = useState("");
  const [empId, setEmpId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await addEmployee({
          employeeId: empId || `ADM${Math.floor(100 + Math.random() * 900)}`,
          email,
          password,
          firstName,
          lastName,
        });
      }
      await signIn(email, password);
    } catch (err: unknown) {
      setError((err as Error).message || "Authentication failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D0D9CE] bg-[radial-gradient(#B6C5B3_1px,transparent_1px)] [background-size:24px_24px] flex flex-col items-center justify-center p-6 font-sans">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#2D4232] bg-[#E3EBE1] px-4 py-1.5 rounded-full border border-[#B8C8B5]">
          🛡️ Dayflow Administration Console
        </span>
      </div>

      <div className="w-full max-w-[960px] min-h-[560px] bg-[#E2EAE0] bg-[url('/login_bg.jpg')] bg-cover bg-left rounded-[28px] shadow-2xl border border-white/70 flex flex-col md:flex-row relative overflow-hidden">
        {/* Left Side Branding */}
        <div className="flex-1 p-8 md:p-14 flex flex-col justify-center z-10 relative bg-gradient-to-r from-black/40 via-black/20 to-transparent">
          <div className="flex items-center gap-2">
            <span className="font-display text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
              Dayflow
            </span>
            <span className="text-xl font-bold text-[#F3E5AB] bg-[#2D4232]/80 px-2.5 py-0.5 rounded-md border border-[#F3E5AB]/40 backdrop-blur-sm shadow-sm">
              ADMIN
            </span>
          </div>
          <p className="text-white/95 text-base font-medium mt-2 drop-shadow">
            Workforce Oversight, Leave Approvals & Payroll
          </p>
          <div className="mt-8 flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1C2B20]/75 backdrop-blur-md border border-[#F3E5AB]/40 text-[#F5E6B3] text-xs font-bold w-fit shadow-md">
              🔒 Executive & HR Administrator Access Only
            </div>
          </div>
        </div>

        {/* Right Floating Card */}
        <div className="w-full md:w-[440px] p-6 flex items-center justify-center z-20">
          <div className="w-full bg-[#E5ECE3]/95 backdrop-blur-xl border border-white/90 rounded-[24px] p-8 shadow-xl">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9F7E4A]">Secure Admin Portal</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#19271E] text-center tracking-tight">
              {mode === "signup" ? "Create Admin Account" : "Admin Sign In"}
            </h2>
            <p className="text-xs text-[#4E5E52] text-center mt-1.5 mb-6">
              {mode === "signup" ? (
                <>Already have an admin account? <button type="button" onClick={() => setMode("signin")} className="font-bold underline text-[#19271E]">Log in</button></>
              ) : (
                <>Need an admin account? <button type="button" onClick={() => setMode("signup")} className="font-bold underline text-[#19271E]">Sign up</button></>
              )}
            </p>

            {error && (
              <div className="p-3 rounded-2xl bg-red-100 border border-red-300 text-red-800 text-xs mb-4 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {mode === "signup" && (
                <>
                  <div className="relative w-full flex items-center">
                    <span className="absolute left-4 text-sm text-[#6C7E70] pointer-events-none">👤</span>
                    <input
                      type="text"
                      value={empId}
                      onChange={(e) => setEmpId(e.target.value)}
                      required
                      placeholder="Admin Employee ID (e.g. ADM002)"
                      className="w-full h-11 pl-11 pr-4 rounded-full border border-[#C5D3C3] bg-white text-xs text-[#19271E] focus:outline-none focus:border-[#233626] font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative w-full flex items-center">
                      <span className="absolute left-3.5 text-xs text-[#6C7E70] pointer-events-none">👤</span>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        className="w-full h-11 pl-9 pr-3 rounded-full border border-[#C5D3C3] bg-white text-xs text-[#19271E] focus:outline-none focus:border-[#233626] font-medium"
                      />
                    </div>
                    <div className="relative w-full flex items-center">
                      <span className="absolute left-3.5 text-xs text-[#6C7E70] pointer-events-none">👤</span>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        className="w-full h-11 pl-9 pr-3 rounded-full border border-[#C5D3C3] bg-white text-xs text-[#19271E] focus:outline-none focus:border-[#233626] font-medium"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="relative w-full flex items-center">
                <span className="absolute left-4 text-sm text-[#6C7E70] pointer-events-none">✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Admin Email (admin@dayflow.local)"
                  className="w-full h-11 pl-11 pr-4 rounded-full border border-[#C5D3C3] bg-white text-xs text-[#19271E] focus:outline-none focus:border-[#233626] font-medium"
                />
              </div>

              <div className="relative w-full flex items-center">
                <span className="absolute left-4 text-sm text-[#6C7E70] pointer-events-none">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  minLength={8}
                  className="w-full h-11 pl-11 pr-11 rounded-full border border-[#C5D3C3] bg-white text-xs text-[#19271E] focus:outline-none focus:border-[#233626] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-sm opacity-60 hover:opacity-100"
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>

              <div className="flex flex-col gap-1 text-xs text-[#3D4E41] mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-[#233626] cursor-pointer"
                  />
                  <span>Keep session active</span>
                </label>
                {mode === "signup" && (
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      required
                      className="accent-[#233626] cursor-pointer"
                    />
                    <span>I agree to Admin Security Terms & Policies</span>
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-[#18261C] hover:bg-[#25392A] text-white text-xs font-bold shadow-lg transition-all mt-1 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? "Please wait..." : mode === "signup" ? "Sign Up for Admin Console" : "Log in to Admin Console"}
              </button>

              <div className="flex items-center text-center my-2 text-xs font-semibold text-[#6E8072]">
                <div className="flex-1 border-b border-[#C1CFBF]" />
                <span className="px-3">Need employee access?</span>
                <div className="flex-1 border-b border-[#C1CFBF]" />
              </div>

              <a
                href="http://localhost:5173"
                className="w-full h-10 rounded-full border border-[#C5D3C3] bg-white text-[#19271E] text-xs font-bold flex items-center justify-center hover:bg-[#F3F7F2] transition-colors"
              >
                Switch to Employee Portal →
              </a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
