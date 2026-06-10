"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Shield, RefreshCw, BarChart2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b0914] text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-accent-purple/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-accent-fuchsia/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="flex justify-between items-center px-8 py-6 z-10 border-b border-white/5 bg-[#0f0d1c]/20 backdrop-blur-xl">
        <span className="text-xl font-bold bg-gradient-to-r from-accent-purple to-accent-fuchsia bg-clip-text text-transparent tracking-tight">
          AuraFi
        </span>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="text-xs font-semibold text-text-secondary hover:text-white px-4 py-2 rounded-xl transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-xs font-semibold bg-gradient-to-r from-accent-purple to-accent-fuchsia text-white px-4 py-2 rounded-xl transition-all hover:opacity-90 active:scale-95"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 z-10 max-w-4xl mx-auto">
        <span className="inline-flex px-3 py-1 bg-accent-purple/10 text-accent-purple border border-accent-purple/20 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
          Premium Sandbox Edition
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Manage your wealth with{" "}
          <span className="bg-gradient-to-r from-accent-purple to-accent-fuchsia bg-clip-text text-transparent">
            Aura precision.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-text-secondary max-w-2xl mb-10 leading-relaxed">
          AuraFi is an enterprise-grade personal finance dashboard that connects directly to the Plaid Sandbox API, syncing transactions, categorizing cash flows, and tracking monthly budgets in a premium midnight UI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-accent-purple to-accent-fuchsia text-white rounded-2xl text-sm font-bold tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-accent-purple/20"
          >
            <span>Launch Dashboard</span>
            <ArrowRight size={16} />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl text-sm font-bold tracking-wider transition-all"
          >
            Documentation
          </a>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-24">
          <div className="glass-panel rounded-2xl p-6 text-left">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple mb-4">
              <Shield size={20} />
            </div>
            <h3 className="font-semibold text-sm text-white mb-2">Plaid Sandbox</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Secure bank linkages and exchange tokens. Test with Plaid credentials instantly.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 text-left">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple mb-4">
              <RefreshCw size={20} />
            </div>
            <h3 className="font-semibold text-sm text-white mb-2">Statement Syncing</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Auto-paginates transaction sync logs. Tracks category tags and merchant information.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 text-left">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple mb-4">
              <BarChart2 size={20} />
            </div>
            <h3 className="font-semibold text-sm text-white mb-2">Budgets & Analytics</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Configure spending limits per category, track visual gauges, and review monthly timelines.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 z-10 border-t border-white/5 text-[10px] text-text-secondary">
        &copy; {new Date().getFullYear()} AuraFi Personal Wealth Management. All rights reserved.
      </footer>
    </div>
  );
}
