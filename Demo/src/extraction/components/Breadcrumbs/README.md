# Breadcrumbs

One component, two consumers: the tokenized learner trail
(`src/components/Breadcrumbs.tsx` — all inline styles) and the admin topbar crumb
(`admin-shell.css:81-83` + `admin-nav.ts:92-100`).

## Anatomy

`x-crumbs` (`nav` landmark) → `x-crumbs__list` (`ol`) of `x-crumbs__item` (`li`:
`x-crumbs__sep` chevron + `x-crumbs__link` or `x-crumbs__label[aria-current="page"]`).
Variant `current`: `x-crumbs--current` → `x-crumbs__context` ("A / B" ancestors) +
`x-crumbs__here` (the page title, `aria-current`).

## Props

- `items: {label, to?}[]` — ordered crumbs; last is the current page. Empty renders
  `null` (honest absence).
- `variant: "trail" | "current"` — `trail` is the learner pattern; `current` is the
  admin pattern.
- `label` — nav landmark name (default `"Breadcrumb"`).

## Boundary

Crumb **resolution** (pathname → labels via catalog data, `adminBreadcrumb`) stays
with the consumer — this component is presentation-only and never imports `data/`.
Consumers hand it finished `items`.

## States

`trail` · `trail-short` · `current` · `current-root` · `empty`.

## Used on

- Every learner route below `/` — `Shell.tsx` main column (`Breadcrumbs.tsx` today).
- `/admin/*` topbar — `adminBreadcrumb(pathname)` output feeds `variant="current"`.
