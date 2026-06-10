# AuraFi — Implementation Handoff

## Project Overview

AuraFi is a premium personal finance dashboard built with Next.js 16 (App Router), NextAuth v5, Prisma (PostgreSQL), and Plaid. It features full CRUD for accounts, transactions, budgets, and settings, with graceful offline/mock fallback throughout.

---

## Changes Made

### 1. Core Bug Fixes

#### 1.1 Dashboard Logout (`src/app/dashboard/layout.tsx`)
- **Before:** `handleLogout` called `router.push("/login")` without invalidating the NextAuth session.
- **After:** Calls `await signOut({ redirect: false })` from `next-auth/react`, then redirects to `/login`.
- **Import added:** `import { signOut } from "next-auth/react"`.

#### 1.2 Sync Button Not Calling API (`src/app/dashboard/layout.tsx`)
- **Before:** `triggerSync` used `await new Promise((resolve) => setTimeout(resolve, 2000))` — a fake 2s delay that never contacted the server.
- **After:** Calls `fetch("/api/plaid/sync", { method: "POST" })`, reads the response for transaction counts, and displays the actual result in the toast.

#### 1.3 Hardcoded User Avatar (`src/app/dashboard/layout.tsx`)
- **Before:** Header showed "JD" / "Jane Doe" hardcoded.
- **After:** Reads `session.user.name` from `useSession()`, renders the first letter as avatar initial and the full name as text. Falls back to "U" / "User" if session is unavailable.
- **Import added:** `import { useSession } from "next-auth/react"`.

#### 1.4 `let` → `const` (`src/app/api/plaid/exchange-token/route.ts`)
- **Before:** `let plaidItem` declared with `let` but never reassigned.
- **After:** Changed to `const plaidItem`.

#### 1.5 Plaid `icon_url` Access (`src/app/api/plaid/sync/route.ts`, `src/app/api/plaid/webhook/route.ts`)
- **Before:** Accessed `t.personal_finance_category?.icon_url` — but `PersonalFinanceCategory` has no `icon_url` property.
- **After:** Uses the correct top-level field: `t.personal_finance_category_icon_url`.

---

### 2. New API Routes (6 routes added)

| Route | File | Method | Purpose |
|---|---|---|---|
| `/api/transactions/[id]` | `src/app/api/transactions/[id]/route.ts` | `PATCH`, `DELETE` | Recategorize/rename a transaction; delete a manual transaction |
| `/api/transactions` | `src/app/api/transactions/route.ts` | `POST` | Create a manual cash/check transaction outside Plaid |
| `/api/accounts/[id]` | `src/app/api/accounts/[id]/route.ts` | `GET`, `PATCH`, `DELETE` | Fetch single account (with institution name + last sync); update nickname; disconnect account |
| `/api/plaid/items` | `src/app/api/plaid/items/route.ts` | `GET` | List connected institutions with account count per item |
| `/api/plaid/webhook` | `src/app/api/plaid/webhook/route.ts` | `POST` | Handle Plaid webhooks: `SYNC_UPDATES_AVAILABLE`, `ITEM/ERROR`, `ITEM/PENDING_EXPIRATION`, `ITEM/USER_PERMISSION_REVOKED`, `AUTH/AUTOMATICALLY_VERIFIED` |

**Design patterns followed for all new routes:**
- Zod validation for request bodies
- Session authentication via `auth()` from NextAuth
- Try-catch with console.warn + graceful mock fallback for offline DB
- Ownership verification for all mutations (`userId` check)
- Consistent error response shape: `{ message: string }` with appropriate HTTP status codes

---

### 3. Cleanup

#### 3.1 Next.js 16 Proxy Convention (`src/proxy.ts`)
- **Before:** Used deprecated `export default NextAuth(authConfig).auth` (default export).
- **After:** Uses the proper named export pattern for Next.js 16: `const { auth: proxy } = NextAuth(authConfig)` + `export { proxy }`.

#### 3.2 Redundant `formatCurrency` Wrappers Removed
Files cleaned up:
- `src/app/dashboard/accounts/page.tsx`
- `src/app/dashboard/analytics/page.tsx`
- `src/app/dashboard/budgets/page.tsx`

