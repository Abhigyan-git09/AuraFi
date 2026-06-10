export interface BankAccount {
  id: string;
  name: string;
  officialName: string;
  type: "checking" | "savings" | "credit";
  subtype: string;
  currentBalance: number;
  availableBalance: number;
  limitBalance?: number;
  mask: string;
  institutionName: string;
  lastSynced: string;
}

export interface Transaction {
  id: string;
  name: string;
  merchantName: string;
  amount: number;
  date: string;
  category: string[];
  personalFinanceCategory: string;
  pending: boolean;
  accountId: string;
  accountName: string;
  type: "debit" | "credit";
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

export const mockAccounts: BankAccount[] = [
  {
    id: "acc_1",
    name: "Aura Checking",
    officialName: "First Platypus Premium Checking",
    type: "checking",
    subtype: "checking",
    currentBalance: 8420.50,
    availableBalance: 8420.50,
    mask: "4592",
    institutionName: "First Platypus Bank",
    lastSynced: "2026-06-09T17:00:00Z"
  },
  {
    id: "acc_2",
    name: "Growth Savings",
    officialName: "First Platypus High-Yield Savings",
    type: "savings",
    subtype: "savings",
    currentBalance: 115200.00,
    availableBalance: 115200.00,
    mask: "8103",
    institutionName: "First Platypus Bank",
    lastSynced: "2026-06-09T17:00:00Z"
  },
  {
    id: "acc_3",
    name: "Fuchsia Credit Card",
    officialName: "AuraFi Fuchsia Elite Credit Card",
    type: "credit",
    subtype: "credit card",
    currentBalance: 971.50,
    availableBalance: 9028.50,
    limitBalance: 10000.00,
    mask: "9012",
    institutionName: "AuraFi Services",
    lastSynced: "2026-06-09T17:15:00Z"
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: "tx_1",
    name: "Whole Foods Market",
    merchantName: "Whole Foods",
    amount: 142.50,
    date: "2026-06-09",
    category: ["Food & Drink", "Groceries"],
    personalFinanceCategory: "Food & Drink",
    pending: false,
    accountId: "acc_1",
    accountName: "Aura Checking",
    type: "debit"
  },
  {
    id: "tx_2",
    name: "Vanguard Direct Deposit",
    merchantName: "Vanguard Group",
    amount: 4000.00,
    date: "2026-06-08",
    category: ["Transfer", "Deposit"],
    personalFinanceCategory: "Income",
    pending: false,
    accountId: "acc_2",
    accountName: "Growth Savings",
    type: "credit"
  },
  {
    id: "tx_3",
    name: "Netflix.com",
    merchantName: "Netflix",
    amount: 15.99,
    date: "2026-06-07",
    category: ["Entertainment", "Subscriptions"],
    personalFinanceCategory: "Subscriptions",
    pending: false,
    accountId: "acc_3",
    accountName: "Fuchsia Credit",
    type: "debit"
  },
  {
    id: "tx_4",
    name: "Stripe Monthly Payout",
    merchantName: "Stripe",
    amount: 3200.00,
    date: "2026-06-05",
    category: ["Income", "Freelance"],
    personalFinanceCategory: "Income",
    pending: false,
    accountId: "acc_1",
    accountName: "Aura Checking",
    type: "credit"
  },
  {
    id: "tx_5",
    name: "Chevron Gasoline",
    merchantName: "Chevron",
    amount: 45.00,
    date: "2026-06-04",
    category: ["Travel", "Gas Station"],
    personalFinanceCategory: "Transportation",
    pending: false,
    accountId: "acc_3",
    accountName: "Fuchsia Credit",
    type: "debit"
  },
  {
    id: "tx_6",
    name: "Uber Trips",
    merchantName: "Uber",
    amount: 28.40,
    date: "2026-06-03",
    category: ["Travel", "Ride Share"],
    personalFinanceCategory: "Transportation",
    pending: false,
    accountId: "acc_1",
    accountName: "Aura Checking",
    type: "debit"
  },
  {
    id: "tx_7",
    name: "Starbucks Coffee",
    merchantName: "Starbucks",
    amount: 6.75,
    date: "2026-06-02",
    category: ["Food & Drink", "Coffee Shop"],
    personalFinanceCategory: "Food & Drink",
    pending: true,
    accountId: "acc_1",
    accountName: "Aura Checking",
    type: "debit"
  },
  {
    id: "tx_8",
    name: "Apple One Subscription",
    merchantName: "Apple",
    amount: 32.95,
    date: "2026-06-01",
    category: ["Entertainment", "Subscriptions"],
    personalFinanceCategory: "Subscriptions",
    pending: false,
    accountId: "acc_3",
    accountName: "Fuchsia Credit",
    type: "debit"
  },
  {
    id: "tx_9",
    name: "Amazon Marketplace",
    merchantName: "Amazon",
    amount: 189.99,
    date: "2026-05-28",
    category: ["Shopping", "Electronics"],
    personalFinanceCategory: "Shopping",
    pending: false,
    accountId: "acc_3",
    accountName: "Fuchsia Credit",
    type: "debit"
  },
  {
    id: "tx_10",
    name: "Landlord Rent Payment",
    merchantName: "Metropolitan Living",
    amount: 1800.00,
    date: "2026-05-01",
    category: ["Housing", "Rent"],
    personalFinanceCategory: "Housing",
    pending: false,
    accountId: "acc_1",
    accountName: "Aura Checking",
    type: "debit"
  },
  {
    id: "tx_11",
    name: "Trader Joe's",
    merchantName: "Trader Joe's",
    amount: 88.40,
    date: "2026-05-25",
    category: ["Food & Drink", "Groceries"],
    personalFinanceCategory: "Food & Drink",
    type: "debit",
    accountId: "acc_1",
    accountName: "Aura Checking",
    pending: false
  },
  {
    id: "tx_12",
    name: "Spotify Premium",
    merchantName: "Spotify",
    amount: 10.99,
    date: "2026-05-22",
    category: ["Entertainment", "Subscriptions"],
    personalFinanceCategory: "Subscriptions",
    type: "debit",
    accountId: "acc_3",
    accountName: "Fuchsia Credit",
    pending: false
  },
  {
    id: "tx_13",
    name: "Steam Games",
    merchantName: "Steam",
    amount: 59.99,
    date: "2026-05-20",
    category: ["Entertainment", "Gaming"],
    personalFinanceCategory: "Entertainment",
    type: "debit",
    accountId: "acc_3",
    accountName: "Fuchsia Credit",
    pending: false
  },
  {
    id: "tx_14",
    name: "PG&E Electric Utility",
    merchantName: "PG&E",
    amount: 112.50,
    date: "2026-05-18",
    category: ["Utilities", "Electric"],
    personalFinanceCategory: "Utilities",
    type: "debit",
    accountId: "acc_1",
    accountName: "Aura Checking",
    pending: false
  },
  {
    id: "tx_15",
    name: "Gym Membership",
    merchantName: "Equinox",
    amount: 220.00,
    date: "2026-05-15",
    category: ["Health & Wellness", "Fitness"],
    personalFinanceCategory: "Subscriptions",
    type: "debit",
    accountId: "acc_3",
    accountName: "Fuchsia Credit",
    pending: false
  }
];

export const mockBudgets: Budget[] = [
  { id: "b1", category: "Food & Drink", limit: 600, spent: 237.65 },
  { id: "b2", category: "Subscriptions", limit: 100, spent: 59.93 },
  { id: "b3", category: "Transportation", limit: 300, spent: 73.40 },
  { id: "b4", category: "Shopping", limit: 500, spent: 189.99 },
  { id: "b5", category: "Housing", limit: 2000, spent: 1800.00 },
  { id: "b6", category: "Utilities", limit: 250, spent: 112.50 }
];

export const mockDailySpending30Days = [
  { date: "May 11", spend: 120 },
  { date: "May 14", spend: 45 },
  { date: "May 17", spend: 80 },
  { date: "May 20", spend: 195 },
  { date: "May 23", spend: 110 },
  { date: "May 26", spend: 65 },
  { date: "May 29", spend: 280 },
  { date: "Jun 01", spend: 32 },
  { date: "Jun 04", spend: 45 },
  { date: "Jun 07", spend: 15 },
  { date: "Jun 09", spend: 142 }
];

export const mockMonthlyAnalytics = [
  { month: "Jan", income: 7200, expenses: 2800 },
  { month: "Feb", income: 7200, expenses: 3100 },
  { month: "Mar", income: 7600, expenses: 2950 },
  { month: "Apr", income: 8400, expenses: 3200 },
  { month: "May", income: 8100, expenses: 3050 },
  { month: "Jun", income: 8420, expenses: 3150 }
];

export const mockTopMerchants = [
  { name: "Whole Foods", amount: 388.40, count: 3 },
  { name: "American Express Payment", amount: 1500.00, count: 1 },
  { name: "Amazon", amount: 189.99, count: 1 },
  { name: "Equinox", amount: 220.00, count: 1 },
  { name: "Netflix", amount: 15.99, count: 1 }
];
