/**
 * Chip state matrix for the Kitchen Sink.
 */
import { useState, type ReactNode } from "react";
import { Chip } from "./Chip";

function ToggleDemo() {
  const [on, setOn] = useState(false);
  return <Chip selected={on} onClick={() => setOn((v) => !v)}>Toggle me</Chip>;
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "tag",
    label: "Static tag (span)",
    render: () => <Chip>14 lessons</Chip>
  },
  {
    key: "toggle-off",
    label: "Toggle, off",
    render: () => <ToggleDemo />
  },
  {
    key: "toggle-on",
    label: "Toggle, on (data-on + aria-pressed)",
    render: () => <Chip selected onClick={() => {}}>Python</Chip>
  },
  {
    key: "quiet",
    label: "Quiet — metadata pill",
    render: () => <Chip variant="quiet">45 minutes</Chip>
  },
  {
    key: "quiet-on",
    label: "Quiet, on",
    render: () => <Chip variant="quiet" selected onClick={() => {}}>arrays</Chip>
  },
  {
    key: "accent",
    label: "Accent — tinted tag",
    render: () => <Chip variant="accent">Medium</Chip>
  },
  {
    key: "sm",
    label: "Small — dense rows",
    render: () => <Chip size="sm" variant="quiet">Console</Chip>
  },
  {
    key: "icon",
    label: "With icon",
    render: () => <Chip icon="check" selected onClick={() => {}}>Solved</Chip>
  },
  {
    key: "disabled",
    label: "Disabled toggle",
    render: () => <Chip disabled onClick={() => {}}>Locked</Chip>
  }
];