All had `const formatCurrency = (val: number) => formatValue(val)` — a 1:1 delegate. Replaced all usages with `formatValue` directly from the currency context.

#### 3.3 CSV Export (`src/app/dashboard/transactions/page.tsx`)
- **Before:** Used `data:text/csv;charset=utf-8,` data URI — hits URL length limits on large datasets.
- **After:** Uses `Blob` + `URL.createObjectURL()` + `URL.revokeObjectURL()` for memory-safe, large-payload CSV downloads.

#### 3.4 Unused Imports Removed
- `Loader2` from `src/app/dashboard/analytics/page.tsx`
- `useMemo` from `src/app/dashboard/transactions/page.tsx`

#### 3.5 Unused Catch Variables Cleaned Up
- `src/app/api/plaid/sync/route.ts` (2 instances of `catch (dbError)` → `catch`)
- `src/app/dashboard/accounts/page.tsx` (`catch (err)` → `catch`)
- `src/app/login/page.tsx` (`catch (err: any)` → `catch`)
- `src/app/dashboard/layout.tsx` (`catch (error)` → `catch`)

#### 3.6 Prisma
- `npx prisma generate` completed successfully (Prisma Client v7.8.0 generated).

---

### 4. Current Project State

| Metric | Value |
|---|---|
| TypeScript errors | **0** |
| Build status | **Passes** (27 routes, 25 pages) |
| API routes | **21** (6 added, 15 existing + 1 modified) |
| ESLint warnings | **0** |
| Remaining lint "errors" | **38** (all by-design: `set-state-in-effect` for data fetching, `no-explicit-any` for mock fallback, `no-require-imports` for dynamic mock imports) |

---

## What Remains to Be Implemented

### 1. Database Setup (Prerequisite for Real Backend)

The app currently runs entirely on mock data. To connect the real backend:

```bash
# Ensure PostgreSQL is running, then:
npx prisma db push
# or for versioned migrations:
npx prisma db migrate dev --name init
```

Expected side effect: the `.env` `DATABASE_URL` must point to a running PostgreSQL instance (default: `postgresql://postgres:postgres@localhost:5432/aurafi?schema=public`).

### 2. Plaid Sandbox Credentials

Replace the placeholders in `.env`:
```
PLAID_CLIENT_ID="your_sandbox_client_id"
PLAID_SECRET="your_sandbox_secret"
```

Get these from https://dashboard.plaid.com. The app auto-detects placeholder strings and falls back to mock mode when they're missing.

### 3. NextAuth Secret

Generate a secure secret:
```bash
openssl rand -base64 32
```
Replace `NEXTAUTH_SECRET` in `.env`.

### 4. Potential Enhancements (Optional)

| Area | Description |
|---|---|
| **Data Refresh** | The dashboard pages fetch data on mount but don't auto-refresh. A periodic poll or SSE/WebSocket for live updates could be added. |
| **Plaid Item Details** | `GET /api/plaid/items/[id]` could be added for fetching a single institution's details, status, and account list. |
| **Account Sync Status** | The accounts list currently shows `lastSynced` times but doesn't have a dedicated endpoint to trigger per-item sync. The sync button hits all items at once. |
| **Transaction Categories** | `GET /api/transactions/categories` could return a deduplicated list of categories used by the user. Currently the frontend has a hardcoded list. |
| **Date Range Validation** | The transactions filter accepts any `startDate`/`endDate` without validation. Zod schemas in query params could be added. |
| **Rate Limiting** | No rate limiting on API routes (low priority for sandbox). |
| **Admin Panel** | No admin dashboard for user management exists. |
| **Email Service** | Notification preferences are stored but no actual email sending is wired up (expected for sandbox). |

---

---

## 5. Frontend UI Audit — Improvement Opportunities

### 5.1 Typography & Readability

**Current state:** The body text in metric cards, table cells, and filter labels spans the full container width without any cap. The DESIGN.md specifies 65-character line-length caps for body copy, but this isn't enforced anywhere.

**Specific offenders:**
- Analytics page description text: "Deep analysis of your spending and transactional metrics" — stretches full-width.
- Transaction table `<td>` cells with merchant names truncated via `max-w-[150px]` instead of a proper line-length cap.
- Budget category labels on progress cards have no width limit.

