# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

DGcost — a Next.js SaaS app for bakery/pastry businesses to cost out recipes (materials + labor), manage inventory, clients, and orders. Multi-tenant, subscription-gated (free/basico/profesional/empresarial plans), backed by Supabase. UI copy and domain terms are in Spanish (e.g. `productos`, `recetas`, `gastosFijos`) — keep new code consistent with that.

A companion React Native mobile app is planned (see `MOBILE-APP-README.md`) but does not live in this repo; it's a spec for a separate project sharing the same Supabase backend.

## Commands

```bash
npm run dev              # Next.js dev server (http://localhost:3000)
npm run build            # production build
npm run lint             # next lint

npm test                 # jest unit tests
npm run test:watch
npm run test:coverage
npx jest __tests__/unit/calculations.test.ts   # run a single test file
npx jest -t "nombre del test"                  # run tests matching a name

npm run test:e2e         # playwright e2e (auto-starts dev server)
npm run test:e2e:ui      # playwright UI mode
```

Unit tests live in `__tests__/unit/` (jest + jsdom, path alias `@/` → repo root). E2E tests live in `e2e/` (playwright, chromium only, baseURL `localhost:3000`).

Docker (optional local alt to `npm run dev`): `docker-compose up` / `docker-compose exec app npm run <cmd>` — see `DOCKER-README.md`.

## Architecture

**Data layer / storage convention.** All persistence goes through Supabase via files named `lib/storage*.ts` (`storageSupabase.ts` for productos/recetas/configuración/unidades/categorías/gastos fijos, `storageInventario.ts`, `storageVentas.ts`, `subscriptionStorage.ts`). Every write in these files follows the same pipeline: `sanitizeStringFields()` (lib/sanitize.ts, strips HTML/XSS from free-text fields) → Zod schema from `lib/validators.ts` (`safeParse`, returns `{ exitoso: false, error }` on failure instead of throwing) → map to DB shape → Supabase `insert`/`update` → fire-and-forget `registrarActividad()` (activity log) or `registrarErrorSistema()` on failure. Follow this exact pattern for any new entity/table rather than calling Supabase directly from components or hooks.

`lib/storage.ts` is legacy localStorage-era code, superseded by the Supabase-backed modules above — it is not imported anywhere; don't build on it.

**Auth, role, and plan gating (three separate layers, all client hooks):**
- `contexts/AuthContext.tsx` — Supabase session/user via `useAuth()`; also fires login/logout activity logging and BCV price sync on `SIGNED_IN`.
- `hooks/useRole.ts` — fetches `user_roles` table (`useRole()` → `role`, `isAdmin`), with an in-memory cache/in-flight dedupe (`roleCache`/`roleRequestCache`) since it's queried frequently across the app.
- `hooks/usePlanAccess.ts` / `useSubscription.ts` — resolves plan features (`types/subscription.ts` `PLAN_FEATURES`/`planToFeatures`); admins are always treated as `empresarial`. Use `canAccess(feature)` / `getCurrentCount()` to gate features and enforce per-plan limits (max productos/recetas) rather than hardcoding plan checks.

Server-side, `middleware.ts` handles three concerns per request in order: (1) skip `/api/cron/*` (auth'd separately via `CRON_SECRET`), (2) Upstash rate-limiting on `/api/*` (soft-disabled if Upstash env vars are absent), (3) maintenance-mode redirect driven by the `system_settings` table (admins bypass), then (4) delegates to `utils/supabase/middleware.ts` `updateSession()` for SSR session refresh/auth redirects.

**Currency model.** All monetary values are stored and calculated in USD everywhere in the DB/logic. BS (Bolívares) is a display-only conversion using a manually configured exchange rate (`configuracion.tasaCambioUSD`, synced from BCV — see `lib/bcvSync.ts` and the `bcv-exchange-rate` cron route). Use `lib/currency.ts` helpers (`convertirUSDaBS`, `formatearBS`, etc.) and the `<PrecioDual>` component for display; never convert before storing or computing. Details in `SISTEMA-MONEDAS.md`.

**Product presentation model.** Products separate "size of one package" from "how many packages purchased" (`tamañoPresentacion` × `cantidadPresentaciones` = `cantidadTotal`), which then derives `precioPorUnidad` used when costing a recipe's materials. See `SISTEMA-PRESENTACIONES.md` for the full field semantics before touching `Producto`-related calculations in `lib/calculations.ts`.

**Route structure (`app/`):** standard Next.js App Router. Feature areas mirror `lib/`/`hooks`/`components` naming 1:1 (`productos`, `recetas`, `inventario`, `ventas`, `clientes`, `gastos-fijos`, `unidades`, `categorias`, `pedidos`). `app/admin/*` is role-gated (blog CMS, plan management). `app/api/` holds route handlers for admin actions, analytics, file upload, and cron jobs (cron routes authenticate via `CRON_SECRET`, not user sessions).

**UI components:** shadcn/ui (`components/ui/`, config in `components.json`, Tailwind v4, base color slate). Feature components are grouped by domain under `components/<domain>/` matching the `app/` route names.

**Security headers/CSP** are centrally defined in `next.config.js` (`securityHeaders`) — if you add a new external script/API dependency (fonts, analytics, a new Supabase-adjacent host), update the CSP `connect-src`/`script-src` there or requests will be silently blocked in production.
