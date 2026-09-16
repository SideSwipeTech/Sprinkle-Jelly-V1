# CertificateCard

One issued credential — accent spine, seal plate, title, mono verification id,
public-check toggle, verify + download-proof actions.

## Props

- `id`, `title`, `awarded`, `valid`, `visibility: "public" | "hidden"`
- `onToggleVisibility: () => void`
- `verifyTo: string` — route to the seal page
- `proof: unknown` — payload downloaded via `downloadJson` (`./download.ts`)

## Utility

`downloadJson(filename, payload)` — the data-URI/anchor dance from
Account.tsx:450-462, now one function using an object URL that is revoked after
the click lands.

## Legacy violations fixed

- `rgba(99,102,241,.15)` seal → `color-mix` on `--c-accent-primary`
- `rgba(45,212,191,.15)`/`rgba(255,255,255,.08)` visibility chip → `data-on` +
  success/text `color-mix` + check/lock icon + word + `aria-pressed`
- `borderTop: 3px solid` → `calc(var(--border-width) + 2px)` spine

## Composes

Kit `Card`, `Icon`; `x-chip`, `x-btn` (controls).

## Used on

- `/certificates` — Certificates grid
