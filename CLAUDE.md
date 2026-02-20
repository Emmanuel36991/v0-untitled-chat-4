# CLAUDE.md - Concentrade Trading Journal

## Project Overview
- **Stack**: Next.js 15 + React 19, Supabase (auth + DB), Tailwind CSS 4, TypeScript
- **AI**: Groq API (Llama 3.3) for trade analysis, dashboard insights, and chat
- **Payments**: Rapyd (subscription billing with webhook integration)
- **Broker Integrations**: Alpaca (stocks, active), Tradovate (futures, coming soon), TradingView (alerts, coming soon)
- **Charts**: Recharts, Chart.js, Lightweight Charts, TradingView widget
- **Deployment**: Vercel
- **App Name**: Concentrade

## Architecture Notes
- App Router with `(app)` route group for authenticated pages
- Server Actions in `app/actions/` for all DB mutations
- API routes in `app/api/` for external integrations and AI streaming
- Supabase RLS provides row-level security (user_id checks in queries are defense-in-depth)
- Rate limiting is in-memory (resets on server restart) - adequate for single-instance Vercel but won't work for multi-instance
- CSRF module exists but is NOT actively used by any endpoint
- Security headers configured in `next.config.mjs` (HSTS, X-Frame-Options, etc.)

## Key Conventions
- Server actions always call `supabase.auth.getUser()` and check user before DB operations
- All trade DB operations filter by `user_id` to prevent IDOR
- AI endpoints use per-user rate limiting (separate from global middleware rate limit)
- Input sanitization via `lib/security/input-validation.tsx` for AI prompts
- Error handler in `lib/error-handler.ts` hides detailed errors in production
- Zod validation for trade input (`lib/validators/trade.ts`) and account creation (`lib/validators/account.ts`)

## Key Security
- Alpaca API credentials are encrypted with AES-256-GCM before storing in the database (`lib/security/encryption.ts`)
- Requires `CREDENTIALS_ENCRYPTION_KEY` env var (64-char hex string = 32 bytes)
- The sync route supports both encrypted (new) and plain JSON (legacy) credential formats for backward compat
- Social Insights and Backtesting pages have been removed (Coming Soon features not ready for beta)
- Tradovate login is disabled; connection modal shows "Coming Soon" for Tradovate

## Lessons Learned (Beta Prep Audit - Feb 2026)

### Rate Limiter Behavior
- The rate limiter at `lib/security/rate-limiter.ts` is in-memory using a Map. It resets on every deployment/restart.
- On Vercel serverless, each cold start gets a fresh Map, so rate limits are effectively per-instance and short-lived.
- For beta this is acceptable; for production consider Upstash Redis or Vercel KV.
- The global middleware rate limit uses `getRateLimitKey("api")` which returns `"api:global"` - this means ALL API requests from ALL users share one counter. This is a blunt instrument.

### CSRF Protection Gap
- `lib/security/csrf.ts` exists with full token generation/validation but is NEVER imported or used by any API route or server action. It's dead code.
- Server Actions in Next.js have built-in CSRF protection (origin checking), so this is lower priority, but API routes doing mutations (POST to /api/alpaca/connect, /api/tradovate/auth, etc.) lack CSRF verification.

### dangerouslySetInnerHTML Usage
- Used in `app/(app)/guides/[slug]/page.tsx:121` to render guide content. The guide content comes from a static `lib/tutorials.ts` file (developer-authored HTML), NOT from user input or database. This is safe as long as guides remain static.
- Also used in `components/support/support-faq.tsx:76` for FAQ answers - also static developer content.
- If guides are ever loaded from a database or CMS, this becomes an XSS vector and must be sanitized.

### Supabase Client Pattern
- `lib/supabase/server.ts` uses cookie-based auth with proper `getAll`/`setAll` pattern
- `lib/supabase/client.ts` is a simple browser client
- The `warn` in server.ts `setAll` catch is expected when called from Server Components (not a bug)

---

# BETA READINESS AUDIT (Target: March 15, 2026)

## CRITICAL - Must Fix Before Beta

### 1. ~~[SECURITY] Alpaca API Credentials Stored in Plain Text~~ FIXED
- **Status**: Resolved. Credentials are now encrypted with AES-256-GCM via `lib/security/encryption.ts` before storing in DB. Decrypted on read in sync route. Legacy plain JSON is still supported for backward compat during migration.