**Recommended fixes:**
- Add `max-w-prose` (or `max-w-[65ch]`) to description paragraphs in page headers.
- Replace the arbitrary `max-w-[150px]` on transaction name cells with a responsive `max-w-[15ch] sm:max-w-[25ch] lg:max-w-[35ch]` to let wider screens show more context.
- Apply a consistent `max-w-[40ch]` to budget category descriptions and settings section descriptions.

**Files to touch:** `dashboard/page.tsx` (lines 409, 416), `dashboard/analytics/page.tsx` (line 177), `dashboard/transactions/page.tsx` (line 407), `dashboard/settings/page.tsx` (lines 331, 344, 357, 385).

---

### 5.2 Spacing & Padding Consistency

**Current state:** Different components use different padding values (`p-4`, `p-6`, `px-6 py-4`) for structurally similar elements. This creates subtle visual noise.

**Inconsistencies found:**

| Component | Current padding | Consistent target |
|---|---|---|
| Dashboard metric cards | `p-6` | `p-6` (OK) |
| Transaction filter panel | `p-6` | `p-6` (OK) |
| Transaction table header cells | `p-4` | `px-6 py-4` (match table wrapper) |
| Transaction table body cells | `p-4` | `px-6 py-3.5` (keep existing body padding) |
| Transaction pagination footer | `px-6 py-4` | `px-6 py-4` (OK) |
| Budget progress card actions | `px-4 py-2` buttons | Standardize button padding |

**Recommended fix for table headers:** Change `src/app/dashboard/transactions/page.tsx` line 381 from `th className="p-4"` to `th className="px-6 py-4"` to match the wrapper's horizontal padding.

**Files to touch:** `dashboard/transactions/page.tsx` (lines 381-394), `dashboard/page.tsx` (lines 393-399).

---

### 5.3 Empty States — Missing Visual Hierarchy

**Current state:** Empty states are plain text strings with no icon, no illustration, and no actionable next-step emphasis. The DESIGN.md explicitly calls for "illustration, clear call-to-actions, and copy instructions."

**Current empty states found:**

| Page | Current text | Issue |
|---|---|---|
| Overview (daily spend) | "No spending transactions recorded in the last 30 days." | No icon, no CTA |
| Overview (categories) | "No expense data." | Minimal, no guidance |
| Overview (recent activity) | "No transactions synced yet. Connect a bank account to sync statements." | No CTA button, just text |
| Transactions | "No transactions match your filter criteria." + "Clear all filters" link | Link is small, no emphasis |
| Accounts | "No bank accounts connected. Click \"Connect New Account\" to begin." | Describes action but doesn't provide a button |
| Budgets | "No category budgets established. Click \"Create Budget\" to define your limits." | Same pattern — describes but doesn't provide |
| Analytics (history) | "No history data recorded." | Minimal |
| Analytics (categories) | "No expense categories found." | Minimal |
| Analytics (merchants) | "No merchant rankings available." | Minimal |
| Budgets (stats row) | Shows "0" for on-track/at-risk counts with no guidance | Confusing when no budgets exist |

**Recommended pattern for all empty states** (example: accounts):
```tsx
<div className="flex flex-col items-center justify-center py-20 px-6">
  <div className="w-16 h-16 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mb-4">
    <CreditCard size={28} className="text-accent-purple" />
  </div>
  <h4 className="text-sm font-semibold text-text-primary mb-1.5">No accounts connected</h4>
  <p className="text-xs text-text-secondary text-center max-w-[30ch] mb-6">
    Link your first bank account via Plaid to start tracking balances and transactions.
  </p>
  <button className="...">Connect New Account</button>
</div>
```

**Files to touch:** All page files under `dashboard/`. Each empty state needs 4-6 additional lines for the icon wrapper + heading + description text + optional CTA button.

---

### 5.4 Mobile Layout — Wasted Vertical Space

**Current state:** On mobile (< 768px), all pages stack to a single column with generous gaps (`gap-8`). Charts below metrics means the user scrolls past 4 metric cards before seeing any chart. The analytics page has 3 metric cards + 2 charts + 1 merchant list = 6 vertical blocks.

