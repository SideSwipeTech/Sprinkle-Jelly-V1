# AchievementTile

One catalogue achievement — seal plate, title, detail, status line.

## Props

- `title`, `detail`
- `unlocked: boolean` — drives `data-locked` (present when locked). The locked
  state is a real visual difference: dashed border, recessed ground, lock glyph
  in place of the icon, faint status — not just the words "Not yet".
- `icon?: IconName` — the seal glyph when unlocked (default "trophy")
- `statusText?: string` — e.g. "Unlocked on 16 Aug"

## Non-colour tells

Lock icon + dashed border + the status word for locked; check + word for
unlocked.

## Composes

Kit `Card`, `Icon` (plate treatment).

## Used on

- `/achievements` — AchievementsPage grid
