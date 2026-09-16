# SandboxCard

The in-lesson mini runner: a bordered card with a workbench toolbar (title +
Reset + Run), an editing surface slot, and an output strip that only exists
after a run.

Canonicalises Learn.tsx:351-388's hand-rolled inline chrome — the rebuild runs
on **Workbench parts**: `x-workbench__toolbar` / `__tools` / `__hint` /
`__tool` / `__run` are referenced by class (contract §6 sibling reference).

## Props

| Prop | Type | Notes |
|---|---|---|
| `language` | `string` | shown in the strip |
| `children` | `ReactNode` | the editor surface — `<CodeEditorChrome hideHeader hideFooter/>` |
| `onRun` / `onReset` | `() => void` | absent → control not rendered |
| `running` | `boolean` | gates both actions, swaps the icon to a live loader |
| `output` | `string \| null` | `null` renders nothing — no empty output box |
| `label` | `string` | strip + landmark label (default "Runnable sandbox") |

## States

`idle` · `running` · `output`

## Fixed violations

- `#050810` output bg → `var(--terminal-bg, var(--c-surface-inset))`.
- `#2dd4bf` output text → `var(--terminal-fg, var(--c-success))` (the contract's
  literal map says `#2dd4bf` IS `--c-success`; Atlas's terminal fg wins where a
  graphite terminal world defines one).
- Inline `11px`/`12px`/`4px 8px` chrome → workbench part classes + `--space-*`.
- Output `pre` gains `role="status"` — a run's result is a live announcement.
- The 180px editor floor → `4 × --row-height` (density-aware).

## Depends on

- Sibling class hooks: `x-workbench__toolbar`, `__tools`, `__hint`, `__tool`,
  `__run` (owned by `Workbench/`).
- `states.ts` imports `CodeEditorChrome` for the composition demo only.

## Used on

- `/courses/:courseId/lessons/:lessonId` (Learn.tsx lesson sandbox)
