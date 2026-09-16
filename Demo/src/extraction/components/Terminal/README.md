# Terminal

The run-output dock: Output Console / Test Results / Verdict·Judge views, the
executing spinner, pass/fail test-case cards, and the judge box. Canonicalises
the kit `Terminal` (`pro-terminal`) — mostly a clean adoption.

## Props

| Prop | Type | Notes |
|---|---|---|
| `output` | `string \| null` | `null` renders an `empty` StateBlock (honest absence) |
| `isExecuting` | `boolean` | swaps the body for the `role="status"` spinner; gates Run/Clear |
| `statusText` | `string` | overrides the executing line |
| `command` | `string` | echoed at a `$` prompt above the output — real consoles show what ran |
| `statusLine` | `{tone: "pass"\|"fail"\|"info", text}` | verdict receipt under the output — icon + tone + dashed hairline, `role="status"` |
| `onClear` | `() => void` | shows the Clear action |
| `onRun` | `() => void` | shows the accent Run action |
| `testCases` | `TerminalTestCase[]` | enables the Tests view (`{name, passed, durationMs?, expected?, actual?, details?}`) |
| `label` | `string` | accessible name (default "Run output") |
| `initialTab` | `"output" \| "tests" \| "judge"` | sink demos land without a click |

## States

`output` · `executing` · `empty` · `failing-tests` (diff card) · `judge`

## Fixed violations

- `is-active` class tabs → real `tablist`/`tab`/`tabpanel` semantics,
  `aria-selected`, roving `tabIndex`, Arrow-key movement; the active tab also
  carries the accent underline seam, not just a tint.
- `is-pass`/`is-fail` classes → `data-verdict` on the case card; verdict carries
  a circled icon + accent-edge + surface wash so it's never colour-only.
- The dock frame and the judge panel carry the card family's accent edge
  (`--card-edge`); the judge badge is a real bordered chip now, and case times
  / status lines set `--numerals`.
- Indicator dots are `aria-hidden` — meaning is in labels and counts.
- `is-executing` region → `role="status"`; spinner keyframes extracted
  (`x-terminal-spin`), `--duration-slow`, disabled under reduced-motion.
- Reads `--terminal-bg/-fg/-muted` where the family provides them (Atlas's
  graphite terminal world), `--c-*` elsewhere.

## Used on

- `/codelab` (Workbench output dock)
- `/challenges/:challengeId`, `/debug/:caseId`, `/projects/:projectId`
- Kitchen sink workbench demo