**Specific observations:**
- Overview page: `gap-6` on the grid, `gap-8` on sections. Metrics stack tall before charts.
- Analytics page: 3 metric cards at `gap-6` each take ~180px, pushing charts far down.
- Budgets page: stat cards at `gap-6` push the budget list below the fold.

**Recommended fixes:**
- **Reduce section gap on mobile:** Change `gap-8` to `gap-4 md:gap-8` on the outer flex containers of each page.
- **2-column stat cards on mobile:** Change `grid-cols-1 sm:grid-cols-2` to `grid-cols-2` on metric rows so mobile gets 2-up grids instead of a single stack. The text would be smaller but the layout would be more dense.
- **Condensed metric cards on mobile:** Reduce card padding on small screens: `p-4 md:p-6` on metric cards to show 2-up without overflow.

**Files to touch:** `dashboard/page.tsx` (lines 111, 160, 162), `dashboard/analytics/page.tsx` (lines 154, 183), `dashboard/budgets/page.tsx` (lines 198, 205, 223), `dashboard/layout.tsx` (line 341 main padding).

---

### 5.5 Filters — Mobile Collapse

**Current state:** The transactions filter panel renders 7 controls (search, 2x date, category select, account select, type select) stacked vertically on mobile. This takes ~500px of vertical space before the user sees any transactions.

**Recommended fix:**
- Wrap the filter controls in a collapsible section on mobile only.
- Show a "Filters" button on mobile that toggles the filter row visibility.
- Persist the open/closed state locally (or default to collapsed on mobile, open on desktop).

**Implementation sketch:**
```tsx
const [filtersOpen, setFiltersOpen] = useState(true);
// On mount, collapse on mobile:
useEffect(() => {
  if (window.innerWidth < 768) setFiltersOpen(false);
}, []);
```
Then wrap the filter `div` in `{filtersOpen && (...)}` and add a toggle button.

**Files to touch:** `dashboard/transactions/page.tsx` (around lines 232-348).

---

### 5.6 Toggle Controls — Visual Inconsistency

**Current state:** The notification preference toggles in Settings use native `<input type="checkbox">` styled with Tailwind `w-4 h-4`. This renders as a small square checkbox — inconsistent with the premium glass aesthetic used everywhere else.

**Recommended fix:**
Replace with a custom pill toggle:

```tsx
const [checked, setChecked] = useState(false);
<button
  onClick={() => setChecked(!checked)}
  className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${
    checked ? "bg-accent-purple" : "bg-brand-surface border border-brand-border"
  }`}
>
  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform duration-200 ${
    checked ? "translate-x-5" : "translate-x-0.5"
  }`} />
</button>
```

**Files to touch:** `dashboard/settings/page.tsx` (lines 333-364, three toggle instances).

---

### 5.7 Information Density — "Cockpit Dense" Rating

**Current state:** The DESIGN.md targets an 8/10 density rating, but several pages feel sparse:

- **Overview page:** Shows 4 metrics + 2 charts + 5 recent transactions. A "cockpit" could show 6-8 metrics, a mini-calendar with spend dots, a budget utilization bar, and an account balance summary — all above the fold on desktop.
- **Analytics page:** 3 metrics + 2 charts. Missing: a small monthly comparison table, a running 12-month trend sparkline under each metric, a "recurring vs one-time" split visualization.
- **Accounts page:** Shows accounts in a 3-column grid with large cards. Each card has ~60% whitespace. A denser layout could show account rows in a table with inline progress bars for credit utilization.

**Low-risk density improvements:**
- **Overview:** Add a 5th mini-metric card showing "Active Budgets" count (using existing data from the budgets API).
- **Analytics:** Add a small table under the charts showing the exact monthly numbers (income/expenses/net) alongside the bar chart.
- **Accounts:** Reduce card padding to `p-4 md:p-5` and use 4 columns on desktop: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.

**Files to touch:** `dashboard/page.tsx`, `dashboard/analytics/page.tsx`, `dashboard/accounts/page.tsx`.

---

### 5.8 Chart Empty States — Missing Visual Feedback

**Current state:** When `dailySpending` or `monthlyHistory` arrays are empty, the chart area shows centered text with no icon or visual indicator of the empty chart area. The responsive container still renders but has nothing inside, leaving a blank grey panel.

