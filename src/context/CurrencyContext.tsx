"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "INR" | "CAD";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatValue: (value: number) => string;
  convertToLocal: (usdValue: number) => number;
  convertFromLocal: (localValue: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");

  // Load currency preference from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem("aurafi-currency") as CurrencyCode | null;
    if (savedCurrency && ["USD", "EUR", "GBP", "INR", "CAD"].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem("aurafi-currency", code);
  };

  const getRate = () => {
    if (currency === "EUR") return 0.92;
    if (currency === "GBP") return 0.79;
    if (currency === "INR") return 83.3;
    if (currency === "CAD") return 1.36;
    return 1;
  };

  const convertToLocal = (usdValue: number) => usdValue * getRate();
  const convertFromLocal = (localValue: number) => localValue / getRate();

  const formatValue = (value: number) => {
    const converted = convertToLocal(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatValue, convertToLocal, convertFromLocal }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
