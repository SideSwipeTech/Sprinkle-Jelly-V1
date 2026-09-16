# HintLadder

Progressive hint reveal — one click, one rung, the counter states the total.
Canonicalises Practice.tsx:409-437; the simpler one-at-a-time variant at
More.tsx:170-174 is the same anatomy with single-rung bodies.

## Props

| Prop | Type | Notes |
|---|---|---|
| `rungs` | `HintRung[]` | `{title, content}`; content may contain newlines (pre-wrap) |
| `revealed` | `number` | controlled count, clamped to `0..rungs.length` |
| `onReveal` | `(next: number) => void` | called with `revealed + 1` |
| `label` | `string` | section label (default "Hint ladder") |
| `emptyNote` | `string` | note at 0 rungs — honest absence, not an empty box |

## States

`sealed` (0/n) · `partial` · `exhausted` (n/n — reveal affordance gone)

## Fixed violations

- `rgba(99,102,241,0.08)`/`0.25` rung literals → `color-mix(--c-accent-primary)`;
  every identity tints its own accent.
- The `(n/3 REVEALED)` counter keeps its accent label + a real reveal button;
  the rungs region is `aria-live="polite"` so a reveal announces itself.
- `section` + `aria-label` — the ladder is a labelled region, not a div pile.

## Used on

- `/challenges/:challengeId` (inside ProblemPanel)
- `/daily/solve`, `/debug/:caseId` (More.tsx single-reveal variant)
