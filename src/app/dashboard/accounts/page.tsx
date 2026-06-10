"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  AlertTriangle,
  Lock,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { usePlaidLink } from "react-plaid-link";
import { useCurrency } from "@/context/CurrencyContext";

interface BankAccount {
  id: string;
  name: string;
  officialName: string | null;
  type: string;
  subtype: string | null;
  currentBalance: number;
  availableBalance: number | null;
  limitBalance: number | null;
  mask: string;
  institutionName: string;
  lastSynced: string;
}

export default function AccountsPage() {
  const { formatValue } = useCurrency();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaidOpen, setIsPlaidOpen] = useState(false);
  const [plaidStep, setPlaidStep] = useState<"welcome" | "credentials" | "success">("welcome");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [plaidError, setPlaidError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Plaid SDK integration state
  const [linkToken, setLinkToken] = useState<string | null>(null);

  // Disconnect Confirmation Dialog
  const [disconnectingAccount, setDisconnectingAccount] = useState<BankAccount | null>(null);

  // Fetch Accounts from API
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDisconnect = async (id: string) => {
    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAccounts((prev) => prev.filter((acc) => acc.id !== id));
      } else {
        console.error("Failed to disconnect account.");
      }
    } catch {
      console.error("Error deleting account:");
    } finally {
      setDisconnectingAccount(null);
    }
  };

  // Plaid Link Setup
  const handlePlaidSuccess = async (public_token: string, metadata: any) => {
    setIsConnecting(true);
    try {
      const response = await fetch("/api/plaid/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_token,
          institution_id: metadata.institution?.institution_id || "ins_123",
          institution_name: metadata.institution?.name || "First Platypus Bank",
        }),
      });
      if (response.ok) {
        await fetch("/api/plaid/sync", { method: "POST" }); // Auto sync transactions
        await fetchAccounts(); // Refresh list
      }
    } catch (error) {
      console.error("Plaid token exchange error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken || "",
    onSuccess: handlePlaidSuccess,
    onExit: (err) => {
      if (err) console.error("Plaid Link Exit error:", err);
      setLinkToken(null);
    }
  });

  // Trigger Plaid Connection Flow
  const handleConnectClick = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/plaid/create-link-token", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        const token = data.link_token;
        setLinkToken(token);

        if (token && (token.startsWith("mock_") || token === "mock_link_token_fallback")) {
          // Open simulated modal instead of SDK
          setIsPlaidOpen(true);
          setPlaidStep("welcome");
        }
      }
    } catch (error) {
      console.error("Failed to prepare Plaid link token:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Trigger real link once state is loaded
  useEffect(() => {
    if (linkToken && !linkToken.startsWith("mock_") && ready) {
      open();
      setLinkToken(null); // Reset
    }
  }, [linkToken, ready, open]);

  useEffect(() => {
    document.title = "Accounts — AuraFi";
  }, []);

  // Handle Mock Plaid Flow Submit
  const handlePlaidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlaidError("");
    
    if (username !== "user_good" || password !== "pass_good") {
      setPlaidError("Invalid Sandbox credentials. Use user_good / pass_good.");
      return;
    }

    setIsConnecting(true);
    try {
      // Call mock exchange token
      const response = await fetch("/api/plaid/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_token: "mock_public_token_" + Math.random().toString(36).substring(7),
          institution_id: "ins_123",
          institution_name: "First Platypus Bank",
        }),
      });

      if (response.ok) {
        setPlaidStep("success");
      } else {
        setPlaidError("Failed to simulate token exchange.");
      }
    } catch {
      setPlaidError("Error communicating with backend.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleFinishMockSync = async () => {
    setIsConnecting(true);
    try {
      // Sync mock transactions
      await fetch("/api/plaid/sync", { method: "POST" });
      await fetchAccounts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsConnecting(false);
      setIsPlaidOpen(false);
      setPlaidStep("welcome");
      setUsername("");
      setPassword("");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header Widget */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-text-secondary">
            Manage your connected bank credentials and balance details
          </p>
        </div>
        <button
          onClick={handleConnectClick}
          disabled={isConnecting}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent-purple to-accent-fuchsia hover:opacity-90 active:scale-95 text-xs font-semibold rounded-xl text-white transition-all duration-150 cursor-pointer disabled:opacity-50"
        >
          {isConnecting ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Plus size={16} />
          )}
          <span>Connect New Account</span>
        </button>
      </div>

      {/* Grid of Bank Accounts */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative min-h-[200px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b0914]/50 backdrop-blur-[1px] z-10">
            <Loader2 className="animate-spin text-accent-purple" size={32} />
          </div>
        ) : null}

        {accounts.length === 0 && !loading ? (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex flex-col items-center justify-center py-20 px-6">
            <div className="w-16 h-16 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mb-4">
              <Lock size={28} className="text-accent-purple" />
            </div>
            <h4 className="text-sm font-semibold text-text-primary mb-1.5">No accounts connected</h4>
            <p className="text-xs text-text-secondary text-center max-w-[30ch] mb-6">
              Link your first bank account via Plaid to start tracking balances and transactions.
            </p>
            <button
              onClick={handleConnectClick}
              disabled={isConnecting}
              className="px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-fuchsia text-white text-xs font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isConnecting ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
              <span>Connect New Account</span>
            </button>
          </div>
        ) : (
          accounts.map((acc) => (
            <div
              key={acc.id}
              className="glass-panel rounded-2xl p-4 md:p-5 relative overflow-hidden flex flex-col justify-between group"
            >
              {/* Header details */}
              <div>
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                      {acc.institutionName}
                    </span>
                    <h3 className="text-base font-semibold text-text-primary mt-0.5 truncate">{acc.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-text-secondary">
                      •••• {acc.mask}
                    </span>
                    <button
                      onClick={() => setDisconnectingAccount(acc)}
                      className="p-1 rounded-md bg-brand-surface border border-brand-border text-text-secondary hover:text-rose-400 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                      title="Disconnect Account"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Type Badge */}
                <span
                  className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border mb-6 ${
                    acc.type === "checking"
                      ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                      : acc.type === "savings"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                  }`}
                >
                  {acc.type}
                </span>
              </div>

              {/* Balances */}
              <div>
                <div className="flex flex-col mb-4">
                  <span className="text-[10px] text-text-secondary">Current Balance</span>
                  <span className="text-2xl font-bold text-text-primary tracking-tight">
                    {formatValue(acc.currentBalance)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-text-secondary border-t border-brand-border pt-4">
                  <span>Avail: {acc.availableBalance !== null ? formatValue(acc.availableBalance) : "N/A"}</span>
                  <span className="text-[10px] text-text-muted">
                    Synced: {acc.lastSynced ? new Date(acc.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* DANGER: Cascading Disconnect Confirmation Dialog */}
      {disconnectingAccount && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel bg-brand-sidebar border border-brand-border max-w-sm w-full p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 text-text-primary">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <AlertTriangle size={24} />
              <h4 className="font-bold text-text-primary text-base">Disconnect Bank Account?</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-6">
              You are disconnecting <strong className="text-text-primary">{disconnectingAccount.name}</strong>. 
              This will permanently delete this institution token and all its transactions from our system. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDisconnectingAccount(null)}
                className="px-4 py-2 bg-brand-surface border border-brand-border hover:bg-brand-surface-hover text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDisconnect(disconnectingAccount.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-semibold rounded-xl text-white transition-all cursor-pointer"
              >
                Disconnect Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLAID LINK SANDBOX MODAL */}
      {isPlaidOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-brand-sidebar border border-brand-border max-w-md w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-text-primary">
            {/* Header */}
            <div className="bg-gradient-to-r from-accent-purple to-accent-fuchsia p-6 text-center text-white relative">
              <button
                onClick={() => setIsPlaidOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
              <Lock size={32} className="mx-auto mb-2 opacity-90" />
              <h3 className="font-bold text-lg text-white">Plaid Sandbox Connection</h3>
              <p className="text-xs opacity-80 mt-1 text-white">Connect your bank accounts securely</p>
            </div>

            {/* Steps Rendering */}
            <div className="p-6 bg-brand-sidebar">
              {plaidStep === "welcome" && (
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-text-primary">Select Test Institution</p>
                    <p className="text-xs text-text-secondary">
                      You are in sandbox development. Please choose the mock platform to test authentication syncs.
                    </p>
                  </div>
                  <button
                    onClick={() => setPlaidStep("credentials")}
                    className="w-full py-3 bg-brand-surface hover:bg-brand-surface-hover border border-brand-border text-text-primary font-semibold rounded-2xl text-xs tracking-wider transition-all cursor-pointer"
                  >
                    First Platypus Bank
                  </button>
                  <p className="text-[10px] text-text-muted">Secure banking link provided by Google Plaid</p>
                </div>
              )}

              {plaidStep === "credentials" && (
                <form onSubmit={handlePlaidSubmit} className="flex flex-col gap-4">
                  <div className="text-center mb-2">
                    <p className="text-xs text-amber-400 font-semibold bg-amber-400/5 py-1.5 px-3 rounded-xl border border-amber-400/10">
                      Use Test Creds: <strong className="underline">user_good</strong> and <strong className="underline">pass_good</strong>
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. user_good"
                      className="w-full px-4 py-2.5 bg-brand-input border border-brand-border focus:border-accent-purple rounded-xl text-sm transition-all focus:outline-none text-text-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-brand-input border border-brand-border focus:border-accent-purple rounded-xl text-sm transition-all focus:outline-none text-text-primary"
                    />
                  </div>
                  {plaidError && (
                    <p className="text-xs text-rose-400 text-center font-medium mt-1">{plaidError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="w-full py-3 mt-4 bg-gradient-to-r from-accent-purple to-accent-fuchsia hover:opacity-90 active:scale-95 text-white font-semibold rounded-2xl text-xs tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Verifying credentials...</span>
                      </>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>
                </form>
              )}

              {plaidStep === "success" && (
                <div className="flex flex-col items-center text-center gap-6 py-4">
                  <CheckCircle size={48} className="text-emerald-400" />
                  <div className="flex flex-col gap-2">
                    <h4 className="font-bold text-text-primary text-base">Linked Successfully</h4>
                    <p className="text-xs text-text-secondary">
                      Your checking & savings accounts from First Platypus Bank have been synced.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleFinishMockSync}
                    disabled={isConnecting}
                    className="w-full py-3 bg-gradient-to-r from-accent-purple to-accent-fuchsia hover:opacity-90 active:scale-95 text-white font-semibold rounded-2xl text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : null}
                    <span>Confirm & Sync Transactions</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
