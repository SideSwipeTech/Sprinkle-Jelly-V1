# CodeEditorChrome

The code editor's chrome: header (file meta, lang badge, engine toggle, font zoom,
minimap, copy, run), the editing surface (Monaco **or** the tokenized Theme Native
surface), and the status footer. `monacoTheme.ts` + `tokenize.tsx` are sub-modules
of this folder — same component, split for the file bound.

Canonicalises `components/CodeEditor` (`pro-editor`).

## The critical fix

The kit defined `wizly-dark` / `wizly-light` as ~20 hardcoded hexes
(CodeEditor.tsx:225-277) and pinned `theme="wizly-dark"` — light scheme never
reached the editor. Here `useTokenMonacoTheme()`:

- reads palette vars **off the mounted element** (`getComputedStyle`), so scoped
  `[data-scheme]` wrappers and Atlas/Atelier's `--editor-*` family resolve in
  context;
- emits one theme (`x-editor-tokens`) whose `base` follows the active scheme;
- re-defines + re-applies it whenever `data-theme` / `data-scheme` /
  `data-subtheme` / `data-accent` changes — accent and identity switches repaint
  the live editor too;
- omits any colour it cannot parse rather than falling back to a stated hex —
  the `vs`/`vs-dark` base covers the gap.

## Props

Same surface as the kit: `value`, `onChange`, `language`, `readOnly`, `filename`,
`headerTitle`, `headerIcon`, `height`, `minHeight`, `showMinimap`,
`showLineNumbers`, `fontSize`, `engine`, `onEngineChange`, `onRun`,
`isExecuting`, `onCursorChange`, `toolbarActions`, `hideHeader`, `hideFooter`.

`fontSize` is runtime data: it reaches the custom surface as the
`--x-editor-zoom` factor over `--text-sm` and Monaco as its own numeric API.

## States

`monaco` · `custom` · `executing` · `bare` (hideHeader+hideFooter — the
workbench-embedded form used inside `Workbench`).

## Fixed violations

- `#0B0E1A`/`#F8FAFC` body + dead `[data-theme="light"]` override →
  `var(--editor-bg, var(--c-surface-inset))` (`data-theme` holds an *identity*,
  so the old light override could never match — a real bug, not just style).
- `#767DA0`/`#7C84A3` comment hexes → `x-tok-comment` = `--c-text-faint`.
- `box-shadow rgba(0,0,0,.25)` → `rgba(var(--c-shadow-rgb), .25)`.
- Engine toggle / minimap were `is-active` classes → `data-on` + `aria-pressed`.
- Font A−/A+ inline `fontSize` literals → `x-editor__font-dec/inc` token sizes;
  both buttons gate on real `disabled` + `aria-disabled` at the 11/22 bounds.
- Editor `fontFamily` was a hardcoded stack → `var(--font-mono)`.
- Spinner keyframes extracted (`x-editor-spin`), driven by `--duration-slow`.

## Surface language

- The frame carries the card accent edge (`--card-edge`); `focus-within`
  repaints the whole border to full accent — the seam itself becomes the
  focus tell.
- The language chip is a bordered accent pill (`--micro-case` caps, tracking
  token fallback) — the same chip voice the judge badge uses.
- The copy button's `data-copied` confirm reads `--c-success`, not the accent
  wash — a confirmation, not a mode.
- `x-editor__run` sets `data-running` while executing → `cursor: progress`;
  gated but alive.
- Status bar sets `--numerals` for the `Ln/Col` figures.

## Used on

- `/codelab` (inside the Workbench, `hideHeader`+`hideFooter`)
- `/challenges/:challengeId`, `/debug/:caseId`, `/projects/:projectId`,
  `/workspace` (standalone, header + footer shown)
- `/courses/:courseId/lessons/:lessonId` via SandboxCard
- Kitchen sink "Multi-Engine Code Workbench" tab
