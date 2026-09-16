# ProblemPanel

The statement pane beside a workbench: prompt, tag/topic chips, constraints
inset, optional accepted-verdict banner, and a slot for `HintLadder`.

Canonicalises the left column of Practice.tsx:382-449.

## Props

| Prop | Type | Notes |
|---|---|---|
| `statement` | `ReactNode` | the prompt — accepts markup (`<code>`, paragraphs) |
| `tags` | `string[]` | plain chips |
| `badges` | `{accent?, quiet?[]}` | difficulty/policy chips after tags |
| `constraints` | `ReactNode[]` | inset list; absent → no inset renders |
| `constraintsTitle` | `string` | default "Constraints & Guarantees" |
| `verdict` | `{text, action?}` | accepted banner; absent → nothing (honest absence) |
| `children` | `ReactNode` | HintLadder slot |

## States

`full` · `solved` (verdict banner) · `statement-only`

## Fixed violations

- The accepted banner's `color-mix(in srgb, #2dd4bf …)` + `#2dd4bf` border/text
  literals → `--c-success` mixes; the banner is `role="status"` and carries a
  `check` glyph — never colour alone.
- All inline `fontSize`/`padding` literals → `--text-*`/`--space-*`.

## Depends on

- **Sibling class hooks:** `x-chip`, `x-chip--accent`, `x-chip--quiet` (controls
  family's Chip, contract §6 — referenced by class, not imported).
- `states.ts` imports `HintLadder` for composition demo only.

## Used on

- `/challenges/:challengeId` (ChallengeSolve left pane)
- `/debug/:caseId` (bug-brief pane — statement + badges, no constraints)
- `/daily/solve` (DailySolve problem card body)
