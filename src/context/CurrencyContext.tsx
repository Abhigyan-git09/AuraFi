"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "INR" | "CAD";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatValue: (value: number) => string;
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

  const formatValue = (value: number) => {
    // Conversions from USD base rates (approximate sandbox rates)
    let rate = 1;
    if (currency === "EUR") rate = 0.92;
    else if (currency === "GBP") rate = 0.79;
    else if (currency === "INR") rate = 83.3;
    else if (currency === "CAD") rate = 1.36;

    const converted = value * rate;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatValue }}>
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
