# Companion (corner trio)

`CompanionCorner` (fixed host + `data-presence`), `CompanionTrigger` (character host or
plain pill), `CompanionMoment` (the one passing message), `CompanionPanel` (page guide
+ the door), `DoorResult` (the three answer states).

Source: `src/companion/Companion.tsx:40-254`, `src/companion/companion.css`.
Presentational only — the stream (`stream.ts`), guide registry (`guide.ts`) and
knowledge gate (`knowledge.ts`) stay with the caller; this file draws what it is handed.

## Props

### `CompanionCorner`
`presence` (`present|quiet|suppressed` — suppressed renders nothing, AST-R9) ·
`name` · `presentation` (`companion|plain`) · `children` (moment/panel/trigger).

### `CompanionTrigger`
`presentation` · `name` · `open` (`aria-expanded`) · `onToggle` · `rig`
(`CompanionRigAdapter | null`) · `reducedMotion`.

### `CompanionMoment`
`tone` (5) · `cls` (5 display classes — `success` is a class, never a tone) · `fact` ·
`flourish` · `waiting` · `sticks` (→ `role="alert"`/`assertive`) · `dismissable` ·
`onDismiss` · `onPause`/`onResume` (focus inside pauses the auto-dismiss, AST-R3).

### `CompanionPanel`
`name` · `item: {kind: greeting|tip|hint, text}` · `index`/`total` (guide position) ·
`onNext` · `chips: string[]` · `onAsk(text)` · `result: DoorResultData` ·
`onRetryResult` · `onClose`. The ask input is internal state; `onAsk` receives text.

### `DoorResult`
`result`: `{kind:"guidance", text, to?, toLabel?}` · `{kind:"answer", title, body}` ·
`{kind:"no-match", topics[], requestTo?}` · `{kind:"unavailable"}`; `onRetry`.

## The opaque rig adapter (`CompanionRigAdapter`)

Sparky stays opaque — `sparky/*.js` is never imported or rewritten. The adapter the
caller supplies:

```ts
interface CompanionRigAdapter {
  mount(host: HTMLElement): void;   // append rig.el, start engine, enter()
  destroy(): void;                  // eng.destroy() + rig.el.remove()
  setSize(px: number): void;        // rig.setSize — compact band drives this
  setReducedMotion(v: boolean | null): void;
  setExpression(name: string): void; // composing layer: moment/open → expression
  react(kind: string): void;         // "celebrate" | "warning" | …
  play(gesture: string): void;       // "blink" | "nod" | …
}
```

Demo wiring (~10 lines, lives in `src/companion/`): `mount` → `createSparky({size})` +
`new SparkyEngine(rig, {reducedMotion}).start()` + `eng.enter()`; `destroy` →
`eng.destroy(); rig.el.remove()`; the rest delegate. Expression mapping (moment →
celebrate/warning/serious/success/expression, open → attentive) is the composer's job.

## States

- `data-presence` — `present` / `quiet` (rig shadow off via the `--sp-shadow` seam) /
  `suppressed` (renders nothing).
- `data-tone` on a moment — drives `--companion-tone`: neutral→text-faint,
  informational→info, encouraging→accent-secondary, warning→warning, serious→error;
  `data-cls="success"` overrides to `--c-success`. The border-left tell carries tone
  by position, not colour alone.
- `data-kind` on guide items — `hint` is muted with an accent icon.
- Door states converge on kit `StateBlock`: no-match → `state="empty"` + request link;
  unavailable → `state="unavailable"` + retry. Guidance/answer stay plain answers.

## Decisions / notes

- `COMPACT` literal (`Companion.tsx:38`) fixed: the media query is built from
  `VALUES.bands` (`compact.max` = 599) — the band table owns the number.
- Rig px sizes (96/72) are canvas metrics for the opaque factory, exported as
  `COMPANION_RIG_SIZE` — named constants, not CSS literals.
- **Duplication noted:** `sparky/sparky.css` has a hardcoded hex `data-tone` table
  (`#22E07A`, `#FFB020`, `#FF4D45`…) while `companion.css` retinted success/warning/
  error through the status tokens via `--sp-led`. The token-derived mapping wins here
  (kept, now also mixing `*-soft` against `--c-surface` instead of `white`); the rig's
  own table is the adapter's internals — flag for the platform pass: the rig should
  ship token defaults so the two tone systems cannot drift.
- Sibling classes referenced, not styled: `x-icon-btn` (states/), `x-btn`, `x-chip`
  (controls/).
- Component tokens: `--x-companion-edge` clamp(10px,2vw,24px) · `--x-companion-panel-w`
  340px · `--x-companion-tell` 3px · `--x-companion-tone-size` 28px ·
  `--x-companion-tone-offset` 1px · `--x-companion-dismiss` 30px ·
  `--x-companion-ask-h` 36px · `--x-companion-words-gap` 2px.

## Used on

Every learner route — the frame hosts the corner (`AppFrame`'s `companion` slot);
suppressed on sealed sittings (`/mock/:id/sitting`, `/company/:id/sitting`), quiet on
solve surfaces (`/challenges/:id`, `/codelab`, `/projects/:id`, `/debug/:id`,
`/daily/solve`).
