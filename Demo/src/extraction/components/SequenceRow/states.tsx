import type { ReactNode } from "react";
import { SequenceRow } from "./SequenceRow";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "sequence",
    label: "Curriculum sequence — solved + pending",
    render: () => (
      <div className="x-list" role="list">
        <SequenceRow n={1} to="#" done doneLabel="Solved" title="Two Sum" meta="Easy · Arrays" />
        <SequenceRow n={2} to="#" done doneLabel="Solved" title="Balanced Brackets" meta="Easy · Stacks" />
        <SequenceRow n={3} to="#" title="LRU Cache" meta="Hard · Design" />
      </div>
    )
  },
  {
    key: "row-pending",
    label: "Pending row — chevron affordance",
    render: () => <SequenceRow n={4} to="#" title="Median of Two Sorted Arrays" meta="Hard · Binary search" />
  },
  {
    key: "row-static",
    label: "Non-interactive row",
    render: () => <SequenceRow n={1} title="Read-only position" meta="Medium" />
  }
];
