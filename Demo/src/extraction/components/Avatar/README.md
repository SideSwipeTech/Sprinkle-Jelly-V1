# Avatar

The person disc — merges three hand-rolled variants that all did the same
thing at different sizes.

## Sources

| Site | Was | Size |
|---|---|---|
| `shell.css:629` `.avatar` | 32px flat accent disc (NavLink host) | `md` |
| `admin-shell.css:86` `.admin-user > span` | 28px flat accent disc | `sm` |
| `Account.tsx:316` inline | 56px gradient disc + `color:"white"` literal | `lg` |

## Props

- `name` — the person's name; drives the initial AND `aria-label`
  (`role="img"`). The letter alone is `aria-hidden` — "V" announces nothing.
- `size` — `sm` (28) | `md` (32, default) | `lg` (56, two-stop accent gradient).
- `initial` — override for handles/aliases.
- `className` — escape hatch.

## States

Sizes only — `x-avatar--sm` / default / `x-avatar--lg`. Presentational: wrap
in `Link`/`NavLink` when it navigates (the host owns interaction + focus ring).

## Used on

- Shell header → `/profile` (md)
- `/admin/*` top bar — admin user (sm)
- `/profile` — level progression hero card (lg)

## Notes

- Sizes derive from `--space-*` (`--space-7` / `calc`s) — no `--size-*` scale
  exists; see the family report.
- The lg gradient uses `--c-accent-primary` → `--c-accent-light`, replacing
  the demo's `#2dd4bf` second stop; text is `--c-on-accent-primary`, not
  `"white"` (not white in every theme — contract §2).
