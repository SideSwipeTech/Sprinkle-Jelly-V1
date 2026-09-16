import type { ReactNode } from "react";
import { useState } from "react";
import { ProblemPanel } from "./ProblemPanel";
import { HintLadder } from "../HintLadder/HintLadder";

const RUNGS = [
  { title: "Rung 1: Conceptual Direction", content: "Remember each element and check whether its complement was already seen." },
  { title: "Rung 2: Data Structure", content: "A Hash Map: keys are array values, values are indices." }
];

function Demo({ verdict = false, hints = true }: { verdict?: boolean; hints?: boolean }) {
  const [revealed, setRevealed] = useState(0);
  return (
    <ProblemPanel
      statement={
        <p>
          Given an array of integers <code>nums</code> and an integer <code>target</code>, return
          indices of the two numbers such that they add up to <code>target</code>. Exactly one valid
          solution exists per input fixture.
        </p>
      }
      tags={["Hash Map", "Arrays"]}
      badges={{ accent: "Easy", quiet: ["Policy: Console Default"] }}
      constraints={[
        <code key="a">2 &lt;= nums.length &lt;= 10^4</code>,
        <code key="b">-10^9 &lt;= nums[i] &lt;= 10^9</code>,
        <span key="c">Exactly one valid solution exists per input fixture.</span>
      ]}
      verdict={
        verdict
          ? { text: "Accepted on this device. The verified editorial remains available." }
          : undefined
      }
    >
      {hints ? <HintLadder rungs={RUNGS} revealed={revealed} onReveal={setRevealed} /> : null}
    </ProblemPanel>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "full",
    label: "Statement + tags + constraints + hint ladder",
    render: () => <Demo />
  },
  {
    key: "solved",
    label: "Accepted verdict banner (--c-success, no #2dd4bf)",
    render: () => <Demo verdict />
  },
  {
    key: "statement-only",
    label: "Statement only — no tags/constraints/children render",
    render: () => (
      <ProblemPanel statement={<p>Find the fault in the supplied snippet.</p>} />
    )
  }
];
