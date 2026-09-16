import type { ReactNode } from "react";
import { OutlineList, OutlineRow } from "./OutlineRow";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "list",
    label: "Curriculum outline — done/current/pending",
    render: () => (
      <OutlineList label="Course outline">
        <OutlineRow n={1} to="#" done title="Variables and assignment" meta="8 min · Interactive lesson" />
        <OutlineRow n={2} to="#" title="Scope and the LEGB rule" meta="10 min · Interactive lesson" />
        <OutlineRow n={3} to="#" title="Closures that keep their frame" meta="12 min · Interactive lesson" />
      </OutlineList>
    )
  },
  {
    key: "row-done",
    label: "Done row — edge + check tell",
    render: () => (
      <OutlineList>
        <OutlineRow n={4} done title="Closures" meta="12 min" />
      </OutlineList>
    )
  },
  {
    key: "row-static",
    label: "Non-interactive row",
    render: () => (
      <OutlineList>
        <OutlineRow n={1} title="Locked until earlier items are done" meta="10 min" />
      </OutlineList>
    )
  }
];