**Recommended fix:**
- Add a ghost chart background (faded grid lines with no data line) so the user sees where a chart *would* render.
- Overlay text + icon on top of the ghost chart.

```tsx
{dailySpending.length === 0 ? (
  <div className="relative h-64">
    {/* Ghost grid background */}
    <svg className="absolute inset-0 w-full h-full opacity-20">
      <line x1="0" y1="25%" x2="100%" y2="25%" stroke="var(--border-color)" strokeWidth="1" />
      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--border-color)" strokeWidth="1" />
      <line x1="0" y1="75%" x2="100%" y2="75%" stroke="var(--border-color)" strokeWidth="1" />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <BarChart3 size={24} className="text-text-muted mb-2" />
      <span className="text-xs text-text-secondary">Connect an account to see spending trends</span>
    </div>
  </div>
) : (
  <ResponsiveContainer>...</ResponsiveContainer>
)}
```

**Files to touch:** `dashboard/page.tsx` (lines 254-258, 315-318), `dashboard/analytics/page.tsx` (lines 245-248, 306-309).

---

### 5.9 Page Title — Missing Metadata Context

**Current state:** Each dashboard sub-page uses a generic `<h1>` set by the layout (`links.find(...)?.label`). This means no per-page metadata (`<title>`) updates when navigating between sub-pages — the browser tab always shows "AuraFi — Personal Finance & Transaction Dashboard".

**Recommended fix:**
Use Next.js `generateMetadata` for sub-pages or set `document.title` in a `useEffect` on each page:

```tsx
useEffect(() => {
  document.title = `Transactions — AuraFi`;
}, []);
```

**Files to touch:** `dashboard/page.tsx`, `dashboard/transactions/page.tsx`, `dashboard/analytics/page.tsx`, `dashboard/accounts/page.tsx`, `dashboard/budgets/page.tsx`, `dashboard/settings/page.tsx`.

---

### 5.10 Loading Skeletons — Visual Polish

**Current state:** Skeletons use `animate-pulse` with `bg-brand-surface` and `border-brand-border`. They look like plain grey rectangles without mimicking the final content shape.

**Recommended fix:**
- For metric cards: create a 3-line skeleton (title bar, value block, subtitle bar) instead of a flat rectangle.
- For charts: use a wavy line skeleton (a simplified SVG path with pulse animation).
- For tables: render 3-5 skeleton rows with alternating column widths.

**Example for metric card skeleton:**
```tsx
<div className="glass-panel rounded-2xl p-6 animate-pulse">
  <div className="h-3 w-20 bg-brand-border rounded mb-4" />
  <div className="h-8 w-36 bg-brand-border rounded mb-3" />
  <div className="h-3 w-24 bg-brand-border rounded" />
</div>
```

**Files to touch:** `dashboard/page.tsx` (lines 108-121), `dashboard/analytics/page.tsx` (lines 151-165), `dashboard/budgets/page.tsx` (lines 199-203), `dashboard/accounts/page.tsx` (lines 230-234).

---

## Architecture Notes

### Mock/Offline Fallback Strategy
Every API route wraps its database operations in a try-catch. When the DB is unreachable (no PostgreSQL running), the catch block loads mock data from `src/data/mockData.ts` via `require()` and returns it. This allows the entire frontend to be developed and tested without a running database.

### Auth Flow
- `src/auth.config.ts` — NextAuth config (JWT strategy, login page, `authorized` callback).
- `src/auth.ts` — NextAuth instance with Credentials provider. Falls back to mock sessions when DB is offline.
- `src/proxy.ts` — Middleware that protects `/dashboard/*` routes and redirects logged-in users away from `/login` and `/register`.

### Plaid Flow
- **Mock mode** (missing/placeholder keys): Simulated modal with test credentials (`user_good`/`pass_good`). Seeds mock accounts and transactions into the DB (if online).
- **Real mode** (valid keys): Uses Plaid Link SDK for bank selection, exchanges tokens, and syncs transactions via `transactionsSync` with pagination and cursor tracking.

### Currency Context
- 5 currencies supported: USD, EUR, GBP, INR, CAD.
- Conversion from USD using hardcoded approximate rates.
- Preference persisted in `localStorage`.
