# RouteNotFound

The 404 row — icon plate, title, the no-disclosure line, a way back. Adopted
from Account.tsx's `NotFound`, already token-clean.

## Props

- `icon?: IconName` — default "search"
- `title?`, `detail?` — the copy; defaults carry the no-disclosure rule
- `action: ReactNode` — the way back (`x-btn` link)

## Used on

- `*` (catch-all) — NotFound
