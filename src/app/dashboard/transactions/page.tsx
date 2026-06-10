"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  ChevronDown,
  Loader2,
  Filter,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

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

interface BankAccount {
  id: string;
  name: string;
  mask: string;
}

export default function TransactionsPage() {
  const { formatValue } = useCurrency();
  
  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  
  // Sort State
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // DB-Fetched State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters Collapsible State
  const [filtersOpen, setFiltersOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setFiltersOpen(false);
    }
    document.title = "Transactions — AuraFi";
  }, []);

  // Categories list
  const categories = [
    "Food & Drink",
    "Groceries",
    "Subscriptions",
    "Transportation",
    "Housing",
    "Shopping",
    "Entertainment",
    "Utilities",
    "Income",
  ];

  // Fetch Accounts
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch("/api/accounts");
        if (res.ok) {
          const data = await res.json();
          setAccounts(data || []);
        }
      } catch (err) {
        console.error("Failed to load accounts for transactions filter:", err);
      }
    }
    fetchAccounts();
  }, []);

  // Fetch Transactions
  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          query: searchQuery,
          startDate,
          endDate,
          category: selectedCategory,
          accountId: selectedAccount,
          type: selectedType,
          sortBy,
          sortOrder,
        });

        const res = await fetch(`/api/transactions?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions || []);
          setTotalPages(data.totalPages || 1);
          setTotalCount(data.totalCount || 0);
        }
      } catch (err) {
        console.error("Failed to load transactions list:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [
    currentPage,
    searchQuery,
    startDate,
    endDate,
    selectedCategory,
    selectedAccount,
    selectedType,
    sortBy,
    sortOrder,
  ]);

  const toggleSort = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const handleExportCSV = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: "1",
        limit: "10000", // Fetch all records matching filter
        query: searchQuery,
        startDate,
        endDate,
        category: selectedCategory,
        accountId: selectedAccount,
        type: selectedType,
        sortBy,
        sortOrder,
      });

      const res = await fetch(`/api/transactions?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const txs = data.transactions || [];
        
        const headers = ["ID", "Name", "Merchant", "Amount", "Date", "Category", "Account", "Type", "Pending"];
        const rows = txs.map((tx: any) => [
          tx.id,
          `"${tx.name}"`,
          `"${tx.merchantName}"`,
          tx.amount,
          tx.date,
          `"${tx.personalFinanceCategory}"`,
          `"${tx.accountName}"`,
          tx.type,
          tx.pending
        ]);

        const csvContent = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `AuraFi_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to export transactions:", error);
    }
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

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Page Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <p className="text-xs text-text-secondary mt-0.5">
            Audit and filter through all user statements
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-surface border border-brand-border hover:bg-brand-surface-hover text-sm font-semibold rounded-xl transition-all cursor-pointer text-text-primary"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      <div className="md:hidden flex justify-end">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-surface border border-brand-border hover:bg-brand-surface-hover text-sm font-semibold rounded-xl transition-all cursor-pointer text-text-primary"
        >
          <Filter size={16} />
          <span>{filtersOpen ? "Hide Filters" : "Show Filters"}</span>
        </button>
      </div>

      {/* Filter Control Box */}
      {filtersOpen && (
        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
          {/* Row 1: Search & Date Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-3 text-text-secondary" size={18} />
            <input
              type="text"
              placeholder="Search merchants, descriptions..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 bg-brand-input border border-brand-border focus:border-accent-purple rounded-xl text-sm transition-all focus:outline-none placeholder-text-muted text-text-primary"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3 text-text-secondary pointer-events-none" size={16} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-brand-input border border-brand-border focus:border-accent-purple rounded-xl text-sm transition-all focus:outline-none text-text-secondary font-medium"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3 text-text-secondary pointer-events-none" size={16} />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-brand-input border border-brand-border focus:border-accent-purple rounded-xl text-sm transition-all focus:outline-none text-text-secondary font-medium"
            />
          </div>
        </div>

        {/* Row 2: Select Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Category Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
              Category
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 bg-brand-input border border-brand-border focus:border-accent-purple rounded-xl text-xs font-semibold text-text-primary transition-all appearance-none cursor-pointer focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-3.5 text-text-secondary pointer-events-none" size={14} />
            </div>
          </div>

          {/* Account Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
              Bank Account
            </label>
            <div className="relative">
              <select
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 bg-brand-input border border-brand-border focus:border-accent-purple rounded-xl text-xs font-semibold text-text-primary transition-all appearance-none cursor-pointer focus:outline-none"
              >
                <option value="all">All Accounts</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (...{acc.mask})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-3.5 text-text-secondary pointer-events-none" size={14} />
            </div>
          </div>

          {/* Transaction Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
              Transaction Type
            </label>
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 bg-brand-input border border-brand-border focus:border-accent-purple rounded-xl text-xs font-semibold text-text-primary transition-all appearance-none cursor-pointer focus:outline-none"
              >
                <option value="all">All Actions</option>
                <option value="debit">Expenses (Debit)</option>
                <option value="credit">Income (Credit)</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-3.5 text-text-secondary pointer-events-none" size={14} />
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Transactions Table Display */}
      <div className="glass-panel rounded-2xl overflow-hidden min-h-[300px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b0914]/50 backdrop-blur-[1px] z-10">
            <Loader2 className="animate-spin text-accent-purple" size={32} />
          </div>
        ) : null}

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center mb-4">
              <Search size={28} className="text-text-muted" />
            </div>
            <h4 className="text-sm font-semibold text-text-primary mb-1.5">No transactions found</h4>
            <p className="text-xs text-text-secondary text-center max-w-[30ch] mb-6">
              There are no transactions that match your current filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStartDate("");
                setEndDate("");
                setSelectedCategory("all");
                setSelectedAccount("all");
                setSelectedType("all");
              }}
              className="px-4 py-2 bg-brand-surface border border-brand-border rounded-xl text-xs font-semibold text-text-primary hover:bg-brand-surface-hover transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-border text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Transaction</th>
                    <th className="px-6 py-4">Account</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 cursor-pointer hover:text-text-primary transition-colors" onClick={() => toggleSort("date")}>
                      <span className="flex items-center gap-1.5">
                        Date <ArrowUpDown size={12} />
                      </span>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-text-primary transition-colors text-right" onClick={() => toggleSort("amount")}>
                      <span className="flex items-center gap-1.5 justify-end">
                        Amount <ArrowUpDown size={12} />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-brand-border hover:bg-brand-surface text-sm transition-colors duration-150"
                    >
                      <td className="px-6 py-3.5 flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-text-secondary shrink-0">
                          <ShoppingCart size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-text-primary truncate max-w-[15ch] sm:max-w-[25ch] lg:max-w-[35ch]">{tx.name}</p>
                          {tx.pending && (
                            <span className="inline-block text-[9px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded font-medium mt-0.5">
                              Pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-text-secondary">{tx.accountName}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] border rounded-full font-medium ${getCategoryBadgeColor(tx.personalFinanceCategory)}`}>
                          {tx.personalFinanceCategory}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-text-secondary">
                        {new Date(tx.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className={`px-6 py-3.5 text-right font-bold ${tx.type === "credit" ? "text-emerald-400" : "text-rose-400"}`}>
                        {tx.type === "credit" ? "+" : "-"}
                        {formatValue(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-brand-border">
              <span className="text-xs text-text-secondary">
                Showing {Math.min(totalCount, (currentPage - 1) * itemsPerPage + 1)}-
                {Math.min(totalCount, currentPage * itemsPerPage)} of{" "}
                {totalCount} items
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-brand-border text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-brand-border text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
