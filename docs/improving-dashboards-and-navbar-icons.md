# Improving Dashboards and Navbar Icons: A Developer Guide

> **Scope**: This document provides actionable guidance for AI code-generation tools (specifically Claude-based workflows) producing dashboard layouts and navigation iconography within the **Concentrade** trading journal application. It targets developers who are already familiar with React, Next.js App Router, Tailwind CSS v4, shadcn/ui, and Recharts.

---

## Table of Contents

1. [Current Architecture Overview](#1-current-architecture-overview)
2. [Navbar: Layout and Structural Improvements](#2-navbar-layout-and-structural-improvements)
3. [Iconography: Consistency, Sizing, and Visual Quality](#3-iconography-consistency-sizing-and-visual-quality)
4. [Color System: Unifying the Palette](#4-color-system-unifying-the-palette)
5. [Dashboard Component Organization](#5-dashboard-component-organization)
6. [Performance and Rendering Optimizations](#6-performance-and-rendering-optimizations)
7. [Accessibility (a11y) Checklist](#7-accessibility-a11y-checklist)
8. [Anti-Patterns to Avoid](#8-anti-patterns-to-avoid)
9. [Prompt Engineering: Instructing Claude for Better Output](#9-prompt-engineering-instructing-claude-for-better-output)
10. [Quick Reference: Implementation Checklist](#10-quick-reference-implementation-checklist)

---

## 1. Current Architecture Overview

The application uses a **top-navbar + content** layout (no persistent sidebar in the main app shell). Key files:

| Component | File Path | Role |
|---|---|---|
| Navbar | `components/layout/navbar.tsx` | Top-level horizontal navigation bar |
| Sidebar (unused in main layout) | `components/layout/sidebar.tsx` | Collapsible sidebar (available but not mounted in `app/(app)/layout.tsx`) |
| System Icons | `components/icons/system-icons.tsx` | Primary SVG icon set (24x24 grid, 1.5px stroke) |
| Hand-Crafted Icons | `components/icons/hand-crafted-icons.tsx` | Alternative icon set (24x24, 1.8px stroke, dashed accents) |
| Dashboard | `app/(app)/dashboard/page.tsx` | 1,400+ line monolithic dashboard page |
| App Layout | `app/(app)/layout.tsx` | Mounts `<Navbar />`, `<main>`, `<AppFooter />`, `<TradingAssistant />` |
| Design Tokens | `app/globals.css` | OKLCH-based color tokens, animations, utility classes |

### Key Observation: Duplicate Icon Systems

The project currently ships **three** independent icon component files:

- `components/icons/system-icons.tsx` -- The **canonical** set used by the navbar and dashboard. 24x24 viewBox, 1.5px stroke, `SvgTemplate` wrapper.
- `components/icons/hand-crafted-icons.tsx` -- An alternative "bold variant" set with 1.8px strokes, `strokeDasharray` accents, and filled shapes. **Not imported by the navbar or dashboard.**
- `components/trading-icons-v2.tsx` -- Instrument-specific icons (ES, NQ, BTCUSD, etc.) using inline `<style>` blocks and raw class names.

This fragmentation causes **visual inconsistency**. The first action any improvement pass should take is to **audit and consolidate** into a single, canonical icon system.

---

## 2. Navbar: Layout and Structural Improvements

### 2.1 Current State

The navbar renders as a `div` with `h-20` (80px) height, `backdrop-blur-xl`, and uses `flex` with `space-x-2` for horizontal nav items. Each nav link renders an icon (`h-6 w-6`) and a bold text label inside a `rounded-xl px-5 py-3` container.

**Issues identified:**

| Problem | Impact | Root Cause |
|---|---|---|
| Navbar height of 80px is excessive | Reduces viewport for dashboard content, especially on laptops (768px-1024px height) | `h-20` hardcoded |
| Icon size `h-6 w-6` (24px) is too large relative to text | Icons dominate the label, creating visual heaviness | No proportional scaling rule |
| `space-x-2` creates inconsistent gaps | Items lack uniform rhythm, especially when labels vary in character count | Should use `gap-1` on flex container instead |
| `stroke-[2.5]` on icons inside nav | Overrides the design-system stroke of 1.5px, making icons appear bolded and inconsistent with the icon set's intended weight | Inline className override |
| Active state uses `after:` pseudo-element underline | The underline indicator (`after:h-1 after:w-8 after:bg-primary`) is disconnected from the link's border-radius and can collide with the border-bottom of the navbar | Complex pseudo-element chain |
| `hover:scale-105` on nav links | Causes layout shift and sibling displacement on hover -- unprofessional in a data-heavy app | Transform on inline-flex items inside a flex container |
| Mobile sheet width is `w-full sm:w-[320px]` | Full-width on mobile can feel overwhelming and hides content context | Should use `w-[85vw] max-w-[320px]` |

### 2.2 Recommended Navbar Structure

```tsx
// Recommended dimensions and spacing
<div className="relative flex h-14 items-center border-b border-border px-4 lg:px-6 sticky top-0 z-50 bg-background/95 backdrop-blur-md">
  {/* Logo: 32px icon, no text on small screens */}
  <Logo size={32} />

  {/* Navigation: uniform gap, smaller touch targets */}
  <nav className="hidden lg:flex items-center gap-1 ml-8">
    {items.map(item => (
      <NavLink key={item.href} href={item.href} active={pathname === item.href}>
        <item.icon className="h-4 w-4" /> {/* 16px icons */}
        <span className="text-sm font-medium">{item.name}</span>
      </NavLink>
    ))}
  </nav>

  {/* Right-side controls */}
  <div className="ml-auto flex items-center gap-2">
    {/* ... */}
  </div>
</div>
```

### 2.3 Key Navbar Principles

1. **Height: 56px (`h-14`) maximum.** The standard for modern SaaS dashboards (Linear, Vercel, Notion) is 48-56px. This maximizes vertical space for data-dense content.

2. **Icon sizing: 16px (`h-4 w-4`) for inline navigation.** When an icon appears alongside a text label, it should be the same optical size as the text's x-height. At `text-sm` (14px), a 16px icon is the correct proportion.

3. **Spacing: Use `gap-1` (4px) between nav items.** Combined with internal padding (`px-3 py-2`), this creates a uniform 4px gutter that reads as a cohesive toolbar without items feeling cramped.

4. **Active indicator: Use `bg-muted` background, not underlines.** A subtle filled background (e.g., `bg-muted text-foreground`) is more robust than pseudo-element underlines. It works at any container width and is easier to animate.

   ```tsx
   className={cn(
     "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
     isActive
       ? "bg-muted text-foreground"
       : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
   )}
   ```

5. **No `scale` transforms on navigation items.** Hover effects in dense navigation should be limited to `color` and `background-color` changes. Scale transforms cause layout reflow, sibling displacement, and reduce the professional feel of a data application.

6. **Semantic HTML: Use `<nav>` with `aria-label`.** The current implementation correctly uses `<nav>` but should add `aria-label="Main navigation"` for screen readers.

### 2.4 Mobile Navigation Improvements

- Use `w-[85vw] max-w-[320px]` for the `<SheetContent>` width to maintain context of the underlying page.
- Group items into labeled `<section>` elements with `role="group"` and `aria-label`.
- Reduce icon size to `h-5 w-5` (20px) in mobile nav -- mobile items already have larger touch targets from padding.
- Remove `hover:scale-[1.02]` from mobile nav links entirely. On touch devices, scale transforms create a laggy feel.

---

## 3. Iconography: Consistency, Sizing, and Visual Quality

### 3.1 The Icon Consistency Mandate

Every icon in the application **must** share these invariant properties:

| Property | Value | Rationale |
|---|---|---|
| ViewBox | `0 0 24 24` | Standard grid, universal compatibility |
| Stroke Width | `1.5px` | Matches the "system-icons" canonical set and aligns with Lucide's default weight |
| Stroke Linecap | `round` | Softer terminals, modern feel |
| Stroke Linejoin | `round` | Consistent corner treatment |
| Fill | `none` (default) | Outlined style by default; filled variants only for emphasis |
| Default render size | Controlled by consumer via `className` | Icons should NOT set their own width/height in the SVG wrapper |

### 3.2 The `SvgTemplate` Pattern (Canonical)

The existing `SvgTemplate` in `system-icons.tsx` is well-designed:

```tsx
const SvgTemplate = ({ className, children, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-5 h-5", className)}
    {...props}
  >
    {children}
  </svg>
)
```

**Improvement**: The default `className` of `w-5 h-5` (20px) is appropriate for a universal default. However, it should be overridable cleanly. Ensure the `cn()` call places the `className` prop **after** the default so consumer classes win in specificity.

### 3.3 Icon Size Scale

Standardize on this scale throughout the application:

| Context | Size Class | Pixels | Usage |
|---|---|---|---|
| Inline with `text-xs`/`text-sm` labels | `h-4 w-4` | 16px | Navbar items, badges, table cells, breadcrumbs |
| Standalone small | `h-5 w-5` | 20px | Sidebar items, form field icons, button icons |
| Card header / section title | `h-5 w-5` | 20px | Dashboard card titles, metric card icons |
| Feature callout / empty state | `h-8 w-8` | 32px | Empty states, onboarding illustrations |
| Hero / large decorative | `h-12 w-12` | 48px | Marketing pages, loading screens |

**Critical rule**: Never use `h-6 w-6` (24px) for icons inline with text labels. This is the current navbar default and creates visual heaviness. `h-4 w-4` for `text-sm` labels, or `h-5 w-5` for `text-base` labels.

### 3.4 Eliminating Inline `<style>` Blocks

The `trading-icons-v2.tsx` file uses inline `<style>` elements with raw CSS class names (`.st0`):

```tsx
// ANTI-PATTERN: Inline <style> with global class names
<defs>
  <style>{`.st0 { fill: #10B981; transition: fill 0.2s; }`}</style>
</defs>
```

**Problems:**
- Global class names (`.st0`) will **collide** across different icon instances rendered simultaneously.
- Inline `<style>` blocks bypass Tailwind's purge and increase DOM parsing cost.
- Hardcoded colors (`#10B981`) break theme consistency -- they won't respond to dark mode or design token changes.

**Solution:** Replace all inline styles with `currentColor` inheritance and Tailwind classes:

```tsx
// CORRECT: Use currentColor and let the consumer control color
export const ESFuturesIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
    <rect x="4" y="16" width="3" height="4" fill="currentColor" opacity="0.6" />
    <rect x="10" y="12" width="3" height="8" fill="currentColor" opacity="0.8" />
    <rect x="16" y="8" width="3" height="12" fill="currentColor" />
  </svg>
)

// Consumer controls color via Tailwind:
<ESFuturesIcon className="h-5 w-5 text-emerald-500" />
```

### 3.5 Consolidation Strategy

1. **Merge** all navigation/system icons into `components/icons/system-icons.tsx`.
2. **Migrate** instrument icons from `trading-icons-v2.tsx` to use the `SvgTemplate` wrapper and `currentColor` pattern.
3. **Delete** `hand-crafted-icons.tsx` if no component imports from it (currently, no component in the main app shell does).
4. **Export** a typed `IconMap` for dynamic icon resolution:

   ```tsx
   export const IconMap = {
     dashboard: DashboardIcon,
     trades: TradeLedgerIcon,
     analytics: AnalyticsIcon,
     // ...
   } as const satisfies Record<string, React.ComponentType<IconProps>>
   ```

---

## 4. Color System: Unifying the Palette

### 4.1 Current Problem: Hardcoded Colors in Components

The dashboard page (`page.tsx`) extensively uses raw color values that bypass the design token system:

```tsx
// ANTI-PATTERNS found in dashboard/page.tsx:
"bg-gray-50 dark:bg-[#0B0D12]"          // Should be bg-background
"bg-white dark:bg-gray-900/40"           // Should be bg-card
"text-gray-500 dark:text-gray-400"       // Should be text-muted-foreground
"text-green-600 dark:text-green-400"     // Should use a semantic --success token
"border-gray-200 dark:border-gray-800"   // Should be border-border
"stroke: #e5e7eb"                        // Recharts -- should use CSS variable
```

### 4.2 Token-First Color Strategy

**Rule**: Every color in JSX should map to a semantic design token defined in `globals.css`.

| Raw Color | Replace With | Token |
|---|---|---|
| `bg-gray-50`, `bg-white`, `bg-[#0B0D12]` | `bg-background` | `--background` |
| `bg-white dark:bg-gray-900/40` | `bg-card` | `--card` |
| `text-gray-500 dark:text-gray-400` | `text-muted-foreground` | `--muted-foreground` |
| `bg-gray-100 dark:bg-gray-800` | `bg-muted` | `--muted` |
| `border-gray-200 dark:border-gray-800` | `border-border` | `--border` |
| `text-green-600` / `text-red-600` | `text-success` / `text-destructive` | `--success`, `--destructive` |
| `text-indigo-500`, `text-blue-600` | `text-primary` | `--primary` |

### 4.3 Recharts Color Integration

Recharts components accept string color values. Instead of hardcoding hex:

```tsx
// BEFORE:
<Area stroke="#3b82f6" />
<CartesianGrid stroke="#e5e7eb" />

// AFTER: Use CSS custom properties via inline style or a helper:
const chartColors = {
  primary: 'oklch(var(--primary))',
  border: 'oklch(var(--border))',
  success: 'oklch(var(--success))',
  destructive: 'oklch(var(--destructive))',
}

// Or use the chart tokens already defined:
// --chart-1 through --chart-5
```

For `linearGradient` definitions inside Recharts SVGs, reference CSS variables using `var()`:

```tsx
<stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
```

---

## 5. Dashboard Component Organization

### 5.1 Current Problem: Monolithic Page Component

`app/(app)/dashboard/page.tsx` is **1,430 lines** in a single file. It contains:

- Type definitions (`MetricCardProps`, `CalendarHeatmapProps`)
- Constants (`STRATEGY_COLORS`, `STRATEGY_ICONS`, `MOTIVATIONAL_QUOTES`)
- Helper functions (`calculateInstrumentPnL`, `getStrategyIcon`, `getGreeting`)
- Sub-components (`AnimatedTitle`, `CustomChartTooltip`, `MetricCard`, `CalendarHeatmap`)
- Data-fetching and state management logic
- The full render tree

### 5.2 Recommended File Structure

```
app/(app)/dashboard/
  page.tsx                    # Server component or thin client wrapper
  dashboard-client.tsx        # Main client component with state/effects

components/dashboard/
  metric-card.tsx             # MetricCard component (already has a folder)
  equity-chart.tsx            # AreaChart + BarChart + Calendar views
  strategy-breakdown.tsx      # Strategy pie chart and table
  calendar-heatmap.tsx        # CalendarHeatmap component
  dashboard-header.tsx        # Greeting, period selector, actions
  custom-chart-tooltip.tsx    # Reusable tooltip for Recharts

lib/dashboard/
  constants.ts                # STRATEGY_COLORS, ICONS map, QUOTES
  calculations.ts             # calculateInstrumentPnL, stats computation
  types.ts                    # MetricCardProps, CalendarHeatmapProps, etc.
```

### 5.3 Component Extraction Rules

When Claude generates dashboard components, enforce these rules:

1. **Max 200 lines per component file.** If a component exceeds this, it should be decomposed.
2. **Separate data logic from render logic.** Use custom hooks (`useDashboardStats`, `useChartData`) to encapsulate `useMemo` computations.
3. **Co-locate types with components.** `MetricCardProps` should live in or next to `metric-card.tsx`, not at the top of a 1,400-line file.
4. **Memoize sub-components correctly.** `React.memo` is used on `MetricCard` and `CalendarHeatmap` (good), but they should be in separate files so the memo boundary is clear.

### 5.4 Dashboard Grid Layout

The current grid is well-structured but can be improved:

```tsx
// Current: Good foundation
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// Improvement: Tighter gap on smaller metric cards, consistent with modern dashboards
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

**Key layout principles:**
- Use `gap-4` (16px) for dense data cards, `gap-6` (24px) for distinct content sections.
- The main content area should use a `lg:grid-cols-3` split: 2/3 for the primary chart, 1/3 for secondary panels (current implementation is correct).
- Add `min-h-0` to grid children that contain scrollable or resizable content (prevents CSS Grid blowout).

---

## 6. Performance and Rendering Optimizations

### 6.1 Reduce Unnecessary Re-renders

The dashboard page re-renders on every state change because everything is in one component. After decomposition:

```tsx
// Use SWR for data fetching instead of useState + useEffect
import useSWR from 'swr'

function useTrades(period: string) {
  return useSWR(['trades', period], () => getTrades(), {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  })
}
```

### 6.2 Icon Rendering Performance

- **Never define SVG components inline in JSX.** Each render creates a new function reference. Always define icons as named exports in a dedicated file.
- **Use `React.memo` on icon components only if they receive non-primitive props.** Since most icons only receive `className` (a string), memo is unnecessary overhead.
- **Avoid `strokeDasharray` on frequently re-rendered icons.** Dashed strokes are computationally more expensive to paint than solid strokes. Reserve them for decorative contexts.

### 6.3 CSS Transition Overhead

The current `globals.css` applies a **global transition to all elements**:

```css
* {
  transition-property: color, background-color, border-color, ...;
  transition-duration: 150ms;
}
```

This causes **jank on Recharts canvas resize**, chart tooltip positioning, and drag interactions. The existing `canvas { transition: none !important; }` fix is a band-aid.

**Recommendation:** Remove the global `*` transition. Instead, apply transitions explicitly on interactive elements:

```css
/* Only transition interactive elements */
button, a, [role="button"], input, select, textarea,
.transition-colors { /* Tailwind utility */
  transition-property: color, background-color, border-color;
  transition-duration: 150ms;
}
```

---

## 7. Accessibility (a11y) Checklist

### Navbar

- [ ] Add `aria-label="Main navigation"` to the `<nav>` element.
- [ ] Add `aria-current="page"` to the active nav link.
- [ ] Ensure the mobile menu trigger button has `aria-expanded` tied to the sheet state.
- [ ] Notification dot on the Updates button needs `aria-label="Updates (new)"` when `hasUnreadUpdates` is true.
- [ ] All icon-only buttons must have accessible text (either `aria-label` or `<span className="sr-only">`).

### Dashboard

- [ ] Metric cards with `onClick` should use `<button>` or `role="button"` with `tabIndex={0}` and keyboard event handlers.
- [ ] Chart views need `role="img"` with `aria-label` describing the data.
- [ ] Calendar heatmap cells need `aria-label` describing the day and P&L value.
- [ ] Color-only indicators (green/red for win/loss) must have a secondary indicator (icon, text, or pattern).

### Icons

- [ ] Decorative icons (next to text labels) should have `aria-hidden="true"`.
- [ ] Standalone icons (acting as the sole content of a button) must have a sibling `<span className="sr-only">` describing the action.
- [ ] SVGs should include `role="img"` only when they convey independent meaning without adjacent text.

---

## 8. Anti-Patterns to Avoid

### 8.1 Styling Anti-Patterns

| Anti-Pattern | Why It's Bad | Correct Approach |
|---|---|---|
| `hover:scale-105` on nav links | Layout reflow, sibling displacement | `hover:bg-muted` background change only |
| `stroke-[2.5]` on nav icons | Overrides design-system stroke weight | Remove; let `SvgTemplate` control stroke |
| `bg-gradient-to-r from-gray-900 via-slate-700 to-gray-900` on title text | Multi-stop gradients on text are expensive and hard to read | Use `text-foreground` solid color |
| `dark:bg-[#0B0D12]` arbitrary hex values | Bypasses token system, creates maintenance burden | Use `bg-background` token |
| `shadow-lg shadow-primary/20` on primary CTAs | Double shadow declarations conflict | Use one shadow: `shadow-md` or `shadow-lg` |

### 8.2 Component Anti-Patterns

| Anti-Pattern | Why It's Bad | Correct Approach |
|---|---|---|
| 1,400-line page component | Unmaintainable, poor HMR performance | Decompose into focused sub-components |
| Inline `<style>` in SVGs | Global CSS collisions, no tree-shaking | Use `currentColor` + Tailwind classes |
| `Math.random()` in render | Non-deterministic output, hydration mismatch | Use `useMemo` with stable seed or avoid |
| `setTimeout` for "smoother UI" | Artificial delay degrades perceived performance | Remove; use Suspense boundaries or skeleton states |
| `localStorage` in `useEffect` for state | Not SSR-safe, flash of stale content | Use cookies or server-side state |

### 8.3 Icon Anti-Patterns

| Anti-Pattern | Why It's Bad | Correct Approach |
|---|---|---|
| Three separate icon files with overlapping exports | Import confusion, bundle bloat | Single canonical source |
| Hardcoded fill colors (`fill: #10B981`) | Ignores theme, breaks dark mode | Use `fill="currentColor"` |
| Mixed stroke weights (1.5px vs 1.8px vs 2px) | Visual inconsistency across the UI | Standardize on 1.5px |
| `opacity` variants as design detail (`opacity="0.3"`) | Can make icons look broken at small sizes | Use at most 2 opacity levels: 1.0 and 0.4 |

---

## 9. Prompt Engineering: Instructing Claude for Better Output

When prompting Claude to generate or improve dashboard and navbar code, include these constraints:

### 9.1 System-Level Constraints (Include in Custom Rules)

```
NAVBAR RULES:
- Maximum navbar height: 56px (h-14). Never exceed this.
- Navigation icons must be h-4 w-4 (16px) when next to text labels.
- Never use hover:scale-* transforms on navigation items.
- Active state: bg-muted + text-foreground. No underline pseudo-elements.
- Use gap-1 between nav items, not space-x-*.

ICON RULES:
- All icons use the SvgTemplate wrapper from components/icons/system-icons.tsx.
- ViewBox: 0 0 24 24. StrokeWidth: 1.5. LineCap: round. LineJoin: round.
- Never use inline <style> blocks in SVGs.
- Never hardcode hex colors in SVGs. Use currentColor and opacity.
- Consumer controls size via className (h-4 w-4, h-5 w-5, etc.).

DASHBOARD RULES:
- Maximum 200 lines per component file.
- Never use raw color classes (bg-gray-*, text-green-*). Use design tokens only.
- Use bg-background, bg-card, text-foreground, text-muted-foreground, border-border.
- Charts must use CSS custom property colors, not hardcoded hex.
- Data fetching uses SWR or server components, never useState + useEffect.

COLOR RULES:
- Never use more than 5 colors total.
- All colors must reference CSS custom properties from globals.css.
- P&L positive: text-success (--success token). P&L negative: text-destructive.
- Primary actions: bg-primary text-primary-foreground.
```

### 9.2 Example Prompt for Dashboard Generation

```
Generate a dashboard metric card component for a trading journal app.

Requirements:
- Use the MetricCardProps interface from lib/dashboard/types.ts.
- Icon size: h-5 w-5 inside a bg-muted rounded-lg p-2 container.
- Value displayed in text-2xl font-bold font-mono.
- Change badge using the Badge component from shadcn/ui.
- Colors: Use ONLY design tokens (text-foreground, bg-card, text-muted-foreground, etc.).
- No hardcoded hex values. No raw Tailwind color classes.
- Hover effect: shadow-md transition, no scale transforms.
- Include aria-label on the card for accessibility.
- Max 60 lines of code.
```

### 9.3 Review Criteria for AI-Generated Code

Before accepting Claude-generated dashboard or navbar code, verify:

1. **No raw color classes** -- Search for `gray-`, `green-`, `red-`, `blue-`, `#` in the output. All should be tokens.
2. **Consistent icon sizing** -- All icons in the same context use the same `h-* w-*` class.
3. **No scale transforms on nav** -- Search for `scale-` in navbar-related code.
4. **Stroke weight consistency** -- All custom SVGs use `strokeWidth="1.5"`.
5. **File length** -- No single component file exceeds 200 lines.
6. **Accessibility** -- All interactive elements have focus states and ARIA attributes.

---

## 10. Quick Reference: Implementation Checklist

### Immediate Actions (High Impact, Low Effort)

- [ ] Reduce navbar height from `h-20` to `h-14` in `components/layout/navbar.tsx`
- [ ] Change nav icons from `h-6 w-6 stroke-[2.5]` to `h-4 w-4` (remove stroke override)
- [ ] Replace `space-x-2` with `gap-1` on the nav flex container
- [ ] Remove `hover:scale-105` from all `NavLink` components
- [ ] Replace active state underline with `bg-muted text-foreground` background
- [ ] Remove the artificial `setTimeout` delay (600ms) from `loadTrades`
- [ ] Replace `bg-gray-50 dark:bg-[#0B0D12]` with `bg-background` in dashboard page

### Medium-Term Actions (Architecture)

- [ ] Extract dashboard sub-components into `components/dashboard/` (MetricCard, EquityChart, CalendarHeatmap, StrategyBreakdown, DashboardHeader)
- [ ] Create `lib/dashboard/calculations.ts` for all PnL/stats logic
- [ ] Migrate all Recharts color references to CSS custom property variables
- [ ] Consolidate icon files: merge canonical icons into `system-icons.tsx`, migrate instrument icons to `currentColor` pattern, delete `hand-crafted-icons.tsx`

### Long-Term Actions (System-Wide)

- [ ] Remove the global `* { transition: ... }` rule from `globals.css` and apply transitions explicitly
- [ ] Implement SWR-based data fetching for dashboard trades
- [ ] Add comprehensive `aria-*` attributes to all interactive dashboard elements
- [ ] Create a Storybook or component showcase for the icon set to prevent future drift
- [ ] Add visual regression tests for the navbar at 768px, 1024px, 1440px, and 1920px breakpoints

---

## Summary

The two highest-leverage improvements for visual quality are: **(1)** reducing icon sizes and removing scale transforms in the navbar to achieve a clean, professional top bar, and **(2)** replacing all hardcoded color values with semantic design tokens so the dashboard respects theme changes and maintains visual coherence. Everything else -- component decomposition, performance optimizations, accessibility -- builds on these foundational consistency wins.