### 2. [SECURITY] Tradovate Session Stored in Cookie as Plain JSON
- **File**: `app/api/tradovate/trades/route.ts:10-17`
- **Issue**: The Tradovate access token is stored in a cookie (`tradovate_session`) as plain JSON. This includes the raw `accessToken`. If HttpOnly/Secure flags aren't set, this is vulnerable to XSS token theft.
- **Fix**: Ensure the cookie is set with `httpOnly: true, secure: true, sameSite: 'strict'`. Consider encrypting the cookie value.

### 3. [SECURITY] Community Actions Use Hardcoded Mock User IDs
- **File**: `app/actions/community-actions.ts:173,199,215,231,249`
- **Issue**: `createPost`, `likePost`, `unlikePost`, `followUser`, `addComment` all use hardcoded `mockUserId = "550e8400-e29b-41d4-a716-446655440000"` instead of the actual authenticated user. This means ALL community actions are attributed to the same fake user - any user can impersonate.
- **Fix**: Replace with `supabase.auth.getUser()` and use `user.id`. These functions already create a supabase client but never check auth.

### 4. [SECURITY] OHLC API Route Has No Authentication
- **File**: `app/api/ohlc/route.ts:165`
- **Issue**: The GET endpoint fetches market data from Finnhub/Yahoo with no auth check. While market data isn't sensitive, it exposes your Finnhub API key usage to abuse (anyone can call this endpoint to proxy free market data through your API key).
- **Fix**: Add auth check or at minimum aggressive rate limiting.

### 5. [SECURITY] Tradovate Auth Endpoint Lacks Rate Limiting
- **File**: `app/api/tradovate/auth/route.ts`
- **Issue**: The POST endpoint accepts username/password and forwards to Tradovate. It relies only on the global middleware rate limit (100/min shared across ALL API calls). A dedicated attacker could brute-force Tradovate credentials.
- **Fix**: Add per-IP or per-username rate limiting (e.g., 5 attempts per 15 minutes).

### 6. [SECURITY] Instruments Config API Has No Authentication
- **File**: `app/api/instruments/config/route.ts`
- **Issue**: Returns instrument configuration data with no auth. Low risk since it's static reference data, but it shouldn't be publicly accessible.

### 7. [UNFINISHED] Stub Functions in Trade Actions
- **File**: `app/actions/trade-actions.ts:536-537`
- **Issue**: `getSessionAnalytics()` and `getDurationAnalytics()` are stub functions that return empty arrays. If any page calls these, users see no data.

### 8. [UNFINISHED] Paywall Is Completely Disabled
- **File**: `middleware.ts:82-108`
- **Issue**: The entire subscription paywall is commented out with `// TEMPORARY: Paywall disabled for testing`. All authenticated users get full access regardless of subscription status. Decide before beta whether this is intentional (free beta) or if you need to re-enable it.

## HIGH - Should Fix Before Beta

### 9. [SECURITY] Tradovate Health Endpoint Has No Authentication
- **File**: `app/api/tradovate/health/route.ts`
- **Issue**: Makes live requests to Tradovate API servers on every call. Public access means anyone can use your server as a Tradovate health-check proxy.

### 10. [SECURITY] Webhook Signature Uses Non-Constant-Time Comparison
- **File**: `app/api/webhooks/rapyd/route.ts:32`
- **Issue**: `signature === expectedSignature` is vulnerable to timing attacks. Use `crypto.timingSafeEqual()` instead.

### 11. [UNFINISHED] Test/Dev Pages Still Accessible
- **File**: `app/tradovate/test/page.tsx`
- **Issue**: The Tradovate API test page with `DevelopmentTestPanel` is accessible in production. Contains raw API testing UI that should not be exposed to users.
- **Fix**: Remove or gate behind `NODE_ENV === 'development'` check.

### 12. [UNFINISHED] Duplicate Design Doc
- **File**: `DESIGN_OVERHAUL_PROMPT copy.md` (identical to `DESIGN_OVERHAUL_PROMPT.md`)
- **Issue**: Duplicate file with " copy" in name. Not a security risk but sloppy for release.

### 13. [UNFINISHED] Contact Page Has Placeholder Corporate Details
- **File**: `app/contact/page.tsx:188`
- **Issue**: Contains an explicit warning: "The corporate details section contains placeholder information". This is visible to users and must be updated with real business info before launch.

