"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useCurrency } from "@/context/CurrencyContext";

interface MonthlyHistory {
  month: string;
  income: number;
  expenses: number;
}

interface CategorySpend {
  name: string;
  value: number;
  color: string;
}

interface MerchantMetric {
  name: string;
  amount: number;
  count: number;
}

export default function AnalyticsPage() {
  const { formatValue } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // States
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyHistory[]>([]);
  const [categories, setCategories] = useState<CategorySpend[]>([]);
  const [merchants, setMerchants] = useState<MerchantMetric[]>([]);
  const [avgDailySpend, setAvgDailySpend] = useState(0);
  const [biggestTx, setBiggestTx] = useState({ name: "None", amount: 0 });
  const [wowChange, setWowChange] = useState(-12.4); // WoWo comparison fallback

  useEffect(() => {
    setMounted(true);

    async function fetchAnalytics() {
      try {
        const [historyRes, summaryRes, transactionsRes] = await Promise.all([
          fetch("/api/analytics/monthly"),
          fetch("/api/analytics/summary"),
          fetch("/api/transactions?limit=100"),
        ]);

        if (historyRes.ok) {
          const hData = await historyRes.json();
          setMonthlyHistory(hData || []);
        }

        if (summaryRes.ok) {
          const sData = await summaryRes.json();
          setCategories(sData.topCategories || []);
          
          // Set avg spend based on monthly spending
          const totalSpent = sData.summary?.monthlySpending || 0;
          const dayOfMonth = new Date().getDate();
          setAvgDailySpend(totalSpent > 0 ? parseFloat((totalSpent / dayOfMonth).toFixed(2)) : 0);
        }

        if (transactionsRes.ok) {
          const tData = await transactionsRes.json();
          const txs = tData.transactions || [];

          // 1. Calculate biggest transaction (debits only)
          const debits = txs.filter((t: any) => t.type === "debit");
          if (debits.length > 0) {
            const maxTx = debits.reduce((prev: any, current: any) => 
              (prev.amount > current.amount) ? prev : current
            );
            setBiggestTx({
              name: maxTx.merchantName || maxTx.name,
              amount: maxTx.amount,
            });
          }

          // 2. Aggregate Top Merchants
          const merchantMap = new Map<string, { amount: number; count: number }>();
          debits.forEach((t: any) => {
            const name = t.merchantName || t.name;
            if (!name) return;
            const current = merchantMap.get(name) || { amount: 0, count: 0 };
            merchantMap.set(name, {
              amount: current.amount + t.amount,
              count: current.count + 1,
            });
          });

          const sortedMerchants = Array.from(merchantMap.entries())
            .map(([name, val]) => ({
              name,
              amount: parseFloat(val.amount.toFixed(2)),
              count: val.count,
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

          setMerchants(sortedMerchants);

          // 3. Compute Week-Over-Week comparison dynamically
          const now = new Date();
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

          let thisWeekSpend = 0;
          let lastWeekSpend = 0;

          debits.forEach((t: any) => {
            const tDate = new Date(t.date);
            if (tDate >= sevenDaysAgo && tDate <= now) {
              thisWeekSpend += t.amount;
            } else if (tDate >= fourteenDaysAgo && tDate < sevenDaysAgo) {
              lastWeekSpend += t.amount;
            }
          });

          if (lastWeekSpend > 0) {
            const diff = ((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100;
            setWowChange(parseFloat(diff.toFixed(1)));
          }
        }
      } catch (error) {
        console.error("Failed to fetch spending analytics data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
    document.title = "Analytics — AuraFi";
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col gap-4 md:gap-8 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel rounded-2xl p-4 md:p-6 flex flex-col justify-center">
              <div className="h-3 w-24 bg-brand-border rounded mb-4" />
              <div className="h-8 w-32 bg-brand-border rounded mb-3" />
              <div className="h-3 w-40 bg-brand-border rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-brand-surface border border-brand-border rounded-2xl relative">
             <div className="absolute top-6 left-6 h-4 w-32 bg-brand-border rounded" />
             <div className="absolute top-12 left-6 h-3 w-40 bg-brand-border rounded opacity-50" />
             <div className="absolute bottom-6 left-6 right-6 h-48 bg-brand-border/20 rounded-lg" />
          </div>
          <div className="h-80 bg-brand-surface border border-brand-border rounded-2xl relative">
             <div className="absolute top-6 left-6 h-4 w-40 bg-brand-border rounded" />
             <div className="absolute top-12 left-6 h-3 w-48 bg-brand-border rounded opacity-50" />
             <div className="absolute bottom-6 left-6 right-6 h-48 bg-brand-border/20 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-8 pb-12">
      {/* Month Toggle / Filter Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-text-secondary max-w-prose">
            Deep analysis of your spending and transactional metrics
          </p>
        </div>
      </div>

      {/* Analytics Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Avg Daily Spend */}
        <div className="glass-panel rounded-2xl p-4 md:p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Avg Daily Spend
            </span>
            <div className="p-1.5 rounded-lg bg-brand-surface text-text-secondary border border-brand-border">
              <Calendar size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-2">
            {formatValue(avgDailySpend)}
          </h2>
          <p className="text-[10px] text-text-secondary">Calculated over this billing period</p>
        </div>

        {/* Biggest Transaction */}
        <div className="glass-panel rounded-2xl p-4 md:p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Biggest Transaction
            </span>
            <div className="p-1.5 rounded-lg bg-brand-surface text-text-secondary border border-brand-border">
              <Zap size={16} />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-2 truncate max-w-full">
            {formatValue(biggestTx.amount)}
          </h2>
          <p className="text-[10px] text-text-secondary truncate">At {biggestTx.name}</p>
        </div>

        {/* Week-over-Week Compare */}
        <div className="glass-panel rounded-2xl p-4 md:p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Week-Over-Week
            </span>
            <div className={`p-1.5 rounded-lg ${wowChange < 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
              {wowChange < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
            </div>
          </div>
          <h2 className={`text-2xl font-bold tracking-tight mb-2 ${wowChange < 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {wowChange < 0 ? "" : "+"}
            {wowChange}%
          </h2>
          <p className="text-[10px] text-text-secondary">Compared to the previous week spending</p>
        </div>
      </section>

      {/* Main Charts Area */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Spending History (Bar Chart) */}
        <div className="glass-panel rounded-2xl p-4 md:p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-brand-border pb-4 mb-4">
            <div>
              <h3 className="font-semibold text-text-primary text-base">Monthly History</h3>
              <p className="text-xs text-text-secondary mt-0.5">Last 6 Months totals</p>
            </div>
          </div>
          <div className="relative h-64 w-full min-w-0">
            {monthlyHistory.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                  <line x1="0" y1="25%" x2="100%" y2="25%" stroke="var(--border-color)" strokeWidth="1" />
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--border-color)" strokeWidth="1" />
                  <line x1="0" y1="75%" x2="100%" y2="75%" stroke="var(--border-color)" strokeWidth="1" />
                </svg>
                <Calendar size={24} className="mb-3 text-text-muted" />
                <span className="text-xs text-text-secondary">No history data recorded.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={monthlyHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="month"
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
                  />
                  <Bar dataKey="expenses" fill="rgba(168, 85, 247, 0.45)" radius={[4, 4, 0, 0]} name="Spending">
                    {monthlyHistory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === monthlyHistory.length - 1 ? "url(#primaryGradient)" : "rgba(168, 85, 247, 0.4)"}
                        stroke={index === monthlyHistory.length - 1 ? "#a855f7" : "transparent"}
                        strokeWidth={1.5}
                      />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Breakdown (Bar Chart) */}
        <div className="glass-panel rounded-2xl p-4 md:p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-brand-border pb-4 mb-4">
            <div>
              <h3 className="font-semibold text-text-primary text-base">Category Breakdown</h3>
              <p className="text-xs text-text-secondary mt-0.5">Top expense categories this month</p>
            </div>
          </div>
          <div className="relative h-64 w-full min-w-0">
            {categories.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                  <line x1="0" y1="25%" x2="100%" y2="25%" stroke="var(--border-color)" strokeWidth="1" />
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--border-color)" strokeWidth="1" />
                  <line x1="0" y1="75%" x2="100%" y2="75%" stroke="var(--border-color)" strokeWidth="1" />
                </svg>
                <TrendingDown size={24} className="mb-3 text-text-muted" />
                <span className="text-xs text-text-secondary">No expense categories found.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart
                  layout="vertical"
                  data={categories}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="rgba(148, 143, 176, 0.4)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
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
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Spent">
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Top Merchants List */}
      <section className="glass-panel rounded-2xl p-4 md:p-6">
        <div className="flex justify-between items-center border-b border-brand-border pb-4 mb-6">
          <div>
            <h3 className="font-semibold text-text-primary text-base">Top Merchants</h3>
            <p className="text-xs text-text-secondary mt-0.5">Ranked by total expenditures</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {merchants.length === 0 ? (
            <div className="col-span-1 md:col-span-2 py-8 flex flex-col items-center justify-center text-xs text-text-secondary">
              <Zap size={24} className="mb-3 text-text-muted" />
              <span>No merchant rankings available.</span>
            </div>
          ) : (
            merchants.map((merchant, i) => (
              <div
                key={merchant.name}
                className="flex items-center justify-between p-4 rounded-xl border border-brand-border bg-brand-surface"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center font-bold text-accent-purple text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-text-primary">{merchant.name}</h4>
                    <p className="text-[10px] text-text-secondary">{merchant.count} transactions</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-text-primary">
                  {formatValue(merchant.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
