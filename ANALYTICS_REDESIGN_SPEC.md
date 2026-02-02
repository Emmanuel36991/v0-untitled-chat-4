# Analytics Page Redesign Specification

## Design Philosophy
Create a premium, data-focused trading analytics dashboard that combines professional aesthetics with exceptional usability. The design draws inspiration from Bloomberg Terminal, modern SaaS dashboards, and data visualization best practices.

---

## Color Palette

### Primary Colors
- **Background Base**: `oklch(0.08 0.018 264)` - Ultra-deep slate for reduced eye strain
- **Card Surface**: `oklch(0.14 0.025 264)` - Elevated dark surface with clear distinction
- **Primary Accent**: `oklch(0.65 0.28 270)` - Vibrant purple-blue for interactive elements

### Data Visualization Colors
- **Profit/Success**: Emerald spectrum
  - Light: `#10B981` (emerald-500)
  - Medium: `#059669` (emerald-600)
  - Strong: `#047857` (emerald-700)
  - Glow: `rgba(16, 185, 129, 0.2)` for shadows

- **Loss/Negative**: Rose spectrum
  - Light: `#EF4444` (rose-500)
  - Medium: `#DC2626` (rose-600)
  - Strong: `#B91C1C` (rose-700)
  - Glow: `rgba(239, 68, 68, 0.2)` for shadows

- **Neutral/Info**: Slate spectrum
  - Muted: `#64748B` (slate-500)
  - Borders: `#334155` (slate-700)
  - Text: `#94A3B8` (slate-400)

### Chart Colors (5-color palette for variety)
1. `oklch(0.70 0.30 270)` - Purple
2. `oklch(0.72 0.26 320)` - Magenta
3. `oklch(0.74 0.24 200)` - Cyan
4. `oklch(0.76 0.22 140)` - Green
5. `oklch(0.73 0.28 40)` - Amber

---

## Layout Structure

### Grid System
- **Base**: 12-column responsive grid
- **Breakpoints**:
  - Mobile: < 768px (1 column)
  - Tablet: 768-1024px (2 columns)
  - Desktop: > 1024px (3-4 columns)
- **Spacing**: 8px base unit (0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16)

### Page Sections

#### 1. Header Bar (Sticky)
- **Height**: 72px
- **Background**: Translucent card with blur (`bg-card/80 backdrop-blur-lg`)
- **Contents**:
  - Page title with icon
  - Date range selector (elevated design)
  - Export/Refresh actions
  - Filter toggles

#### 2. Hero Metrics Row
- **Layout**: 4-column grid (responsive to 2x2 on tablet, 1 column mobile)
- **Card Style**:
  - Elevated with shadow-xl
  - Gradient backgrounds based on metric type
  - Large typography (3xl-4xl for numbers)
  - Trend indicators with icons
  - Mini sparkline charts
- **Metrics**:
  - Total P&L (with percentage change)
  - Win Rate (with win/loss ratio)
  - Total Trades (with active days)
  - Profit Factor (with benchmark indicator)

#### 3. Calendar Heatmap Section
- **Width**: Full-width container (max-w-6xl centered)
- **Spacing**: Large top/bottom margins (12-16)
- **Features**:
  - Month navigation with smooth transitions
  - Color-coded intensity map (7-step gradient)
  - Rich hover tooltips with trade details
  - Current day highlight with ring
  - Activity indicators for trading days
  - Month summary stats in header
  - Interactive legend

#### 4. Performance Analytics Grid
- **Layout**: Asymmetric 2-column grid
- **Left Column (60%)**:
  - Equity curve chart (area chart with gradient fill)
  - Daily P&L distribution (bar chart)
- **Right Column (40%)**:
  - Win rate by setup (horizontal bar chart)
  - Psychology factors summary
  - Risk metrics cards

#### 5. Detailed Breakdown Section
- **Layout**: 3-column grid
- **Cards**:
  - Setup Performance (scatter plot)
  - Timing Analytics (heat calendar)
  - Psychology Insights (factor cards)

---

## Typography System

