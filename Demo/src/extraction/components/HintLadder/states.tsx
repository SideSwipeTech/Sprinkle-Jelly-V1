import type { ReactNode } from "react";
import { useState } from "react";
import { HintLadder, type HintRung } from "./HintLadder";

const RUNGS: HintRung[] = [
  {
    title: "Rung 1: Conceptual Direction",
    content: "Instead of comparing all pairs in O(N^2), can we remember each element as we iterate and check if its complement has already been seen in O(1) time?"
  },
  {
    title: "Rung 2: Algorithmic Invariant & Data Structure",
    content: "Use a Hash Map where keys are array values and values are their indices. For each index i and value x, compute diff = target - x. Check if diff is in the map."
  },
  {
    title: "Rung 3: Structural Pseudocode & Edge Cases",
    content: "seen = {}\nfor i, n in enumerate(nums):\n    diff = target - n\n    if diff in seen:\n        return [seen[diff], i]\n    seen[n] = i\nreturn []"
  }
];

function Demo({ start }: { start: number }) {
  const [revealed, setRevealed] = useState(start);
  return <HintLadder rungs={RUNGS} revealed={revealed} onReveal={setRevealed} />;
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "sealed",
    label: "0/3 — honest note, no empty box",
    render: () => <Demo start={0} />
  },
  {
    key: "partial",
    label: "1/3 — first rung revealed, next offered",
    render: () => <Demo start={1} />
  },
  {
    key: "exhausted",
    label: "3/3 — all rungs, reveal affordance gone",
    render: () => <Demo start={3} />
  }
];