### 14. [UNFINISHED] Community Fake Data in Production Code
- **File**: `app/actions/community-actions.ts:37-40,127`
- **Issue**: `updateCommunityStats` injects random fake data (`neural_networks_active: Math.floor(800 + Math.random() * 200)`). `getCommunityPosts` simulates likes with `Math.random() > 0.7`.

### 15. [QUALITY] ESLint and TypeScript Errors Ignored During Build
- **File**: `next.config.mjs:3-8`
- **Issue**: Both `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true` are set. This means the app can deploy with type errors and lint violations. This is dangerous for a production app.
- **Fix**: Remove these flags and fix all build errors before beta.

### 16. [QUALITY] 161 Console Statements Across 52 Files
- **Issue**: Excessive `console.log/warn/error` statements throughout the codebase. Many are debug logs (e.g., `console.log("[v0] Analyze request...")`). These leak implementation details in browser console and clutter server logs.
- **Fix**: Replace with the existing `logger` utility or remove debug statements.

### 17. [SECURITY] Sample Trades Endpoint Has No Rate Limiting
- **File**: `app/api/trades/sample/route.ts`
- **Issue**: POST endpoint creates 5 sample trades in the database. No rate limiting beyond the global middleware. A malicious user could call this repeatedly to flood their account with sample trades.

## MEDIUM - Nice to Fix Before Beta

### 18. [QUALITY] Placeholder Images Reference `/placeholder.svg`
- **Files**: `components/dashboard/trade-details-view.tsx:659,676`, `app/demo/layout.tsx:83`, `app/(app)/guides/important/page.tsx:127`
- **Issue**: Multiple components reference `/placeholder.svg` or `/placeholder-user.jpg` which may not exist, causing broken images.

### 19. [UNFINISHED] Social Insights Page is Coming Soon
- **File**: `app/(app)/social-insights/page.tsx`
- **Issue**: Full "Coming Soon" overlay with waitlist email form. The waitlist form doesn't actually save emails anywhere - it just shows a toast. Either implement email collection or remove the form.

### 20. [UNFINISHED] Backtesting Page is Coming Soon
- **File**: `app/(app)/backtesting/page.tsx`
- **Issue**: Similar to social insights - has a "Coming Soon" overlay with a waitlist form that also doesn't persist emails.

### 21. [QUALITY] Indicator Panel Has "Conceptual" Labels
- **File**: `components/indicator-panel.tsx:212`
- **Issue**: Contains "Strategy Templates (Conceptual)" label and text "Templates can pre-configure indicators. Full strategy logic is complex." This reads as unfinished developer notes.

### 22. [QUALITY] `createCustomerPortalUrl` Returns Input Unchanged
- **File**: `lib/rapyd.ts:175-183`
- **Issue**: The function is a stub that just returns `returnUrl`. Comment says "Rapyd doesn't have a built-in customer portal like Stripe / You would need to build your own management page". If this is called anywhere, users get a broken redirect.

### 23. [SECURITY] In-Memory Rate Limiter Memory Leak
- **File**: `lib/security/rate-limiter.ts`
- **Issue**: Old entries in `rateLimitStore` are never cleaned up. The Map only resets entries when the same key is accessed after window expiry. Keys from users who never return accumulate forever (until server restart). In serverless this is minimal risk since instances are short-lived.

### 24. [SECURITY] Open Redirect Partial Fix
- **File**: `middleware.ts:77` and `lib/security/redirect-validation.ts`
- **Issue**: The middleware sets `redirectTo` from `request.nextUrl.pathname` on auth redirect. The auth callback uses `getSafeRedirectUrl` which properly validates. However, the login page needs to also validate the `redirectTo` query param before using it. Check that the login form doesn't blindly redirect to the `redirectTo` value.

## LOW - Minor Issues

### 25. Images Unoptimized
- **File**: `next.config.mjs:10`
- **Issue**: `images.unoptimized: true` disables Next.js image optimization. All images served at original size/format.

### 26. Many `"latest"` Version Pins in package.json
- **File**: `package.json`
- **Issue**: Most dependencies use `"latest"` instead of pinned versions. A bad upstream release could break your app without warning. Lock versions with `pnpm lock` before beta.

### 27. CORS Allows Specific Origin
- **File**: `next.config.mjs:47`
- **Issue**: CORS is set to `https://v0-concentrade-mu.vercel.app`. Make sure this matches your actual production domain. If you've changed domains, update this.