### Font Hierarchy
- **Display (Hero Numbers)**: 
  - Size: 36-48px (text-4xl/5xl)
  - Weight: 700 (bold)
  - Font: Mono for numbers, Sans for text
  
- **Headings**:
  - H1: 24px (text-2xl), weight-700
  - H2: 20px (text-xl), weight-600
  - H3: 16px (text-lg), weight-600
  
- **Body**:
  - Base: 14px (text-sm), weight-400
  - Medium: 14px (text-sm), weight-500
  - Bold: 14px (text-sm), weight-700
  
- **Labels/Captions**:
  - Size: 11-12px (text-xs)
  - Weight: 600 (semibold)
  - Transform: uppercase
  - Tracking: wider (0.05em)

### Line Height
- Display: 1.2
- Headings: 1.3
- Body: 1.6 (leading-relaxed)
- Tight: 1.25 (for metrics)

---

## Calendar Component Enhancement

### Heatmap Design
**Cell Specifications**:
- **Size**: Square aspect ratio (responsive)
- **Border**: 2px solid with color matching intensity
- **Border Radius**: 8px (rounded-lg)
- **Spacing**: 12px gap between cells
- **Transition**: All properties 200ms ease

**Intensity Mapping** (P&L-based):
```
No Activity:   bg-zinc-900/40  border-zinc-800/60
Profit Level 1: bg-emerald-500/30  border-emerald-700  (Low profit)
Profit Level 2: bg-emerald-500/50  border-emerald-600
Profit Level 3: bg-emerald-500/70  border-emerald-500
Profit Level 4: bg-emerald-500/90  border-emerald-400  shadow-emerald-500/20 (High profit)

Loss Level 1:   bg-rose-500/30  border-rose-700  (Low loss)
Loss Level 2:   bg-rose-500/50  border-rose-600
Loss Level 3:   bg-rose-500/70  border-rose-500
Loss Level 4:   bg-rose-500/90  border-rose-400  shadow-rose-500/20 (High loss)
```

**Interactive States**:
- **Hover**: `scale-110 z-10 shadow-2xl` with smooth transition
- **Current Day**: `ring-2 ring-primary ring-offset-2`
- **Selected**: Additional ring with accent color

**Tooltip Design**:
- **Trigger**: Hover state
- **Position**: Bottom-to-top with arrow indicator
- **Background**: `bg-popover/95 backdrop-blur-sm` for glassmorphism
- **Border**: 1px solid with slight opacity
- **Shadow**: Large shadow (shadow-2xl)
- **Contents**:
  - Date (bold, centered)
  - Net P&L (with color and +/- indicator)
  - Trade count
  - Average P&L per trade
  - Win rate percentage
  - Top setup if applicable

**Month Navigation**:
- **Style**: Elevated button group in card
- **Buttons**: Ghost variant with hover states
- **Label**: Bold, centered, mono font
- **Quick Action**: "Today" button to reset view

### Calendar Header Stats
- **Net P&L**: Large mono font with color indicator
- **Win Rate**: Percentage with wins/losses ratio
- **Trading Days**: Count of active days
- **Best Day**: Highlight with badge

---

## Component Specifications

### Metric Cards
```tsx
Structure:
- Icon (top-left, 20x20px, in circular bg)
- Label (small, uppercase, muted color)
- Value (large, bold, mono font for numbers)
- Trend Badge (percentage with arrow icon)
- Mini Chart (sparkline, 40px height)
```

**Styling**:
- Background: Gradient overlay based on metric type
- Border: Subtle 1px with slight opacity
- Padding: 24px (p-6)
- Shadow: Large elevation (shadow-xl)
- Hover: Slight lift effect with shadow increase

### Chart Cards
**Container**:
- Background: Card with slight transparency
- Border: Thin with accent color
- Padding: 32px (p-8)
- Shadow: Medium (shadow-lg)

**Chart Styling**:
- Grid Lines: Dotted, low opacity (0.1)
- Axis Labels: Small, muted color
- Tooltips: Custom design matching calendar tooltips
- Colors: Use 5-color palette with gradients
- Animations: Smooth entry animations (500ms)

