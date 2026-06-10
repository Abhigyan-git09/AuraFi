# Design System: AuraFi Premium Fintech Dashboard

## 1. Visual Theme & Atmosphere
AuraFi features a dark, desaturated violet/black atmospheric environment that balances information density with premium visual breathing room ("Cockpit Dense", rating: 8/10). The interface relies on layering, translucent glass panels, and crisp 1px strokes rather than heavy shadows or oversaturated neon glows to achieve depth and hierarchy. The aesthetic evokes a sense of complete control and precision over one's financial data.

---

## 2. Color Palette & Roles
- **Abyssal Canvas** (`#0B0914`) — Main app background.
- **Glass Surface** (`rgba(255, 255, 255, 0.02)`) — elevated card background.
- **Glass Hover** (`rgba(255, 255, 255, 0.05)`) — Card hover state.
- **Ghost Border** (`rgba(255, 255, 255, 0.06)`) — Card border stroke.
- **Ghost Border Hover** (`rgba(255, 255, 255, 0.12)`) — Card border stroke on hover.
- **Vibrant Accent Gradient** — Fuchsia to purple (`linear-gradient(to right, #A855F7, #EC4899)`) used sparingly for primary actions, checkmarks, and active links.
- **Text Primary** (`#FFFFFF`) — Headings, numbers, and key interactive labels.
- **Text Secondary** (`#948FB0`) — Descriptions, body copy, and metadata to reduce visual weight.
- **Semantic Income** (`#10B981`) — Soft emerald for income, credit actions, and successful sync states.
- **Semantic Expense** (`#F43F5E`) — Muted rose for spending, debit actions, errors, and danger zones.

---

## 3. Typography Rules
- **Display/Headlines:** `Plus Jakarta Sans` — Tight tracking, bold weights (700 or 800) for structural page anchors.
- **Body & Controls:** `Plus Jakarta Sans` — Weight-driven hierarchy (semibold/medium weights), line lengths capped at 65 characters.
- **Numbers/Metrics:** `Plus Jakarta Sans` — Always formatted as currencies, percentages, or formatted date spans.
- **Banned:** `Inter` and generic system sans-serifs are banned for display fonts. Emojis are strictly banned from all headers and tables.

---

## 4. Component Stylings
- **Buttons:**
  - *Primary:* Vibrant Accent Gradient background, crisp white text. Active scale effect (`scale-98`). No neon drop shadow.
  - *Secondary:* Translucent base (`white/5`), `1px` border (`white/10`).
- **Cards:** Elevated translucent glass (`rgba(255, 255, 255, 0.02)`), `1px` border, `16px` (`1rem`) corner radius.
- **Inputs:** Dark background (`#0B0914`), `1px` border (`white/10`). Focus ring in accent purple. Input labels placed above the input field in small caps.
- **Loaders:** Custom skeleton shimmers matching the exact card/row grids. No rotating loader animations in layouts.
- **Empty States:** Composed container with illustration, clear call-to-actions, and copy instructions (e.g. "Connect bank to sync statement data").

---

## 5. Layout Principles
- **Grid Structure:** 12-column layout for desktop with 24px gutters, collapsing to a single column stack on mobile screen sizes (below 768px).
- **Asymmetric Spacing:** Layout weights favor offset grids (e.g., 2/3 line chart + 1/3 donut chart splits) over symmetric cards.
- **Heights:** Full viewport pages use `min-h-[100dvh]` to prevent viewport layout jumps on mobile browsers.
- **Navigation:** Vertical collapsible left sidebar (`w-64` to `w-20` on desktop), collapsing to a persistent bottom utility bar or top header bar on mobile viewports.

---

## 6. Motion & Interaction
- **Triggers:** Tap target sizes must remain above 44px for easy mobile interaction.
- **Transitions:** Layout animations use standard spring curves for smooth interactions.
- **Optimizations:** Transitions are bound to `transform` and `opacity` to maintain 60 FPS hardware acceleration.

---

## 7. Anti-Patterns (Banned)
- **No emojis** anywhere in professional dashboard screens.
- **No Inter** font family.
- **No pure black** (`#000000`) for the canvas background.
- **No AI copywriting clichés** ("seamlessly manage", "next-gen financial platform").
- **No oversaturated neons** or neon dropshadows.
- **No centered hero text** layouts.
- **No fake statistics** or placeholder links.
