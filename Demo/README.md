# Wizly Labs — Public Demo

A frontend-only, customer-facing demo of Wizly Labs. No backend, no real customer data, no signup required.

## What it is

- A copy of the product-prototype (`H:/Claude/Sprinkle-Jelly/product-prototype`) with a demo layer added.
- All state is in-memory / `localStorage` and seeded from `src/state/demo.ts`.
- Every route is read-mostly: side effects are simulated and resettable.
- Admin routes are disabled by default (`VITE_DEMO_ADMIN=1` to enable for staff demos).

## Run

```bash
cd H:/Claude/Sprinkle-Jelly/Demo
pnpm install
pnpm dev
```

Open **http://127.0.0.1:5300**.

Entry points:

- `/demo` — public landing page with CTA cards.
- `/` — the demo dashboard (auto-logs in as the demo user).

## Build

```bash
pnpm build
pnpm preview
```

The `dist/` folder is a static SPA and can be deployed to any static host.

## Demo behaviour

- A sticky demo banner is shown on every screen; it can be dismissed and has **Get Started**, **Upgrade**, and **Reset** CTAs.
- Analytics stubs are written to `wp.demo.analytics` in `localStorage` and to the console.
- Sign-out in Settings resets the demo state to the seed instead of ending the session.
- `/admin` routes redirect to `/` unless `VITE_DEMO_ADMIN=1` is set.

## Reset demo data

Click **Reset** in the demo banner, or use **Sign out** in Settings. Both restore the original seeded state and keep the visitor signed in as the demo user.
