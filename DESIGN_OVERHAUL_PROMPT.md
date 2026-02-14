# Concentrade UI/UX Overhaul -- Complete Design Prompt

## For: A Senior Product Designer / UI Engineer
## Product: Concentrade -- Advanced Trading Journal (Next.js 15 + Tailwind CSS v4 + Supabase + framer-motion)

---

## EXECUTIVE SUMMARY

Concentrade is a trading journal web application built with Next.js App Router, Tailwind CSS v4, shadcn/ui, Recharts, and framer-motion. The app is functionally complete but visually reads as a "vibecoded" prototype: inconsistent theming, unused design systems, flat loading states, no motion language, hardcoded colors everywhere, and monolithic page files that fight against the design token system already defined in the CSS.

This prompt is a surgical blueprint for transforming the app from "functional but forgettable" into a polished, premium trading terminal that feels intentional, alive, and professional. Every instruction references an exact file, exact class name, and exact code pattern.

---

## TABLE OF CONTENTS

1. [The Design Token Crisis](#1-the-design-token-crisis)
2. [The Animation System Nobody Uses](#2-the-animation-system-nobody-uses)
3. [Navigation Overhaul](#3-navigation-overhaul)
4. [Loading States -- The Silent Killer](#4-loading-states)
5. [Dashboard Page Surgery](#5-dashboard-page-surgery)
6. [Trades Page & Table Overhaul](#6-trades-page--table-overhaul)
7. [Analytics Page Resurrection](#7-analytics-page-resurrection)
8. [Settings Page Refinement](#8-settings-page-refinement)
9. [Marketing Page -- Stop Looking Like a Template](#9-marketing-page)
10. [Empty States](#10-empty-states)
11. [Login/Signup Pages](#11-loginsignup-pages)
12. [Footer](#12-footer)
13. [Typography & Font System](#13-typography--font-system)
14. [Motion Language Specification](#14-motion-language-specification)
15. [Chart & Data Visualization Overhaul](#15-chart--data-visualization-overhaul)
16. [Dark Mode Parity](#16-dark-mode-parity)
17. [Accessibility Preservation](#17-accessibility-preservation)
18. [Anti-Patterns to Eliminate](#18-anti-patterns-to-eliminate)

---

## 1. THE DESIGN TOKEN CRISIS

### The Problem

The `globals.css` file (999 lines) defines a comprehensive OKLCH-based color system with semantic tokens:

```
:root {
  --background: oklch(0.99 0.005 264);
  --foreground: oklch(0.15 0.02 264);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.15 0.02 264);
  --primary: oklch(0.55 0.22 264);        /* Vibrant blue-purple */
  --muted: oklch(0.96 0.01 264);
  --muted-foreground: oklch(0.5 0.02 264);
  --border: oklch(0.9 0.02 264);
  --accent: oklch(0.9 0.06 280);
  /* ... plus dark mode variants, chart colors, success/warning/info tokens */
}
```

The Tailwind `@theme inline` block correctly maps these to utility classes (`bg-card`, `text-foreground`, `bg-muted`, `border-border`, etc.).

**But the components completely ignore them.** A grep across every `.tsx` file reveals:

| Hardcoded Pattern | Approximate Occurrences | Found In |
|---|---|---|
| `bg-white` / `bg-gray-*` / `bg-slate-*` | 800+ matches across 78 files | Every single page and component |
| `text-gray-*` / `text-slate-*` | 600+ matches | Every single page and component |
| `border-gray-*` / `border-slate-*` | 300+ matches | Navbar, sidebar, table, cards, forms |
| `dark:bg-gray-900` / `dark:bg-slate-800` | 200+ matches | Dashboard, trades, settings, analytics |

### The Fix -- File by File

Every hardcoded color must be replaced with its semantic token equivalent. Here is the mapping:

| Hardcoded | Replace With |
|---|---|
| `bg-white` | `bg-card` or `bg-background` |
| `bg-gray-50`, `bg-slate-50` | `bg-muted` |
| `bg-gray-100`, `bg-slate-100` | `bg-muted` |
| `bg-gray-900`, `bg-slate-900` | `bg-card` (dark context) or `bg-background` |
| `bg-gray-800`, `bg-slate-800` | `bg-muted` (dark context) |
| `text-gray-900`, `text-slate-900` | `text-foreground` |
| `text-gray-700`, `text-slate-700` | `text-foreground` |
| `text-gray-600`, `text-slate-600` | `text-muted-foreground` |
| `text-gray-500`, `text-slate-500` | `text-muted-foreground` |
| `text-gray-400`, `text-slate-400` | `text-muted-foreground` |
| `text-gray-300`, `text-slate-300` | `text-muted-foreground` |
| `border-gray-200`, `border-slate-200` | `border-border` |
| `border-gray-700`, `border-slate-700` | `border-border` |
| `border-gray-800`, `border-slate-800` | `border-border` |

**Critical rule:** When replacing, you must also remove the paired `dark:` variant. For example:
```
// BEFORE (two classes fighting each other):
bg-white dark:bg-gray-900

// AFTER (one token that handles both themes automatically):
bg-card
```

The OKLCH tokens in `:root` and `.dark` already define distinct light/dark values. That is the entire point of the token system. Using `dark:` overrides alongside tokens creates specificity conflicts and visual inconsistencies.

### Priority Files (highest match count)

1. `app/marketing/MarketingPageClient.tsx` -- 81 matches
2. `app/privacy/page.tsx` -- 77 matches
3. `app/(app)/settings/page.tsx` -- 68 matches
4. `app/contact/page.tsx` -- 51 matches
5. `components/journal/psychology-analytics.tsx` -- 49 matches
6. `app/(app)/social-insights/page.tsx` -- 45 matches
7. `app/terms/page.tsx` -- 44 matches
8. `app/(app)/dashboard/page.tsx` -- 40 matches
9. `app/(app)/insights/page.tsx` -- 39 matches
10. `app/(app)/backtesting/page.tsx` -- 39 matches

---

## 2. THE ANIMATION SYSTEM NOBODY USES

### The Problem

`globals.css` defines a **complete animation library** that is almost entirely unused:

| CSS Class | What It Does | Currently Used? |
|---|---|---|
| `.loading-shimmer` | Premium shimmer effect for skeleton loaders | NO -- `trades/loading.tsx` uses plain `<Skeleton>` instead |
| `.glass-card` | Glassmorphism card with backdrop-blur and transparent border | NO -- cards use plain `bg-white` |
| `.glass-subtle` | Lighter glassmorphism | NO |
| `.card-enhanced` | Card with 3D hover transform (`translateY(-8px) rotateX(2deg)`) | NO -- cards have zero hover effects |
| `.btn-enhanced` | Button with ripple effect on click and lift on hover | NO -- buttons are stock shadcn |
| `.input-enhanced` | Input that lifts and glows on focus | NO -- inputs are stock shadcn |
| `.badge-animated` | Badge with gradient glow on hover | NO -- badges use inline gradient classes |
| `.gradient-border` | Animated gradient border using mask-composite | NO |
| `.animate-fade-in-up` | 0.6s fadeInUp entrance | YES -- only on login page |
| `.animate-scale-in` | 0.5s scaleIn entrance | Only login page |
| `.animate-bounce-in` | 0.8s bounceIn with overshoot | NO |
| `.animate-slide-fade` | 0.5s slideAndFade | NO |
| `.animate-float` | Infinite float oscillation | NO |
| `.animate-shimmer` | Infinite shimmer sweep | NO |
| `.stagger-1` through `.stagger-6` | Animation delay classes for staggered lists | NO |
| `.spinner-enhanced` | Spinner with drop-shadow glow | NO -- `LoadingScreen` uses plain `animate-spin` |
| `.form-container` | Auto-staggered child animations for forms | Only login page |
| `.branding-section` | Left-to-right staggered entrance | Only login page |
| `.page-transition-enter/exit` | Page transition states | NO |
| `.focus-ring` | Enhanced focus-visible ring with glow | NO -- default Tailwind focus used |

### The Fix

These CSS classes must be applied to the corresponding components. Specific assignments:

| Component | Apply These Classes |
|---|---|
| All `<Card>` in dashboard metric cards | `.card-enhanced` (adds hover transform) |
| All `<Card>` in analytics page | `.card-enhanced` |
| All primary `<Button>` CTAs | `.btn-enhanced` (adds ripple + lift) |
| All `<Input>` and `<Textarea>` in forms | `.input-enhanced` (adds focus lift + glow) |
| All `<Badge>` for trade outcomes | `.badge-animated` (adds hover glow) |
| `components/loading-screen.tsx` spinner | `.spinner-enhanced` instead of `animate-spin` |
| `app/(app)/trades/loading.tsx` skeletons | Add `.loading-shimmer` class to each `<Skeleton>` |
| Nav items in `navbar.tsx` | `.stagger-1` through `.stagger-6` on initial render |
| Dashboard metric cards grid | `.stagger-1` through `.stagger-4` on mount |
| Trade table rows | `.animate-fade-in-up` with staggered delays on row mount |
| Settings page form sections | `.form-container` on the form wrapper |
| All cards on marketing page | `.glass-card` for dark glass aesthetic |

---

## 3. NAVIGATION OVERHAUL

### 3A. Navbar (`components/layout/navbar.tsx`)

**Current state:** A static `sticky top-0` header with `bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl`. Uses hardcoded `text-gray-700 dark:text-gray-300`, `border-gray-200 dark:border-gray-800`, `bg-gradient-to-r from-gray-50/50 via-white/50 to-gray-50/50 dark:from-gray-900/50` (a pointless background gradient that is invisible). Active state is `from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20` -- functional but generic. Mobile drawer opens as a flat list with no entrance animation.

**Required changes:**

1. **Replace all hardcoded colors with tokens:**
   - `bg-white/80 dark:bg-gray-900/80` -> `bg-background/80`
   - `text-gray-700 dark:text-gray-300` -> `text-muted-foreground`
   - `hover:text-gray-900 dark:hover:text-white` -> `hover:text-foreground`
   - `hover:bg-gray-100 dark:hover:bg-gray-800` -> `hover:bg-muted`
   - `border-gray-200 dark:border-gray-800` -> `border-border`
   - Remove the invisible background gradient div entirely (line ~90 in current file)

2. **Add scroll-aware behavior:**
   - Track `window.scrollY` with a passive scroll listener
   - When scrolled > 20px: increase backdrop-blur from `blur-lg` to `blur-xl`, add `shadow-md`, and shift from `bg-background/60` to `bg-background/90`
   - Add a thin 2px `bg-primary` progress bar at the absolute bottom of the navbar that fills based on page scroll percentage (only on scrollable pages)
   - Use CSS `transition-all duration-300` for smooth property changes

3. **Stagger nav item entrance on mount:**
   - On first render, each nav item should fade-in-up with a 40ms stagger delay using framer-motion `staggerChildren`
   - Use the `variants` pattern:
     ```
     container: { animate: { transition: { staggerChildren: 0.04 } } }
     item: { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } }
     ```

4. **Active state redesign:**
   - Replace the gradient background with a bottom border indicator: a 2px `bg-primary` bar below the active item using `after:` pseudo-element
   - The active item text should be `text-foreground font-semibold` (no gradient background)
   - On hover (non-active), show a subtle `bg-muted` background

5. **Mobile drawer:**
   - Add `framer-motion` `AnimatePresence` with staggered item entrance (each link slides in from left with 60ms delay)
   - Add a subtle backdrop blur to the overlay

### 3B. Sidebar (`components/layout/sidebar.tsx`)

**Current state:** Uses hardcoded `bg-slate-*` colors everywhere: `bg-slate-50 dark:bg-slate-900`, `border-slate-200 dark:border-slate-800`, `text-slate-600`, `bg-slate-100 dark:bg-slate-800`, etc. The AI Coach promo card uses `from-blue-500 to-purple-500` inline gradient. The collapse animation is a binary width toggle.

**Required changes:**

1. **Replace every `slate-*` reference with semantic tokens** (use the mapping table from Section 1)
2. **Collapse animation:** Use `framer-motion`'s `animate` on the sidebar width with a spring transition (`stiffness: 300, damping: 30`) instead of a CSS width toggle. Text labels should `AnimatePresence` fade out when collapsing and fade in when expanding.
3. **Active state:** Same bottom-border approach as navbar, or a left-side 3px `bg-primary` indicator bar
4. **AI Coach card:** Replace inline gradient with `bg-primary` + `text-primary-foreground` to stay within the token system. Add `.card-enhanced` hover effect.

---

## 4. LOADING STATES

This is one of the most impactful changes for perceived quality. Loading states are the **first thing users see** on every navigation.

### 4A. `app/(app)/analytics/loading.tsx` -- THE BLANK SCREEN

**Current code (literally the entire file):**
```tsx
export default function Loading() {
  return null
}
```

Users navigate to analytics and see a completely blank white/dark page while data loads. This is the single worst UX issue in the app.

**Required replacement:** Build a full skeleton layout that mirrors the actual analytics page structure:
- A header skeleton (title + subtitle bars)
- A row of 4-5 metric card skeletons (each with a small icon placeholder, a value bar, and a subtitle bar)
- A large chart area skeleton (a rounded rectangle the same height as the main chart)
- A secondary row of 2-3 smaller card skeletons
- Apply `.loading-shimmer` class to every skeleton element for the premium shimmer sweep effect
- The skeleton containers should use `bg-card` with `border border-border rounded-xl`

### 4B. `app/(app)/trades/loading.tsx` -- PLAIN SKELETONS

**Current code:** Uses `<Skeleton>` from shadcn but without the shimmer effect.

**Required changes:**
- Add `className="loading-shimmer"` to every `<Skeleton>` component
- Match the actual trades page layout more precisely: include a filter bar skeleton, column header skeleton, and 8-10 row skeletons with varying widths to suggest real data

### 4C. `components/loading-screen.tsx` -- THE GENERIC SPINNER

**Current code:**
```tsx
<ConcentradeLogo size={80} variant="icon" className="animate-pulse" />
<Loader2 className="h-8 w-8 animate-spin text-primary" />
<p className="text-sm text-muted-foreground font-medium">Loading your workspace...</p>
```

**Required replacement:**
- Remove `<Loader2>` entirely
- Replace `animate-pulse` on the logo with a custom animation: the logo should scale from 0.95 to 1.05 in a smooth infinite loop (use `animate-float` from globals.css or a custom `@keyframes`)
- Below the logo, add a horizontal progress bar (120px wide, 3px tall) with the `.loading-shimmer` effect
- Below that, cycle through 3 loading messages with a crossfade transition: "Connecting to your workspace..." -> "Syncing trade data..." -> "Preparing your dashboard..."
- Use `animate-fade-in-up` on the entire container for entrance

### 4D. Add Missing Loading Files

Create `loading.tsx` skeleton files for every route that doesn't have one:
- `app/(app)/dashboard/loading.tsx`
- `app/(app)/settings/loading.tsx`
- `app/(app)/playbook/loading.tsx`
- `app/(app)/psychology/loading.tsx`
- `app/(app)/backtesting/loading.tsx`
- `app/(app)/insights/loading.tsx`
- `app/(app)/social-insights/loading.tsx`

Each should mirror the structure of its corresponding page with shimmer skeletons.

---

## 5. DASHBOARD PAGE SURGERY

File: `app/(app)/dashboard/page.tsx` (1454 lines)

### 5A. The `AnimatedTitle` Component (line ~212)

**Current:**
```tsx
className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-slate-700 to-gray-900 dark:from-white dark:via-slate-200 dark:to-white"
```

**Fix:** Replace with `text-foreground`. A gradient-clipped heading that just creates a slightly lighter gray is pointless visual complexity. Use `text-foreground text-3xl font-extrabold tracking-tight`. If a gradient is desired for brand flair, use the primary color: `bg-gradient-to-r from-foreground to-foreground` or `bg-gradient-to-r from-primary to-primary/80` -- not gray-to-gray.

### 5B. The `CustomChartTooltip` Component (line ~227)

**Current:** `bg-white/95 dark:bg-gray-900/95 border-gray-200 dark:border-gray-700`

**Fix:** Replace with `bg-card/95 border-border backdrop-blur-md`. Also replace `text-gray-700 dark:text-gray-300` with `text-muted-foreground`. Remove `text-gray-900 dark:text-gray-100` -> `text-foreground`.

### 5C. MetricCard Component

**Current cards** use `bg-white dark:bg-gray-900/40 border-gray-100 dark:border-gray-800`.

**Required changes:**
1. Replace with `bg-card border-border`
2. Add `card-enhanced` class for hover lift effect
3. Add count-up animation on the metric value: when the card mounts (or when the value changes), animate the number from 0 to the final value over 600ms using framer-motion's `useSpring` + `useTransform`:
   ```tsx
   const spring = useSpring(0, { stiffness: 50, damping: 15 })
   useEffect(() => { spring.set(numericValue) }, [numericValue])
   const display = useTransform(spring, v => formatCurrency(v))
   ```
4. The sparkline (mini trend chart) in each card should animate its path on mount using Recharts' `isAnimationActive={true}` and `animationDuration={800}`

### 5D. Calendar Heatmap (line ~400+)

**Current:** Uses `bg-gray-100 dark:bg-gray-800/50` for empty cells, hardcoded `bg-emerald-500`, `bg-rose-500`, `bg-amber-400` for data cells. No entrance animation.

**Required changes:**
1. Empty cells: `bg-muted` instead of `bg-gray-100 dark:bg-gray-800/50`
2. Keep the semantic colors for data (green/red/amber are meaningful for P&L), but define them as CSS custom properties for consistency:
   - `--pnl-positive: oklch(0.70 0.20 150)` (green)
   - `--pnl-negative: oklch(0.65 0.22 25)` (red)
   - `--pnl-neutral: oklch(0.75 0.18 85)` (amber)
3. Replace `text-gray-400 dark:text-gray-600` with `text-muted-foreground`
4. Replace `dark:ring-offset-gray-950` with `dark:ring-offset-background`
5. Replace `bg-white dark:bg-gray-950` in tooltip with `bg-card`
6. Add cell entrance animation: on month change, cells should fade in with a staggered delay (5ms per cell) creating a wave effect from top-left to bottom-right. Use CSS animation with `animation-delay: calc(var(--cell-index) * 5ms)` or framer-motion.

### 5E. Motivational Quotes Carousel (line ~583)

**Current:** The quote changes via `setInterval` with no transition.

**Fix:** Wrap in framer-motion `AnimatePresence` with:
```tsx
<AnimatePresence mode="wait">
  <motion.p
    key={quoteIndex}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3 }}
  >
    {MOTIVATIONAL_QUOTES[quoteIndex]}
  </motion.p>
</AnimatePresence>
```

### 5F. Cumulative P&L Chart

**Current:** Default Recharts `<AreaChart>` with no gradient fill.

**Fix:**
1. Add a gradient `<defs>` to the chart:
   ```tsx
   <defs>
     <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
       <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
       <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
     </linearGradient>
   </defs>
   <Area fill="url(#pnlGradient)" stroke="hsl(var(--primary))" strokeWidth={2} />
   ```
2. Enable animation: `isAnimationActive animationDuration={1000} animationEasing="ease-out"`
3. Add a custom cursor: a vertical dashed line on hover instead of the default Recharts cursor
4. The Y-axis reference line at 0 should be a dashed line in `text-muted-foreground` color

---

## 6. TRADES PAGE & TABLE OVERHAUL

### 6A. `app/(app)/trades/SimpleTradeTable.tsx`

**Current state:** A standard shadcn `<Table>` with no row animations, excessive gradient badges (every badge uses a 3-color gradient with `shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse`), and the "Long" direction indicator has `animate-pulse` on it (a long position icon that permanently pulses is distracting and meaningless).

**Required changes:**

1. **Remove all `animate-pulse`** from direction indicators and outcome badges. Permanent pulsing animations on data elements are a vibecoded anti-pattern. They create visual noise and distract from actual data.

2. **Simplify badges:**
   - Win badge: `bg-success/15 text-success border border-success/20` (no gradient, no shadow-lg, no hover:scale-105)
   - Loss badge: `bg-destructive/15 text-destructive border border-destructive/20`
   - Breakeven badge: `bg-warning/15 text-warning border border-warning/20`
   - The current 3-color gradients (`from-green-500 via-emerald-500 to-green-600`) are over-designed for a data table. Badges in tables should be scannable, not flashy.

3. **Direction indicators:**
   - Replace `bg-gradient-to-br from-green-400 via-emerald-500 to-green-600` with a simple `bg-success/15` circle
   - Replace `bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent` with `text-success font-medium`
   - Same for Short: `bg-destructive/15` circle + `text-destructive font-medium`

4. **Row animations:**
   - On table mount, rows should fade in with a 30ms stagger using framer-motion
   - On row hover, apply a subtle `bg-muted/50` background (NOT scale transforms -- tables should never scale on hover)
   - On row delete (AnimatePresence), the row should fade out and collapse height over 200ms

5. **Empty state** (line ~157):
   - Remove the `blur-2xl animate-pulse` decorative circle behind the icon (this is the "blurry circles" anti-pattern)
   - Replace `bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500` (3 colors!) with `bg-primary`
   - Replace `bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900` with `bg-card`
   - Use the existing `<EmptyState>` component instead of this custom inline empty state

6. **Card wrapper** (line ~187):
   - `bg-gradient-to-r from-white via-white to-white` is literally `bg-white` written three times. Replace with `bg-card`
   - Remove the decorative `bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-10` overlay div
   - Replace with `bg-card border-border shadow-lg` -- clean, professional

7. **Header** (line ~190):
   - `bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500` on the icon container -> `bg-primary`
   - `bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent` on the title -> `text-foreground`
   - Trade database title does not need a 3-color gradient. This is a data table, not a marketing banner.

---

## 7. ANALYTICS PAGE RESURRECTION

File: `app/(app)/analytics/page.tsx` (921 lines)

### 7A. Loading State (CRITICAL)

As noted in Section 4A, the loading file literally returns `null`. This must be replaced with a full skeleton.

### 7B. Chart Improvements

- All `<AreaChart>`, `<BarChart>`, and `<PieChart>` components should have:
  - `isAnimationActive={true}`
  - `animationDuration={800}`
  - `animationEasing="ease-out"`
  - Gradient fills (see Section 5F for the `<defs>` pattern)
- Tooltip styling: use the token-based tooltip pattern from Section 5B
- Grid lines: `stroke="var(--border)"` with `opacity={0.5}`

### 7C. Filter State Transitions

When users switch between time filters (7d/30d/90d), the charts should:
1. Fade the old data out (opacity 0, 100ms)
2. Update the data
3. Fade the new data in (opacity 1, 200ms) with the Recharts animation playing from scratch

Currently the data just snaps instantly. Use a state flag + `AnimatePresence` on the chart container.

---

## 8. SETTINGS PAGE REFINEMENT

File: `app/(app)/settings/page.tsx` (1256 lines)

### 8A. Theme Selector Cards

**Current:** Basic bordered boxes for light/dark/system selection.

**Fix:** Each option card should:
- Show a miniature UI preview (a tiny mockup of the app in that theme) using CSS-only shapes
- Have a `ring-2 ring-primary` border when selected (currently just a gray border)
- Use `card-enhanced` hover effect
- Apply `.animate-scale-in` on mount

### 8B. Form Sections

- Wrap each settings section (Profile, Trading Preferences, etc.) in a container with `.form-container` class for auto-staggered child entrance
- All `<Input>` elements should have `.input-enhanced` class for focus lift behavior
- Replace hardcoded `bg-gray-*` / `text-gray-*` with tokens throughout (68 occurrences)

### 8C. Tab Switcher

- The tab indicator should animate its position when switching between tabs (use `framer-motion`'s `layoutId` on the active indicator for shared layout animation)

---

## 9. MARKETING PAGE

File: `app/marketing/MarketingPageClient.tsx` (766 lines, 81 hardcoded color matches)

### 9A. Color Migration

This file has the most hardcoded colors in the entire codebase. The marketing page uses a dark theme with `bg-slate-*` and `text-slate-*` everywhere. Since the marketing page uses a forced dark theme:

- `bg-slate-800/50` -> `bg-card/50`
- `border-slate-700` -> `border-border`
- `text-slate-400` -> `text-muted-foreground`
- `text-slate-300` -> `text-muted-foreground`
- `text-slate-200` -> `text-foreground/80`
- `text-indigo-400` -> `text-primary`
- `from-indigo-600 to-purple-600` -> `from-primary to-primary/80` (or just `bg-primary`)

### 9B. Stat Counter Animation

The hero section likely contains stats like "1,000+ Active Traders". These should animate on viewport entry:
- Use `framer-motion`'s `useInView` to trigger
- Animate the number from 0 to final value over 1.5s using a spring
- The `+` suffix should fade in after the number finishes counting

### 9C. Testimonial Cards

**Current:** Static cards with no interaction.

**Fix:**
- Apply `.glass-card` for the dark glassmorphism aesthetic
- Add a subtle horizontal auto-scroll or a manual carousel with gesture support (framer-motion's drag)
- Each testimonial should have a subtle entrance animation when scrolled into view (`animate-fade-in-up` with staggered delays)

### 9D. Feature Cards

**Current:** `hover:transform hover:scale-105` -- the most default hover effect.

**Fix:** Replace with `.card-enhanced` which provides a more sophisticated `translateY(-8px) rotateX(2deg)` transform with deep shadow. Or use a subtle `translateY(-4px)` with `shadow-lg` transition -- no 3D rotation if it feels too much for the brand.

### 9E. Pricing Cards

**Current:** The "Most Popular" card uses `transform scale-105` permanently, which is a static CSS transform. This means it's always 5% bigger with no animation context.

**Fix:**
- Remove the static `scale-105`. Instead, give it a `ring-2 ring-primary` border and a subtle `shadow-primary/10 shadow-xl` glow
- On hover, all pricing cards should lift (`translateY(-4px)`) with the popular card lifting slightly more (`translateY(-8px)`)
- The "Most Popular" badge should use `bg-primary text-primary-foreground` instead of an inline gradient

### 9F. Comparison Table

- Table rows have `hover:bg-slate-700/30` which should be `hover:bg-muted/50`
- The checkmark icons use `text-indigo-400` which should be `text-primary`
- The "X" icons use `text-red-500` which should be `text-destructive`

---

## 10. EMPTY STATES

File: `components/empty-state.tsx`

**Current state:** Functionally correct (icon, title, description, button) but visually generic. No animation, no illustration, no personality.

**Required changes:**

1. Add `animate-fade-in-up` to the entire container with staggered children:
   - Icon: `.stagger-1`
   - Title: `.stagger-2`
   - Description: `.stagger-3`
   - Action buttons: `.stagger-4`

2. The icon container should use `.gradient-border` for an animated gradient outline instead of the static gradient ring

3. Add a configurable `illustration` prop that accepts a React node for pages that want a custom SVG illustration (the default icon-in-a-box is fine for compact usage)

---

## 11. LOGIN/SIGNUP PAGES

File: `app/login/page.tsx` (uses framer-motion already -- one of the better pages)

### 11A. Remove Blurry Circles

**Current:** The left branding panel has floating `div` elements with `blur-3xl` classes creating abstract gradient circles. These are the quintessential "vibecoded" decorative element -- random blurry shapes that add no meaning and look like every AI-generated landing page on the internet.

**Replace with:** A single, intentional decorative element. Options:
- A subtle grid pattern (CSS `background-image` with thin lines at 10% opacity)
- A single large radial gradient using `--primary` color at 5% opacity, centered behind the logo
- Nothing -- the branding text and logo are strong enough on their own

### 11B. Loading State

The submit button shows a spinning border on click. Replace with the `.spinner-enhanced` class spinner (which adds a `drop-shadow(0 0 8px var(--primary))` glow) or better: an inline progress state where the button text changes to "Signing in..." with a subtle shimmer effect.

---

## 12. FOOTER

File: `components/layout/app-footer.tsx`

**Current state:** Uses `bg-slate-50/50`, `text-slate-600`, `text-purple-600`, `hover:text-purple-600` -- all hardcoded.

**Required replacement:**
```
border-slate-200       -> border-border
bg-slate-50/50         -> bg-muted/50
text-slate-600         -> text-muted-foreground
from-purple-600 to-violet-600  -> text-primary  (for the brand name)
hover:text-purple-600  -> hover:text-primary
```

Add hover underline animation on links: `hover:underline underline-offset-4 decoration-primary/50 transition-all`

---

## 13. TYPOGRAPHY & FONT SYSTEM

File: `app/layout.tsx`

**Current:** Uses `Inter` from `next/font/google`. This is fine -- Inter is an excellent UI font for data-heavy applications.

**Required changes:**

1. In `globals.css`, add the font variable to `@theme inline`:
   ```css
   @theme inline {
     --font-sans: 'Inter', 'Inter Fallback';
   }
   ```

2. Add a monospace font for numerical data (prices, P&L, account balances). Trading apps need a monospace font for number alignment:
   ```tsx
   // layout.tsx
   import { Inter, JetBrains_Mono } from 'next/font/google'
   const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })
   ```
   ```css
   /* globals.css @theme inline */
   --font-mono: 'JetBrains Mono', 'JetBrains Mono Fallback';
   ```

3. Apply `font-mono` class to all numerical data displays: P&L values, prices, account balances, percentages, trade counts. This ensures numbers align properly in tables and metric cards.

4. Apply `text-balance` to all headings and `text-pretty` to all paragraph text for optimal line breaks.

---

## 14. MOTION LANGUAGE SPECIFICATION

Define a consistent motion language for the entire app. Every animation should follow these rules:

### Timing

| Category | Duration | Easing |
|---|---|---|
| Micro-interactions (hover, focus, press) | 150-200ms | `ease-out` or `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Element entrance (cards, rows) | 250-350ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Page transitions | 300-400ms | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Number count-up | 600-1000ms | `spring(stiffness: 50, damping: 15)` |
| Chart animations | 800-1200ms | `ease-out` |
| Loading shimmer | 2000ms loop | `linear` |

### Entrance Patterns

| Context | Animation |
|---|---|
| Page content loads | Fade in + translate up 12px (`opacity: 0, y: 12` -> `opacity: 1, y: 0`) |
| Cards in a grid | Stagger at 40ms intervals, same fade-up |
| Table rows | Stagger at 30ms intervals, fade-up 8px |
| Modal/dialog opens | Scale from 0.95 to 1.0 + fade |
| Sidebar toggle | Spring width animation (300 stiffness, 30 damping) |
| Tab change | Content crossfade (exit 150ms, enter 250ms) |

### Exit Patterns

| Context | Animation |
|---|---|
| Page content leaves | Fade out + translate up 8px (150ms) |
| Modal closes | Scale to 0.97 + fade (150ms) |
| Item deleted | Fade out + collapse height (200ms) |
| Toast dismisses | Slide right + fade (200ms) |

### Things That Should NEVER Animate

- Table columns (no horizontal movement on data tables)
- Form labels
- Breadcrumbs
- Scrollbars
- Semantic colors changing (green/red P&L values should snap, not transition between colors)

---

## 15. CHART & DATA VISUALIZATION OVERHAUL

### All Charts (Recharts)

1. **Gradient fills:** Every `<Area>` chart should use a vertical linear gradient from `primary/30` to `primary/0`. Every `<Bar>` chart should use `fill="hsl(var(--primary))"` with `radius={[4, 4, 0, 0]}` for rounded top corners.

2. **Grid styling:** `<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />`

3. **Axis styling:** 
   ```
   <XAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
   <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
   ```

4. **Tooltip:** Use the token-based tooltip pattern. `bg-card/95 backdrop-blur-md border-border rounded-lg shadow-xl`. Text in `text-foreground` and `text-muted-foreground`.

5. **Animation:** `isAnimationActive animationDuration={800}` on all chart elements.

6. **Responsive containers:** Ensure all `<ResponsiveContainer>` have a minimum height of 200px to prevent collapsed charts.

### PieChart / DonutChart

- Use the `--chart-1` through `--chart-5` tokens already defined in globals.css
- Add a center label for donut charts showing the total or primary metric
- Sectors should animate on mount with a sweep-in effect

### Calendar Heatmap (specific to dashboard)

- Cell corner radius: 4px (currently `rounded-md` which is fine)
- On month navigation, cells should wave-animate in (see Section 5D)
- Add a legend row below the calendar showing the color scale (red -> neutral -> green)

---

## 16. DARK MODE PARITY

**The OKLCH token system already handles dark mode perfectly.** The `.dark` class in globals.css redefines every token:

```css
.dark {
  --background: oklch(0.08 0.018 264);     /* Ultra-deep navy */
  --card: oklch(0.14 0.025 264);           /* Elevated card */
  --primary: oklch(0.65 0.28 270);         /* Brighter primary for dark */
  --border: oklch(0.26 0.045 264);         /* Subtle separator */
  /* ... */
}
```

The moment you replace hardcoded colors with tokens, dark mode will work automatically. No more writing `dark:bg-gray-900` on every element. The token system is the dark mode system.

### Testing Checklist

After the token migration, verify each page in both light and dark mode:
- [ ] Dashboard: cards, charts, calendar, metric values all readable
- [ ] Trades: table rows, badges, empty state all themed
- [ ] Analytics: charts, skeletons, filter tabs all themed
- [ ] Settings: form inputs, theme selector, buttons all themed
- [ ] Marketing: forced dark theme still works with tokens
- [ ] Login/Signup: branding panel, form, buttons all themed
- [ ] Footer: links, brand name, copyright all themed
- [ ] Loading screens: shimmer effect visible in both themes

---

## 17. ACCESSIBILITY PRESERVATION

The `globals.css` file contains an extensive accessibility system (lines 806-999):
- `.access-high-contrast` -- Yellow on black (Israeli Standard 5568)
- `.access-grayscale` -- Full grayscale filter
- `.access-invert` -- Color inversion
- `.access-readable-font` -- System sans-serif override
- `.access-highlight-links` -- Yellow highlighted links
- `.access-stop-animations` -- Kills all animation
- `.access-show-headings` -- Heading level indicators

**CRITICAL: Do not remove or modify any of these accessibility classes.** They are toggled by an accessibility toolbar component. All UI changes must be compatible with these modes.

Additionally:
- All new animations must respect `prefers-reduced-motion`. Add this to globals.css:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
- All interactive elements must have visible focus states (the `.focus-ring` class exists -- use it)
- All color-coded information (green/red P&L) must also have a text indicator (the +/- sign)
- Minimum touch target size: 44x44px on mobile for all interactive elements

---

## 18. ANTI-PATTERNS TO ELIMINATE

These are patterns found throughout the codebase that must be systematically removed:

### 18A. Three-Color Gradients on Data Elements

**Found in:** `SimpleTradeTable.tsx`, dashboard metric icons, trade form buttons

**Pattern:**
```
bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
```

**Rule:** Three-color gradients belong on marketing hero sections, not on data table badges, icon containers, or action buttons. Data elements should use solid colors from the token system. If a gradient is warranted (e.g., a CTA button), use a two-stop gradient within the same hue family: `from-primary to-primary/80`.

### 18B. Permanent `animate-pulse` on Data Elements

**Found in:** `SimpleTradeTable.tsx` -- Win badges and Long direction indicators permanently pulse.

**Rule:** `animate-pulse` should ONLY be used on:
- Loading placeholders (skeleton shimmer)
- Notification indicators (unread dots)
- NEVER on data labels, badges, or static indicators

### 18C. `hover:scale-105` on Every Card

**Found in:** Marketing page feature cards, pricing cards, testimonial cards.

**Rule:** Scale transforms on hover are acceptable for isolated call-to-action cards but should not be applied uniformly to every card in a grid. Replace with `translateY(-4px)` lift + shadow transition (the `.card-enhanced` class provides this).

### 18D. Decorative Blur Circles

**Found in:** Login page, sign-up page, possibly trade form backgrounds.

**Pattern:**
```
<div className="absolute ... blur-3xl bg-gradient-to-r from-blue-500 ..." />
```

**Rule:** Remove all instances. Replace with nothing or a subtle CSS grid/dot pattern at 5% opacity.

### 18E. Gradient Text on Non-Hero Elements

**Found in:** Dashboard title, table headers, card titles.

**Pattern:**
```
bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent
```

**Rule:** Gradient text is acceptable for:
- Marketing page hero headline (one instance)
- Brand logo text
- NOT for: page titles, card titles, table headers, section labels. Use `text-foreground` for all of these.

### 18F. Inline `shadow-xl hover:shadow-2xl` on Every Element

**Found in:** Badges, buttons, icon containers throughout the trade table and dashboard.

**Rule:** Reserve `shadow-xl` and above for:
- Modal overlays
- Floating action buttons
- Dropdown menus
- NOT for: table cell badges, inline icons, or standard buttons. Use `shadow-sm` or `shadow-md` maximum for inline elements.

---

## IMPLEMENTATION PRIORITY ORDER

Execute these changes in this order to maximize impact per change and avoid merge conflicts:

1. **Token Migration** (Section 1) -- Affects every file, do this first as a massive find-replace pass. This single change will fix dark mode, reduce CSS specificity issues, and create visual consistency.

2. **Loading States** (Section 4) -- Highest perceived quality improvement. Users see loading states on every navigation.

3. **Remove Anti-Patterns** (Section 18) -- Delete `animate-pulse` from data, remove blur circles, simplify gradients. These are subtractive changes that immediately improve quality by removing noise.

4. **Apply Existing CSS Classes** (Section 2) -- Start using `.card-enhanced`, `.btn-enhanced`, `.input-enhanced`, `.loading-shimmer`, `.glass-card`. These are zero-effort upgrades since the CSS already exists.

5. **Navbar & Sidebar** (Section 3) -- Navigation is seen on every page. Scroll-aware behavior and stagger animations create a premium first impression.

6. **Dashboard Page** (Section 5) -- The primary page users interact with. Count-up animations, chart gradients, calendar wave effects.

7. **Trade Table** (Section 6) -- The core data interaction surface. Row animations, simplified badges, cleaner empty state.

8. **Charts** (Section 15) -- Gradient fills, animated entry, consistent tooltip styling across all chart instances.

9. **Marketing Page** (Section 9) -- User acquisition surface. Count-up stats, glass cards, testimonial carousel.

10. **Motion Language** (Section 14) -- Add framer-motion page transitions and standardize animation timings.

11. **Typography** (Section 13) -- Add monospace font for numbers, apply `text-balance` / `text-pretty`.

12. **Everything Else** (Settings, Login, Footer, Empty States) -- Polish pass.

---

## FINAL DESIGN PRINCIPLES

1. **Tokens over hardcodes.** If you type `gray-`, `slate-`, `white`, or `black` in a Tailwind class, you are probably wrong. Use the token.

2. **Motion should communicate, not decorate.** Every animation must answer: "What is this telling the user?" If the answer is "nothing, it just looks cool," remove it.

3. **Data density over visual noise.** This is a trading application. Users need to scan numbers quickly. Reduce gradients, shadows, and decorative elements on data surfaces. Reserve visual richness for containers and navigation.

4. **One brand color, applied consistently.** The `--primary` token (blue-purple in OKLCH) is the brand color. Use it for: active states, CTAs, links, focus rings, chart accents. Do not introduce `indigo-400`, `violet-600`, `pink-500`, `cyan-500` as additional accent colors throughout the UI.

5. **The CSS system already exists. Use it.** 40% of this overhaul is simply applying CSS classes that are already written in `globals.css` but were never connected to the components. The animation system, the glass utilities, the enhanced interaction states -- they are all there. They just need to be wired in.
