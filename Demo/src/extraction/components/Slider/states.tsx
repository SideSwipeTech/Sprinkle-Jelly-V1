/**
 * Slider state matrix for the Kitchen Sink.
 */
import { useState, type ReactNode } from "react";
import { Slider } from "./Slider";

function WeeklyDemo() {
  const [n, setN] = useState(5);
  return (
    <Slider
      label="Target problems per week"
      value={n}
      onChange={setN}
      min={1}
      max={20}
      formatValue={(v: number) => `${v} / week`}
      aside={<span className="x-chip x-chip--quiet x-chip--sm">3 completed this week</span>}
    />
  );
}

function HoursDemo() {
  const [n, setN] = useState(4);
  return (
    <Slider
      label="Target active time"
      value={n}
      onChange={setN}
      min={1}
      max={15}
      formatValue={(v: number) => `${v} hrs`}
      hint="Goals keep a rhythm; nothing is locked or penalized if missed."
      valueText={`${n} hours per week`}
    />
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "default", label: "Weekly target (with aside chip)", render: () => <WeeklyDemo /> },
  { key: "hint", label: "With hint + aria-valuetext", render: () => <HoursDemo /> },
  {
    key: "min",
    label: "At minimum",
    render: () => <Slider label="Volume" value={0} min={0} max={10} onChange={() => {}} />
  },
  {
    key: "max",
    label: "At maximum",
    render: () => <Slider label="Volume" value={10} min={0} max={10} onChange={() => {}} />
  },
  {
    key: "disabled",
    label: "Disabled",
    render: () => <Slider label="Target problems" value={8} min={1} max={20} disabled onChange={() => {}} />
  }
];
