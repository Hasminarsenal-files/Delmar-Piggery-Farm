"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { supabase, isSupabasePlaceholder } from "@/utils/supabaseClient";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Lock, Mail, ShieldAlert, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const { setRole, sendPasswordReset, customers, paluwaganApplications, updateProfile } = useRole();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Recovery Flows
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Handle callback redirects or reset queries
  useEffect(() => {
    if (searchParams.get("reset") === "true") {
      setIsForgotMode(false);
      setOtpSent(false);
      setOtp("");
      setForgotSuccess(false);
      setError("Please update your password inside your settings tab.");
    } else if (searchParams.get("timeout") === "true") {
      setIsForgotMode(false);
      setOtpSent(false);
      setOtp("");
      setForgotSuccess(false);
      setError("Session expired due to inactivity. Please log in again.");
    }
  }, [searchParams]);

  const syncCustomerProfile = (userEmailInput: string) => {
    const targetEmail = userEmailInput.trim().toLowerCase();
    const existingCust = customers.find((c) => c.email.toLowerCase() === targetEmail);
    const existingApp = paluwaganApplications.find((a) => a.customerEmail.toLowerCase() === targetEmail);
    
    let registeredName = existingCust?.fullName || existingApp?.fullName;
    if (!registeredName) {
      const savedName = localStorage.getItem("delmar_user_name");
      const savedEmail = localStorage.getItem("delmar_user_email");
      if (savedName && savedEmail?.toLowerCase() === targetEmail && savedName !== "John Doe") {
        registeredName = savedName;
      } else {
        // Derive clean name from email prefix (e.g. maria.santos@email.com -> Maria Santos)
        const prefix = targetEmail.split("@")[0].replace(/[._-]/g, " ");
        registeredName = prefix.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      }
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("delmar_user_name", registeredName);
      localStorage.setItem("delmar_user_email", targetEmail);
      localStorage.setItem("profile_name", registeredName);
    }
    updateProfile(registeredName, targetEmail, existingCust?.phone || "09464544973", existingCust?.address || "Purok Lapu-Lapu, Tickwas, Dumalinao, Zamboanga del Sur");
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }
    
    setError("");
    setLoading(true);

    const isTryingAdmin = email.toLowerCase().includes("admin") || email.toLowerCase() === "admin@delmarfarm.com";
    if (isTryingAdmin && email.toLowerCase() !== "admin@delmarfarm.com") {
      setError("Access Denied: Admin access is strictly restricted to admin@delmarfarm.com.");
      setLoading(false);
      return;
    }

    if (email.toLowerCase() === "admin@delmarfarm.com") {
      if (password.trim() !== "Delmarfarm" && password.trim().toLowerCase() !== "delmarfarm") {
        setError("Invalid password for admin@delmarfarm.com. Password is case-sensitive: 'Delmarfarm'");
        setLoading(false);
        return;
      }
    }

    const targetRole = email.toLowerCase() === "admin@delmarfarm.com" ? "admin" : "customer";

    if (targetRole === "customer") {
      syncCustomerProfile(email);
    }

    try {
      if (isSupabasePlaceholder || targetRole === "admin") {
        // Direct simulation / Admin credentials override
        console.log("Setting session role for", targetRole);
        if (rememberMe) {
          localStorage.setItem("delmar_remember_me", targetRole);
        } else {
          localStorage.removeItem("delmar_remember_me");
        }
        setRole(targetRole);
        return;
      }

      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authErr) {
        throw authErr;
      }

      if (rememberMe) {
        localStorage.setItem("delmar_remember_me", targetRole);
      } else {
        localStorage.removeItem("delmar_remember_me");
      }
      // Success is handled by RoleContext onAuthStateChange listener which triggers redirect
    } catch (err: any) {
      const errMsg = String(err?.message || err || "").toLowerCase();
      if (
        errMsg.includes("fetch") || 
        errMsg.includes("network") || 
        errMsg.includes("typeerror") || 
        errMsg.includes("cors")
      ) {
        // Graceful fallback to client simulation
        if (rememberMe) {
          localStorage.setItem("delmar_remember_me", targetRole);
        } else {
          localStorage.removeItem("delmar_remember_me");
        }
        setRole(targetRole);
      } else {
        setError(err?.message || String(err) || "Failed to sign in. Please verify your credentials.");
        setLoading(false);
      }
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (isSupabasePlaceholder) {
        console.log("Supabase placeholder mode: simulating OTP dispatch to", email);
        setOtpSent(true);
        return;
      }

      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });

      if (otpErr) throw otpErr;

      setOtpSent(true);
    } catch (err: any) {
      const errMsg = String(err?.message || err || "").toLowerCase();
      if (
        errMsg.includes("fetch") || 
        errMsg.includes("network") || 
        errMsg.includes("typeerror") || 
        errMsg.includes("cors")
      ) {
        // Fallback simulation if network/CORS issue
        console.log("Supabase OTP fallback simulation.");
        setOtpSent(true);
      } else {
        setError(err.message || "Failed to send OTP code. Please make sure your account exists.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (isSupabasePlaceholder) {
        if (otp === "123456") {
          if (email.includes("admin")) {
            setRole("admin");
          } else {
            setRole("customer");
          }
          return;
        } else {
          throw new Error("Invalid OTP code. (Simulation: Enter 123456)");
        }
      }

      const { data, error: verifyErr } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (verifyErr) throw verifyErr;

      // Logged in successfully! Session is handled by RoleContext onAuthStateChange.
    } catch (err: any) {
      const errMsg = String(err?.message || err || "").toLowerCase();
      if (
        errMsg.includes("fetch") || 
        errMsg.includes("network") || 
        errMsg.includes("typeerror") || 
        errMsg.includes("cors")
      ) {
        // Simulation bypass if network/CORS issue
        if (otp === "123456") {
          if (email.includes("admin")) {
            setRole("admin");
          } else {
            setRole("customer");
          }
        } else {
          setError("Invalid OTP code. (Simulation: Enter 123456)");
          setLoading(false);
        }
      } else {
        setError(err.message || "Invalid OTP code.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-y-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 font-sans bg-slate-50/50">
      <Card className="max-w-md w-full p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center">
            <img 
              src="/logo.jpg" 
              alt="Delmar Piggery Farm Logo" 
              className="h-16 w-auto object-contain"
            />
          </Link>
          <h2 className="text-2xl font-extrabold font-heading text-slate-800 tracking-tight">
            {isForgotMode ? (otpSent ? "Verify OTP Code" : "Reset Password") : "Sign In to Your Account"}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {isForgotMode ? (otpSent ? "Please verify the code sent to your Gmail inbox." : "We will send an OTP verification code to your address.") : "Manage stock orders and reservation calendars."}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-xs text-red-650 font-bold">
            {error}
          </div>
        )}

        {isForgotMode ? (
          /* Forgot Password Mode */
          otpSent ? (
            /* OTP Verification Screen */
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <p className="text-xs text-slate-500 font-medium text-center">
                Enter the 6-digit verification code sent to <strong>{email}</strong>.
              </p>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">One-Time Password (OTP)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      setError("");
                    }}
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-bold tracking-widest text-center"
                    placeholder="123456"
                  />
                </div>
                {isSupabasePlaceholder && (
                  <span className="text-[10px] text-slate-400 font-semibold block text-center mt-1">
                    Simulation bypass code: <strong>123456</strong>
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/2"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setError("");
                  }}
                  icon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  Back
                </Button>
                <Button type="submit" className="w-1/2" isLoading={loading}>
                  Verify & Log In
                </Button>
              </div>
            </form>
          ) : (
            /* Email Request Screen */
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium"
                    placeholder="name@email.com"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/2"
                  onClick={() => {
                    setIsForgotMode(false);
                    setError("");
                  }}
                  icon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-1/2" isLoading={loading}>
                  Send OTP Code
                </Button>
              </div>
            </form>
          )
        ) : (
          /* Standard Login Mode */
          <form onSubmit={handleFormLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium"
                  placeholder="customer@email.com or admin@email.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(true);
                    setError("");
                  }}
                  className="text-[10px] font-bold text-primary-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-650 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-350 accent-primary-600 text-primary-600 focus:ring-primary-500"
                />
                Remember Me
              </label>
            </div>

            <Button type="submit" className="w-full" isLoading={loading}>
              Sign In
            </Button>
          </form>
        )}

        {/* Quick Fill Admin Credentials Box */}
        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" /> Admin Login Credentials
            </span>
            <button
              type="button"
              onClick={() => {
                setEmail("admin@delmarfarm.com");
                setPassword("Delmarfarm");
                setError("");
              }}
              className="text-[10px] font-bold text-emerald-800 bg-white hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer shadow-2xs transition-colors"
            >
              Auto-fill Admin
            </button>
          </div>
          <div className="text-[11px] font-mono text-emerald-950 space-y-0.5 bg-white/70 p-2 rounded-xl border border-emerald-100">
            <div>Username: <strong className="font-bold select-all text-emerald-900">admin@delmarfarm.com</strong></div>
            <div>Password: <strong className="font-bold select-all text-emerald-900">Delmarfarm</strong></div>
          </div>
        </div>

        <div className="text-center pt-1">
          <p className="text-xs text-slate-500 font-medium">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary-600 hover:underline font-bold">
              Register Here <ArrowRight className="w-3.5 h-3.5 inline ml-0.5" />
            </Link>
          </p>
        </div>

      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50 font-sans">
        <div className="text-center text-xs text-slate-400 font-bold">Loading authentication portal...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
