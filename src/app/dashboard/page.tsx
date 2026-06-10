"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  ArrowRight,
  Eye,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useCurrency } from "@/context/CurrencyContext";

interface SummaryData {
  netWorth: number;
  monthlyIncome: number;
  monthlySpending: number;
  netSavings: number;
  savingsRate: number;
}

interface DailySpend {
  date: string;
  spend: number;
}

interface TopCategory {
  name: string;
  value: number;
  color: string;
}

interface Transaction {
  id: string;
  name: string;
  merchantName: string;
  amount: number;
  date: string;
  personalFinanceCategory: string;
  accountName: string;
  type: "debit" | "credit";
  pending: boolean;
}

export default function OverviewPage() {
  const { currency, formatValue } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<SummaryData>({
    netWorth: 0,
    monthlyIncome: 0,
    monthlySpending: 0,
    netSavings: 0,
    savingsRate: 0,
  });
  const [dailySpending, setDailySpending] = useState<DailySpend[]>([]);
  const [pieData, setPieData] = useState<TopCategory[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setMounted(true);

    async function fetchOverview() {
      try {
        const [summaryRes, transactionsRes] = await Promise.all([
          fetch("/api/analytics/summary"),
          fetch("/api/transactions?limit=10"),
        ]);

        if (summaryRes.ok) {
          const sData = await summaryRes.json();
          setSummary(sData.summary);
          setDailySpending(sData.dailySpending || []);
          setPieData(sData.topCategories || []);
        }

        if (transactionsRes.ok) {
          const tData = await transactionsRes.json();
          setRecentTransactions(tData.transactions || []);
        }
      } catch (error) {
        console.error("Failed to load dashboard overview API data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOverview();
    document.title = "Overview — AuraFi";
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col gap-4 md:gap-8 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="glass-panel rounded-2xl p-4 md:p-6 flex flex-col justify-center">
              <div className="h-3 w-20 bg-brand-border rounded mb-4" />
              <div className="h-8 w-32 bg-brand-border rounded mb-3" />
              <div className="h-3 w-24 bg-brand-border rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-brand-surface border border-brand-border rounded-2xl relative">
             <div className="absolute top-6 left-6 h-4 w-32 bg-brand-border rounded" />
             <div className="absolute top-12 left-6 h-3 w-24 bg-brand-border rounded opacity-50" />
             <div className="absolute bottom-6 left-6 right-6 h-48 bg-brand-border/20 rounded-lg" />
          </div>
          <div className="h-80 bg-brand-surface border border-brand-border rounded-2xl relative">
             <div className="absolute top-6 left-6 h-4 w-32 bg-brand-border rounded" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-8 border-brand-border/30" />
          </div>
        </div>
      </div>
    );
  }

  const symbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    CAD: "C$",
  };

  const formatCurrency = (val: number) => {
    return showValues
      ? formatValue(val)
      : `${symbols[currency] || "$"}••••••`;
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case "food & drink":
      case "groceries":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "subscriptions":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "transportation":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "housing":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "income":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const totalPieValue = pieData.reduce((acc, current) => acc + current.value, 0);

  return (
    <div className="flex flex-col gap-4 md:gap-8 pb-12">
      {/* Metrics Cards Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Net Worth */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 md:p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 radial-glow opacity-50 pointer-events-none"></div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Net Worth
            </span>
            <button
              onClick={() => setShowValues(!showValues)}
              className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <Eye size={16} />
            </button>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-2">
            {formatCurrency(summary.netWorth)}
          </h2>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <TrendingUp size={12} />
            <span>Live Sync balance</span>
          </div>
        </div>

        {/* Income Card */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 md:p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Monthly Income
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-2">
            {formatCurrency(summary.monthlyIncome)}
          </h2>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <span>Inflows this month</span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 md:p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Monthly Spending
            </span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-2">
            {formatCurrency(summary.monthlySpending)}
          </h2>
          <div className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
            <span>Outflows this month</span>
          </div>
        </div>

        {/* Net Savings */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 md:p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Net Savings
            </span>
            <div className="p-1.5 rounded-lg bg-accent-purple/10 text-accent-purple">
              <Scale size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-2">
            {formatCurrency(summary.netSavings)}
          </h2>
          <div className="flex items-center gap-1 text-[11px] text-accent-purple font-semibold">
            <span>{summary.savingsRate}% Savings Rate</span>
          </div>
        </div>
      </section>

      {/* Main Interactive Charts Area */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Daily Spending Line Chart */}
        <div className="glass-panel rounded-2xl p-4 md:p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-brand-border pb-4 mb-4">
            <div>
              <h3 className="font-semibold text-text-primary text-base">Daily Spending</h3>
              <p className="text-xs text-text-secondary mt-0.5">Last 30 Days trend</p>
            </div>
            <span className="text-xs text-text-secondary bg-brand-surface px-2.5 py-1 rounded-lg">
              {currency} ({symbols[currency] || "$"})
            </span>
          </div>
          
          <div className="relative h-64 w-full min-w-0">
            {dailySpending.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/* Ghost grid background */}
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                  <line x1="0" y1="25%" x2="100%" y2="25%" stroke="var(--border-color)" strokeWidth="1" />
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--border-color)" strokeWidth="1" />
                  <line x1="0" y1="75%" x2="100%" y2="75%" stroke="var(--border-color)" strokeWidth="1" />
                </svg>
                <AlertCircle size={24} className="mb-3 text-text-muted" />
                <span className="text-xs text-text-secondary">No spending transactions recorded in the last 30 days.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={dailySpending} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(148, 143, 176, 0.4)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="rgba(148, 143, 176, 0.4)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-sidebar)",
                      borderColor: "var(--border-color)",
                      borderRadius: "12px",
                      color: "var(--text-primary)",
                      fontSize: "12px",
                    }}
                    itemStyle={{ color: "var(--color-accent-purple)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="spend"
                    stroke="#a855f7"
                    strokeWidth={2.5}
                    dot={{ r: 4, stroke: "var(--bg-sidebar)", strokeWidth: 2, fill: "#a855f7" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Spending Categories Donut Chart */}
        <div className="glass-panel rounded-2xl p-4 md:p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-brand-border pb-4 mb-4">
            <div>
              <h3 className="font-semibold text-text-primary text-base">Top Categories</h3>
              <p className="text-xs text-text-secondary mt-0.5">Current month share</p>
            </div>
          </div>
          <div className="relative h-48 w-full min-w-0">
            {pieData.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-text-secondary">
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-brand-border opacity-50 mb-4 pointer-events-none" />
                <span>No expense data.</span>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--bg-sidebar)",
                        borderColor: "var(--border-color)",
                        borderRadius: "12px",
                        color: "var(--text-primary)",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-text-secondary uppercase font-semibold">Total</span>
                  <span className="text-xl font-bold text-text-primary">
                    {formatValue(totalPieValue).replace(/\.00$/, "")}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col gap-2 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-text-secondary truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="font-semibold text-text-primary">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Transactions Table */}
      <section className="glass-panel rounded-2xl p-4 md:p-6">
        <div className="flex justify-between items-center border-b border-brand-border pb-4 mb-4">
          <div>
            <h3 className="font-semibold text-text-primary text-base">Recent Activity</h3>
            <p className="text-xs text-text-secondary mt-0.5">Your last 10 cash transfers</p>
          </div>
          <Link
            href="/dashboard/transactions"
            className="flex items-center gap-1 text-xs text-accent-purple hover:text-accent-fuchsia font-semibold transition-colors group"
          >
            <span>View All</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-secondary">
              No transactions synced yet. Connect a bank account to sync statements.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                  <th className="pb-3">Transaction</th>
                  <th className="pb-3">Account</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-brand-border hover:bg-brand-surface text-sm transition-colors duration-150">
                    <td className="py-3.5 pr-4 flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-text-secondary shrink-0">
                        <ShoppingCart size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-text-primary truncate max-w-[150px] sm:max-w-xs">{tx.name}</p>
                        {tx.pending && (
                          <span className="inline-block text-[9px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded font-medium mt-0.5">
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-text-secondary">{tx.accountName}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] border rounded-full font-medium ${getCategoryBadgeColor(tx.personalFinanceCategory)}`}>
                        {tx.personalFinanceCategory}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-text-secondary">
                      {new Date(tx.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className={`py-3.5 text-right font-bold ${tx.type === "credit" ? "text-emerald-400" : "text-rose-400"}`}>
                      {tx.type === "credit" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
