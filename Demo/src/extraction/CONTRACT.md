# Extraction contract — the rules every extracted component follows

This library is the reference implementation the platform frontend is built from. The Kitchen
Sink renders every extracted component in every state; **a state not in the sink does not exist.**

## File shape

```
extraction/
  components/
    <Name>/
      <Name>.tsx        the component — one implementation, all themes
      <Name>.css        its styles — token-driven
      states.tsx        the state matrix the sink renders (JSX — always .tsx, never .ts)
      README.md         props, states, "Used on:" address list
```

Names are `PascalCase` folders. CSS classes are `x-name`, `x-name__part`, `x-name--modifier`
(prefix `x-` so extracted styles can't collide with the demo's legacy global CSS).

## The hard rules

1. **No literals, ever.** No hex/rgba colors, no px radii, no px spacing, no px font sizes, no ms
   durations in component code. Everything reads a token. Token sources:
   `src/tokens/tokens.css` (space/text/radius/z/ease/state primitives, `--shell-nav-*`),
   `src/tokens/subthemes.css` (per-identity `--c-*` palette + `--radius-*` + `--duration-*`),
   `src/families/*` (accent tints, skins, typefaces).

2. **Literal → token map** (the systematic findings):

   | Literal found | Replace with |
   |---|---|
   | `#2dd4bf`, `rgba(45,212,191,*)` | `var(--c-success)` / `color-mix(in srgb, var(--c-success) X%, transparent)` |
   | `#fbbf24`, `rgba(251,191,36,*)` | `var(--c-warning)` |
   | `#fb7185`, `#f43f5e`, `rgba(244,63,94,*)`, `rgba(251,113,133,*)` | `var(--c-error)` |
   | `rgba(99,102,241,*)`, `#6366f1`, `#818cf8` | `color-mix(in srgb, var(--c-accent-primary) X%, transparent)` |
   | `color:"white"` on accent | `var(--c-on-accent-primary)` — it is NOT white in every theme |
   | `rgba(255,255,255,.08)` tints | `color-mix(in srgb, var(--c-text) 8%, transparent)` — hardcoded white breaks light schemes |
   | `rgba(0,0,0,*)` shadows/scrims | `rgba(var(--c-shadow-rgb), X)` |
   | `fontSize:"10px"`/`"11px"` | `var(--text-2xs)` |
   | `fontSize:"12px"` | `var(--text-xs)`; `"13px"` → `var(--text-sm)` |
   | `borderRadius:999`/`"50%"` | `var(--radius-pill)` / circle is allowed as `50%` in CSS, never inline |
   | `padding/gap/margin:"Npx"` | `var(--space-N)` family |
   | `minHeight/maxWidth:"Npx"` | nearest `--space-*` or a named layout token |
   | `letterSpacing:"0.08em"` | `var(--tracking-micro)` if present, else add a token name |

   If a needed token does not exist, stop and name it in your report — do not invent a literal.

3. **State model.** Visual state rides data attributes, not class soup:
   `data-on` (selected), `data-done` (answered/complete), `data-state` (the seven honesty keys),
   `data-active`, `data-disabled`. The seven honesty states are closed:
   `data | stale | pending | unavailable | empty | refused | pruned` — `StateBlock` owns them.
   Honest-absence rule: never render an empty container; a missing thing gets a `StateBlock` or
   nothing, and a figure that could not be read renders an em dash, never zero.

4. **Accessibility is not optional.** `aria-pressed` on toggle chips, `aria-selected`/`role=tablist`
   on tabs, `aria-current` on active nav, `aria-disabled` + `disabled`/`tabIndex` on gated controls
   (never `pointerEvents:none` + opacity), `role="status"`/`role="alert"` on live regions,
   `focus-visible` rings, and `prefers-reduced-motion` fallbacks for every animation.

5. **Theming.** Components are theme-agnostic. Per-theme differences go in
   `[data-theme="<identity>"]` / `[data-scheme]` / `[data-subtheme]` CSS blocks inside the
   component's own stylesheet — and only where *construction* differs (e.g. a chamfered card
   needing different clipping). If a component genuinely needs different markup per theme, that is
   an exception: `<Name>.<theme>.tsx` beside the base file, and a `README.md` line saying why.
   Never branch on theme inside render logic for color or size.

6. **Allowed imports:** the existing kit (`../../components/` — Card, CardHeader, StateBlock,
   Stat, Charge, ChargeRing, Page, Back, CoverageTag, Icon, CodeEditor suite), foundation hooks
   (`../../foundation/` — `useSubtheme`, `useChargeStops`, `readAppearance`, motion hooks), and
   `../../tokens/values`. Never import from `pages/`, `data/`, `state/`, `demo/`, `admin/`,
   `nav/`, `companion/`. Sibling extraction components are referenced by their `x-*` classes, not
   imported — a later consolidation pass may promote class use to imports.

7. **Native crutches die here.** `window.confirm`, `window.prompt`, `alert()` are replaced by the
   `Dialog` component (overlays family). No component may call them.

8. **Do not extract dead code.** Unrouted exports, unused classes, dead CSS (`chip--accent`,
   `btn--disabled`, `b11-table-wrap`, `lab-workspace`, `stack--md`, `.is-soon`, `.filters__select`,
   the `pulse` animation) are listed in `coverage.md` — they are deliberately absent.

9. **File bounds.** Keep each file under ~400 lines; split a component that wants more.

10. **No edits outside `extraction/`.** The pages keep their legacy code; this library is a
    parallel reference. Consuming it in pages is a separate task.

## The theme axes (sink switchers must cover)

- `data-theme` — 6 identities: halo, voyage, forge, meridian, atlas, atelier
- `data-scheme` — light / dark (follow-system is a selection mode, not a scheme)
- `data-subtheme` — 4 sub-variants on package identities only
- `data-accent` — 5 accents + default
- `data-type`, `data-nav` — typefaces and nav models (sink offers them as page-level switches,
  not per-component)

API: `readAppearance()` / `applyAppearance(patch)` write the data attributes; identity switches go
through `performMetamorphicTransition`; `useSubtheme()` reads the active subtheme.

## Deliverable report

Each extraction agent reports back: components delivered, tokens they needed that don't exist,
legacy violations fixed, deviations from this contract, and anything found that needs a decision.
