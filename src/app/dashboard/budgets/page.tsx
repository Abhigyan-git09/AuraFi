"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

export default function BudgetsPage() {
  const { formatValue } = useCurrency();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  
  // Form values
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [category, setCategory] = useState("Food & Drink");
  const [limit, setLimit] = useState("");
  
  const categoriesList = [
    "Food & Drink",
    "Subscriptions",
    "Transportation",
    "Shopping",
    "Housing",
    "Utilities",
    "Entertainment",
    "Travel",
    "Healthcare",
  ];

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/budgets");
      if (res.ok) {
        const data = await res.json();
        setBudgets(data || []);
      }
    } catch (err) {
      console.error("Failed to load budgets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    document.title = "Budgets — AuraFi";
  }, []);

  const handleOpenCreate = () => {
    setDialogMode("create");
    setCategory("Food & Drink");
    setLimit("");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (budget: Budget) => {
    setDialogMode("edit");
    setSelectedBudget(budget);
    setCategory(budget.category);
    setLimit(budget.limit.toString());
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(limit);
    if (isNaN(limitNum) || limitNum <= 0) return;

    setLoading(true);
    try {
      if (dialogMode === "create") {
        const res = await fetch("/api/budgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category, limit: limitNum }),
        });
        if (res.ok) {
          await fetchBudgets();
        }
      } else if (dialogMode === "edit" && selectedBudget) {
        const res = await fetch(`/api/budgets/${selectedBudget.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ limit: limitNum }),
        });
        if (res.ok) {
          await fetchBudgets();
        }
      }
    } catch (err) {
      console.error("Failed to save budget:", err);
    } finally {
      setIsDialogOpen(false);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBudgets((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete budget:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const budgetUtilization = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  const summary = budgets.reduce(
    (acc, b) => {
      const pct = (b.spent / b.limit) * 100;
      if (pct > 100) acc.exceeded += 1;
      else if (pct >= 85) acc.atRisk += 1;
      else acc.onTrack += 1;
      return acc;
    },
    { onTrack: 0, atRisk: 0, exceeded: 0 }
  );

  const getProgressColor = (pct: number) => {
    if (pct < 50) return "bg-emerald-500";
    if (pct <= 85) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getStatusBadge = (pct: number) => {
    if (pct < 50) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle size={10} /> On Track
        </span>
      );
    }
    if (pct <= 85) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <HelpCircle size={10} /> At Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <AlertCircle size={10} /> Exceeded
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header Widget */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-text-secondary max-w-[40ch]">
            Configure monthly expenditure limits across categories
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent-purple to-accent-fuchsia hover:opacity-90 active:scale-95 text-xs font-semibold rounded-xl text-white transition-all duration-150 cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Overview Stats Row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
        {loading && budgets.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b0914]/50 backdrop-blur-[1px] z-10">
            <Loader2 className="animate-spin text-accent-purple" size={32} />
          </div>
        ) : null}

        <div className="glass-panel rounded-2xl p-6">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">
            Total Allocated
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-2">
            {formatValue(totalLimit)}
          </h2>
          <div className="w-full bg-brand-surface rounded-full h-1.5 mt-4 overflow-hidden border border-brand-border">
            <div
              className="bg-accent-purple h-full transition-all duration-500"
              style={{ width: `${Math.min(100, budgetUtilization)}%` }}
            />
          </div>
          <p className="text-[10px] text-text-secondary mt-2">
            {budgetUtilization.toFixed(1)}% spent ({formatValue(totalSpent)} total)
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">
            On Track Budgets
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-emerald-400 mb-2">
            {summary.onTrack}
          </h2>
          <p className="text-[10px] text-text-secondary">Under 50% limit utilized</p>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">
            Exceeded/At Risk
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-rose-400 mb-2">
            {summary.exceeded + summary.atRisk}
          </h2>
          <p className="text-[10px] text-text-secondary">
            {summary.exceeded} exceeded, {summary.atRisk} at risk
          </p>
        </div>
      </section>

      {/* Budgets Progress List */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 relative min-h-[150px]">
        {loading && budgets.length > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b0914]/50 backdrop-blur-[1px] z-10">
            <Loader2 className="animate-spin text-accent-purple" size={32} />
          </div>
        ) : null}

        {budgets.length === 0 && !loading ? (
          <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-20 px-6">
            <div className="w-16 h-16 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mb-4">
              <Wallet size={28} className="text-accent-purple" />
            </div>
            <h4 className="text-sm font-semibold text-text-primary mb-1.5">No category budgets established</h4>
            <p className="text-xs text-text-secondary text-center max-w-[30ch] mb-6">
              Create category budgets to define your spending limits and track your progress.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-fuchsia text-white text-xs font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus size={14} />
              <span>Create Budget</span>
            </button>
          </div>
        ) : (
          budgets.map((b) => {
            const percentUsed = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
            return (
              <div key={b.id} className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-text-primary text-base">{b.category}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {formatValue(b.spent)} of {formatValue(b.limit)} spent
                      </p>
                    </div>
                    {getStatusBadge(percentUsed)}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-brand-surface border border-brand-border rounded-full h-2 mt-4 overflow-hidden">
                    <div
                      className={`${getProgressColor(percentUsed)} h-full transition-all duration-500`}
                      style={{ width: `${Math.min(100, percentUsed)}%` }}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3 border-t border-brand-border pt-4 mt-6">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 rounded-lg bg-brand-surface border border-brand-border text-text-secondary hover:text-text-primary transition-all duration-150 cursor-pointer"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-lg bg-brand-surface border border-brand-border text-text-secondary hover:text-rose-400 transition-all duration-150 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Budget Creation / Edit Overlay Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel bg-brand-sidebar border border-brand-border max-w-sm w-full p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 text-text-primary">
            <div className="flex items-center gap-3 text-accent-purple mb-4">
              <Wallet size={24} />
              <h4 className="font-bold text-text-primary text-base">
                {dialogMode === "create" ? "Add Category Budget" : "Adjust Budget Limit"}
              </h4>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {dialogMode === "create" ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                    Select Category
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-brand-input border border-brand-border focus:border-accent-purple rounded-xl text-xs font-semibold text-text-primary transition-all appearance-none cursor-pointer focus:outline-none"
                    >
                      {categoriesList.map((catName) => (
                        <option key={catName} value={catName}>
                          {catName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-3.5 text-text-secondary pointer-events-none" size={14} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                    Category
                  </span>
                  <span className="text-sm font-semibold text-text-primary py-2">{category}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                  Monthly Limit ($)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-4 py-2.5 bg-brand-input border border-brand-border focus:border-accent-purple rounded-xl text-sm transition-all focus:outline-none text-text-primary"
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 bg-brand-surface border border-brand-border hover:bg-brand-surface-hover text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-fuchsia hover:opacity-90 active:scale-95 text-xs font-semibold rounded-xl text-white transition-all cursor-pointer"
                >
                  {dialogMode === "create" ? "Create Budget" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
