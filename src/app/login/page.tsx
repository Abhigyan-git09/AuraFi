"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred during authentication.");
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
            The commanding cockpit for your personal finances
          </p>
        </div>

        {/* Login form card */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold mb-6 text-white text-center">Welcome Back</h2>

          {/* Dev Notice Banner */}
          <div className="p-3 bg-accent-purple/5 border border-accent-purple/20 rounded-2xl mb-6 text-center">
            <p className="text-[11px] text-accent-purple font-medium">
              Dev Mode: Any email/password will log you in.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                  placeholder="e.g. demo@aurafi.com"
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
                  placeholder="••••••••"
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer redirection links */}
        <p className="text-xs text-center text-text-secondary mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent-purple hover:text-accent-fuchsia font-semibold hover:underline">
            Register for free
          </Link>
        </p>
      </div>
    </div>
  );
}