### Badge Variants
- **Success**: `bg-emerald-500/20 text-emerald-400 border-emerald-500/30`
- **Danger**: `bg-rose-500/20 text-rose-400 border-rose-500/30`
- **Info**: `bg-blue-500/20 text-blue-400 border-blue-500/30`
- **Neutral**: `bg-slate-500/20 text-slate-400 border-slate-500/30`

---

## Interaction Patterns

### Hover Effects
- **Cards**: Lift by 2px, increase shadow intensity
- **Buttons**: Background color change, subtle scale (1.02)
- **Calendar Cells**: Scale to 110%, z-index elevation, tooltip display

### Click Interactions
- **Calendar Day**: Open detailed day view in modal/drawer
- **Metric Card**: Expand to show detailed breakdown
- **Chart Elements**: Highlight related data, show detailed tooltip

### Loading States
- **Skeleton Screens**: Shimmer animation with gradient
- **Transition**: Fade-in animation (300ms) when data loads
- **Progress**: Linear progress bar in header for long operations

### Empty States
- **Icon**: Large, muted, relevant icon (48x48px)
- **Message**: Encouraging text with actionable CTA
- **Action Button**: Primary button to add first trade

---

## Accessibility Considerations

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Interactive elements have clear focus indicators
- Colorblind-safe palettes with pattern/texture alternatives

### Keyboard Navigation
- Logical tab order through all interactive elements
- Calendar navigable with arrow keys
- Shortcuts for common actions (J/K for navigation)

### Screen Readers
- Semantic HTML with proper ARIA labels
- Chart data available in accessible table format
- Status announcements for dynamic updates

---

## Animation Guidelines

### Timing Functions
- **Standard**: `ease-in-out` for most transitions
- **Enter**: `ease-out` for elements appearing
- **Exit**: `ease-in` for elements disappearing
- **Spring**: For interactive hover effects

### Durations
- **Micro**: 150ms (button hover, small state changes)
- **Standard**: 200-300ms (card hovers, tooltips)
- **Moderate**: 400-500ms (page transitions, chart animations)
- **Long**: 600-800ms (complex animations, full-screen modals)

### Respecting Preferences
- Detect `prefers-reduced-motion`
- Disable animations for users who prefer reduced motion
- Maintain functionality without animations

---

## Responsive Behavior

### Mobile (< 768px)
- Single column layout
- Stacked metric cards
- Simplified calendar with vertical scroll
- Drawer-based detail views
- Touch-optimized hit targets (44x44px minimum)

### Tablet (768-1024px)
- 2-column grid for most sections
- Calendar maintains full width
- Side-by-side charts become stacked
- Larger touch targets maintained

### Desktop (> 1024px)
- Full 3-4 column grid layouts
- Side-by-side visualizations
- Hover states fully enabled
- Detailed tooltips and overlays

---

## Performance Optimizations

### Rendering
- Virtualization for large data sets
- Lazy loading for charts below fold
- Memo optimization for complex calculations
- Debounced interactions (filtering, searching)

### Data Loading
- Skeleton screens during initial load
- Progressive data loading (metrics → charts → details)
- Cached query results with SWR
- Optimistic updates for interactions

---

## Implementation Checklist

- [ ] Update globals.css with new color tokens
- [ ] Create RedesignedCalendarHeatmap component
- [ ] Redesign metric cards with gradient backgrounds
- [ ] Implement hover tooltip system
- [ ] Add smooth month navigation transitions
- [ ] Create custom chart tooltip components
- [ ] Implement responsive grid layouts
- [ ] Add loading skeleton screens
- [ ] Implement accessibility features
- [ ] Test color contrast ratios
- [ ] Optimize for mobile/tablet views
- [ ] Add keyboard navigation support
- [ ] Performance audit and optimization

---

## Future Enhancements

- **Interactive Filters**: Toggle metrics by instrument, setup, timeframe
- **Comparison Mode**: Compare different date ranges side-by-side
- **Custom Date Ranges**: More flexible date selection
- **Export Functionality**: PDF/PNG export of visualizations
- **Annotations**: Add notes to specific days/trades
- **Pattern Recognition**: AI-powered pattern highlighting
- **Collaborative Features**: Share analytics with mentors/peers
