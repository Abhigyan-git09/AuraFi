"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0914] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-accent-purple/15 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-accent-fuchsia/15 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand details */}
        <div className="text-center mb-8">
          <span className="text-3xl font-extrabold bg-gradient-to-r from-accent-purple to-accent-fuchsia bg-clip-text text-transparent tracking-tight">
            AuraFi
          </span>
          <p className="text-xs text-text-secondary mt-2">
            Register your command credentials to start syncing statements
          </p>
        </div>

        {/* Register card */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold mb-6 text-white text-center">Create Account</h2>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-text-secondary" size={16} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-11 pr-4 py-3 bg-[#0b0914] border border-white/10 focus:border-accent-purple rounded-2xl text-sm transition-all focus:outline-none text-white placeholder-text-muted"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-text-secondary" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. jane@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-[#0b0914] border border-white/10 focus:border-accent-purple rounded-2xl text-sm transition-all focus:outline-none text-white placeholder-text-muted"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-text-secondary" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-11 pr-4 py-3 bg-[#0b0914] border border-white/10 focus:border-accent-purple rounded-2xl text-sm transition-all focus:outline-none text-white placeholder-text-muted"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-text-secondary" size={16} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-11 pr-4 py-3 bg-[#0b0914] border border-white/10 focus:border-accent-purple rounded-2xl text-sm transition-all focus:outline-none text-white placeholder-text-muted"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-semibold text-center mt-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-accent-purple to-accent-fuchsia hover:opacity-90 active:scale-98 text-white rounded-2xl text-xs font-bold tracking-wider transition-all duration-150 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-accent-purple/20"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Registering account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Redirect back to login */}
        <p className="text-xs text-center text-text-secondary mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-purple hover:text-accent-fuchsia font-semibold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
