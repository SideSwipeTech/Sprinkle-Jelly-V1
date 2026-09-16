# SettingsTabs

The icon tab strip at the top of Settings — `.settings-tabs` / `.settings-tab`
(app.css:174-201).

## Props (in words)

- `tabs` — `{id, label, icon, disabled?}[]` (icon is a Keyline `IconName`).
- `value` / `onChange(id)` — controlled active tab.
- `label` — accessible name on `role="tablist"` (e.g. "Settings sections").
- `className`.

## States

Per tab: `aria-selected` + `data-on` (accent-tinted cell, accent icon) · hover ·
`data-disabled`. Roving `tabIndex` + Arrow/Home/End navigation; disabled tabs skipped.
Layout: `flex: 1 1 0` fills equally when the tabs fit, content-width + horizontal
scroll (scrollbar hidden) when they don't — **no breakpoint**: the legacy version's
bespoke 760px media query is gone per the contract's band rule.

## Used on

- `/settings` — the five section tabs (Account.tsx:154-160)

## Notes

Was `<nav>` + `data-on` only; now a real `tablist`/`tab`/`aria-selected` structure.
Panels are the page's job — the demo conditionally renders per active id, matching
tab semantics.
