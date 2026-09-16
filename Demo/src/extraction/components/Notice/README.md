# Notice

The tonal callout — one component consolidating six hand-rolled variants that
all said "a box with a sentence and a colour".

## Sources consolidated

| Source | Was | Becomes |
|---|---|---|
| `Learn.tsx:332-336` | KEY TAKEAWAY — accent tint + border | `tone="info" title="Key takeaway"` |
| `Learn.tsx:339-342` | `[NOTE]` — teal left bar, `rgba(45,212,191,.08)` | `tone="info" title="Note" compact` |
| `Learn.tsx:521-528` | quiz feedback — teal/rose literals by verdict | `tone="success"\|"error" live="polite"` |
| `app.css:207` `.settings-note` | plain inset panel | `tone="neutral"` |
| `app.css:231` `.form-message` | success tint, hand-set `role="status"` | `tone="success" live="polite"` |
| `KitchenSink.tsx:645-659` | interceptor banners, DEGRADED/SEALED chips | `tone="warning"\|"error" live="assertive" action=…` |

## Tones (`data-tone`)

| Tone | Tell | Icon |
|---|---|---|
| `neutral` | quiet inset panel, **no border** — restraint is the tell | sticky-note |
| `info` | **inline-start accent bar** — points, doesn't surround | info |
| `success` | solid tinted frame | check |
| `warning` | **dashed** tinted frame — attention, not emergency | alert |
| `error` | solid frame + **-45° barrier hatch** (StateBlock[refused] language) | error |

## Props

- `tone` — `neutral | info | success | warning | error` (default `neutral`).
- `title` — micro label above the body ("Key takeaway", "Note", "Maintenance").
- `icon` — Keyline override; `null` hides the mark (border treatment still tells).
- `action` — trailing slot: status chips, dismiss controls, links. The
  interceptor pattern pairs it with `<span class="x-status-text x-status-text--solid" data-tone="…">`.
- `live` — `off` (default) | `polite` → `role="status"` | `assertive` → `role="alert"`.
- `compact` — tighter padding for dense surfaces.

## States

`data-tone` on the root · `live` drives `role` · `compact` modifier.

## Used on

- `/courses/:courseId/lessons/:lessonId` — key takeaway + sandbox note callouts
- `/courses/:courseId/quiz` — per-item feedback (success/error, polite)
- `/settings` — "changes apply to new items only" and sibling notes
- `/requests`, `/admin/*` forms — submission confirmations (form-message → success, polite)
- `/mock/:paperId` briefing — sealed-sitting constraint banner (error, assertive)
- Kitchen Sink `/element-lab` — maintenance interceptor banners

## Notes

- A `role` on a static first-paint notice over-announces; `live` defaults `off`
  deliberately — the live tones are for notices injected *after* paint.
