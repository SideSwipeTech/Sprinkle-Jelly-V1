# ReviewItemCard

One question's outcome inside the question-by-question review: verdict header
(item number + correct/incorrect + icon), the prompt, and an inset remediation
block.

## Props

- `index: number` — rendered as "Item n"
- `correct: boolean` — drives `data-verdict="correct|incorrect"`
- `prompt: ReactNode`
- `remediation?: ReactNode` — omit to hide the inset
- `credit?: string` — trailing meta ("+10 XP" / "0 XP")

## Non-colour tells

`✓`/`✕` icon + the words Correct/Incorrect + a thicker left edge in the verdict
tone — the colour is reinforcement, never the only carrier.

## Used on

- `/mock/:paperId/result` — MockResult "Question-by-Question Review" list
