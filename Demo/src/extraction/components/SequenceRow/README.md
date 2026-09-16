# SequenceRow

The carded, mono-prefixed progression row — "01 Two Sum … ✓ Solved".

## Props

- `n: number` — rendered padded ("01")
- `to?: string` — link target; omit for a static row
- `done?: boolean`, `doneLabel?: string` — the done chip (default "Done";
  Practice uses "Solved")
- `title`, `meta?: ReactNode`

## Composes

`x-list-row` (containers/ListRow) for the frame; `x-chip` (controls/Chip) for the
done chip, toned to `--c-success` under this row's scope with a check icon + word.

## Legacy violations fixed

`rgba(45,212,191,.15)` + `#2dd4bf` "✓ Solved" chip → `data-done` + token chip +
icon tell. Inline `width:"24px"` prefix → `--space-6`.

## Used on

- `/tracks/:trackId` — TrackDetail "Curriculum Sequence"
