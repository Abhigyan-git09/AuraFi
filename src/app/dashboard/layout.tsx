"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ReceiptText,
  LineChart,
  CreditCard,
  Wallet,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useCurrency } from "@/context/CurrencyContext";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  active: boolean;
}

function SidebarLink({ href, icon, label, isCollapsed, active }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        active
          ? "bg-gradient-to-r from-accent-purple/20 to-accent-fuchsia/10 text-text-primary border-l-2 border-accent-purple"
          : "text-text-secondary hover:text-text-primary hover:bg-brand-surface"
      }`}
    >
      <div className={`shrink-0 ${active ? "text-accent-purple" : "text-text-secondary group-hover:text-text-primary"}`}>
        {icon}
      </div>
      {!isCollapsed && (
        <span className="text-sm font-medium tracking-wide transition-opacity duration-200">
          {label}
        </span>
      )}
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/dashboard";
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isSyncing, setIsSyncing] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  // Effect to load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("aurafi-theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "light") {
        document.documentElement.classList.add("light-mode-fallback");
      } else {
        document.documentElement.classList.remove("light-mode-fallback");
      }
    } else {
      document.documentElement.classList.remove("light-mode-fallback");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("aurafi-theme", newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light-mode-fallback");
    } else {
      document.documentElement.classList.remove("light-mode-fallback");
    }
    showToast(`Switched to ${newTheme} mode`, "info");
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const triggerSync = async () => {
    setIsSyncing(true);
    showToast("Starting transaction sync...", "info");

    try {
      const res = await fetch("/api/plaid/sync", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        showToast(`Synced ${data.added || 0} transactions!`, "success");
        router.refresh();
      } else {
        showToast("Sync failed. Please try again.", "error");
      }
    } catch {
      showToast("Sync failed. Please try again.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    showToast("Logging out...", "info");
    await signOut({ redirect: false });
    router.push("/login");
  };

  const links = [
    { href: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Overview" },
    { href: "/dashboard/transactions", icon: <ReceiptText size={20} />, label: "Transactions" },
    { href: "/dashboard/analytics", icon: <LineChart size={20} />, label: "Analytics" },
    { href: "/dashboard/accounts", icon: <CreditCard size={20} />, label: "Accounts" },
    { href: "/dashboard/budgets", icon: <Wallet size={20} />, label: "Budgets" },
    { href: "/dashboard/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-brand-bg text-text-primary overflow-hidden">
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl shadow-xl flex items-center justify-between border backdrop-blur-xl animate-in slide-in-from-top-4 duration-300 ${
              toast.type === "success"
                ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300"
                : toast.type === "error"
                ? "bg-rose-950/80 border-rose-500/30 text-rose-300"
                : "bg-slate-900/90 border-brand-border text-text-primary"
            }`}
          >
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-3 hover:text-text-primary text-xs opacity-70"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-purple/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-accent-fuchsia/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-brand-border bg-brand-sidebar/50 backdrop-blur-xl z-20 transition-all duration-300 shrink-0 h-full overflow-hidden ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo and Collapse Toggle */}
        <div className="flex items-center justify-between p-6 border-b border-brand-border shrink-0">
          {!isCollapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-accent-purple to-accent-fuchsia bg-clip-text text-transparent">
              AuraFi
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-brand-surface text-text-secondary hover:text-text-primary mx-auto md:mx-0"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
          {links.map((link) => (
            <SidebarLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              isCollapsed={isCollapsed}
              active={pathname === link.href}
            />
          ))}
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-brand-border flex flex-col gap-1 mt-auto shrink-0">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-text-primary hover:bg-brand-surface w-full text-left"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            {!isCollapsed && <span className="text-sm font-medium">Theme Mode</span>}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 w-full text-left"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="text-sm font-medium">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-brand-sidebar border-b border-brand-border z-20 shrink-0">
        <span className="text-lg font-bold bg-gradient-to-r from-accent-purple to-accent-fuchsia bg-clip-text text-transparent">
          AuraFi
        </span>
        <div className="flex items-center gap-2">
          {/* Mobile Currency Select */}
          <div className="relative mr-1">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="pl-2 pr-6 py-1.5 bg-brand-surface border border-brand-border focus:border-accent-purple rounded-lg text-[10px] font-bold text-text-primary transition-all appearance-none cursor-pointer focus:outline-none"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
              <option value="CAD">CAD</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-2.5 text-text-secondary pointer-events-none" size={10} />
          </div>
          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="p-2 rounded-lg bg-brand-surface hover:bg-brand-surface-hover text-text-primary"
          >
            <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-brand-surface hover:bg-brand-surface-hover text-text-primary"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-brand-surface hover:bg-brand-surface-hover text-text-primary"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-brand-bg z-30 flex flex-col p-4 gap-2 animate-in fade-in duration-200">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl text-base ${
                pathname === link.href
                  ? "bg-gradient-to-r from-accent-purple/20 to-accent-fuchsia/10 text-text-primary border-l-2 border-accent-purple"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
          <div className="mt-auto border-t border-brand-border pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-rose-400 w-full"
            >
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 h-full">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-brand-border bg-brand-sidebar/20 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold tracking-wide">
              {links.find((l) => l.href === pathname)?.label || "Overview"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Currency Select Dropdown */}
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="pl-3 pr-8 py-2 bg-brand-input border border-brand-border focus:border-accent-purple rounded-xl text-xs font-semibold text-text-primary transition-all appearance-none cursor-pointer focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 text-text-secondary pointer-events-none" size={14} />
            </div>
            <button
              onClick={triggerSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-fuchsia hover:opacity-90 active:scale-95 text-white rounded-xl text-xs font-semibold tracking-wider transition-all duration-150 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? "Syncing..." : "Sync Transactions"}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-brand-border">
              <div className="w-8 h-8 rounded-full bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center text-xs font-bold text-accent-purple">
                {(session?.user?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold">{session?.user?.name || "User"}</p>
                <p className="text-[10px] text-text-secondary">{session?.user?.email || ""}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-brand-bg text-text-primary transition-colors duration-250">
          {children}
        </main>
      </div>
    </div>
  );
}
