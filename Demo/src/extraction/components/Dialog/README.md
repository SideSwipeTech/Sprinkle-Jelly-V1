# Dialog

The modal primitive. Replaces `window.confirm`, `window.prompt`, and `alert()` (contract §7) —
no extracted component may call the native crutches.

## Anatomy

`x-dialog` (fixed layer, `--z-modal`) → `x-dialog__scrim` (button, click = cancel) +
`x-dialog__panel` (`role="dialog"`, `aria-modal="true"`, `aria-labelledby` = title,
`aria-describedby` = body). Focus moves in on open, `Tab` cycles inside the panel,
`Escape` cancels, focus restores to the opener on close.

## Exports

| Export | Replaces | Notes |
|---|---|---|
| `Dialog` (`./Dialog`) | — | Base primitive. `title`, `icon`, `actions`, `tone`, `persistent`, `role` |
| `ConfirmDialog` (`./Dialog.variants`) | `window.confirm` | `destructive` marks the confirm `data-variant="destructive"` |
| `PromptDialog` (`./Dialog.variants`) | `window.prompt` | `fieldLabel` + input; submit disabled until non-empty |
| `AlertDialog` (`./Dialog.variants`) | `alert()` | `role="alertdialog"`, single acknowledge action |
| `TypedConfirmDialog` (`./Dialog.variants`) | admin typed-echo delete | `confirmText` must be echoed exactly; mismatch keeps action disabled |

## Props (base `Dialog`)

- `open` — closed renders `null` (honest absence). Consumers may also mount conditionally.
- `persistent` — removes Escape + scrim-click exits; the close button is not rendered.
- `tone: "default" | "destructive"` — destructive retints border/icon via `data-tone`, never colour alone.
- `role: "dialog" | "alertdialog"`.

## States

`closed` (trigger only) · `confirm` · `confirm-destructive` · `prompt` · `alert` ·
`typed-confirm` (locked; echo to unlock) · `persistent`.

## Notes

- Action buttons are `x-btn x-btn--<variant>` — controls/Button's classes (contract §6:
  siblings referenced by class, not imported). Disabled rides `data-disabled` + real
  `disabled`/`aria-disabled`.
- Scrim is a translucent `--c-shadow-rgb` wash; no backdrop blur (a `--scrim-blur` token
  was considered but does not exist — see report).
- `persistent` swaps the scrim `<button>` for an inert `div` — a button that does
  nothing is a lie.

## Used on

- `/projects/:id`, `/workspace`, `/practice/*` — file delete confirm, new-file prompt
  (was `FileExplorer.tsx:91` `window.confirm`, `Practice.tsx:1103` `window.prompt`).
- `/admin/*` — staged-value alert (was `AdminPages.tsx:1228` `alert()`), typed-echo
  permanent delete (`AdminPages.tsx:164-169`).
- Everywhere a confirm/prompt/alert is needed — the shared primitive other families rely on.
