# ExamFlagRow

One exam-experience flag (MCK-R42) on the preflight panel — flag name, optional
hint, status chip.

## Props

- `name: string`
- `hint?: string` — the flag's purpose (the demo held this text unrendered; now
  it can surface).
- `on: boolean` — `data-on` + check/minus icon + "Active"/"Off" word.

## Composes

`x-chip` (controls/Chip) for the status, toned under the row's own scope —
the state is never colour-only.

## Used on

- `/mock/:paperId` — MockBriefing "Exam Experience Flags" card
