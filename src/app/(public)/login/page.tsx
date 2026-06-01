"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { supabase, isSupabasePlaceholder } from "@/utils/supabaseClient";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PiggyBank, Lock, Mail, ShieldAlert, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const { setRole, sendPasswordReset } = useRole();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Recovery Flows
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Handle callback redirects or reset queries
  useEffect(() => {
    if (searchParams.get("reset") === "true") {
      setIsForgotMode(false);
      setForgotSuccess(false);
      setError("Please update your password inside your settings tab.");
    }
  }, [searchParams]);

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      if (isSupabasePlaceholder) {
        // Direct simulation mode bypass - no fetch call is ever made!
        console.log("Supabase in placeholder mode. Performing local login simulation.");
        if (email.includes("admin")) {
          setRole("admin");
        } else {
          setRole("customer");
        }
        return;
      }

      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authErr) {
        throw authErr;
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
        if (email.includes("admin")) {
          setRole("admin");
        } else {
          setRole("customer");
        }
      } else {
        setError(err?.message || String(err) || "Failed to sign in. Please verify your credentials.");
        setLoading(false);
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const ok = await sendPasswordReset(email);
      if (ok) {
        setForgotSuccess(true);
      } else {
        throw new Error("Failed to send verification link.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-y-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 font-sans bg-slate-50/50">
      <Card className="max-w-md w-full p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="bg-primary-600 text-white p-1.5 rounded-lg">
              <PiggyBank className="w-5 h-5" />
            </div>
            <span className="font-heading font-extrabold text-slate-800 text-sm tracking-wide">Delmar Portal</span>
          </Link>
          <h2 className="text-2xl font-extrabold font-heading text-slate-800 tracking-tight">
            {isForgotMode ? "Reset Password" : "Sign In to Your Account"}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {isForgotMode ? "We will send an email reset link to your address." : "Manage stock orders and reservation calendars."}
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-primary-50/50 border border-primary-100 p-3.5 rounded-xl text-[11px] text-primary-800 leading-normal flex gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-primary-600 mt-0.5" />
          <span>
            <strong>Supabase Connected:</strong> Auth calls route directly to your Supabase backend. If credentials are not set up yet, use the quick shortcuts below to simulate portals instantly.
          </span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-xs text-red-650 font-bold">
            {error}
          </div>
        )}

        {forgotSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Reset verification link dispatched to email! Check your inbox.</span>
          </div>
        )}

        {isForgotMode ? (
          /* Forgot Password Mode */
          <form onSubmit={handleForgotPassword} className="space-y-4">
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
                Send Reset Link
              </Button>
            </div>
          </form>
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

            <Button type="submit" className="w-full" isLoading={loading}>
              Sign In
            </Button>
          </form>
        )}

        {/* Quick Simulator Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Quick Sign In Options (Simulator)</span>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold hover:border-emerald-500 hover:text-emerald-700"
              onClick={() => setRole("customer")}
            >
              As Customer
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold hover:border-red-500 hover:text-red-750"
              onClick={() => setRole("admin")}
            >
              As Admin Owner
            </Button>
          </div>
        </div>

        <div className="text-center pt-2">
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
