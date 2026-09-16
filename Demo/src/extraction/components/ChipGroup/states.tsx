/**
 * ChipGroup state matrix for the Kitchen Sink.
 */
import { useState, type ReactNode } from "react";
import { ChipGroup } from "./ChipGroup";

function TrackDemo() {
  const [track, setTrack] = useState<string | null>("All");
  return (
    <ChipGroup
      label="Track"
      value={track}
      onChange={setTrack}
      options={["All", "Python", "TypeScript", "Go", "Rust"].map((t) => ({ id: t, label: t }))}
    />
  );
}

function QuietDemo() {
  const [d, setD] = useState<string | null>("Easy");
  return (
    <ChipGroup
      label="Difficulty"
      variant="quiet"
      value={d}
      onChange={setD}
      options={["Easy", "Medium", "Hard"].map((t) => ({ id: t, label: t }))}
    />
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "default", label: "Labelled single-select row", render: () => <TrackDemo /> },
  { key: "quiet", label: "Quiet variant", render: () => <QuietDemo /> },
  {
    key: "hidden-label",
    label: "Accessible name without visible prefix",
    render: () => (
      <ChipGroup
        label="Status"
        hideLabel
        value="New"
        onChange={() => {}}
        options={["All", "New", "Attempted", "Solved"].map((t) => ({ id: t, label: t }))}
      />
    )
  },
  {
    key: "disabled-option",
    label: "Option disabled",
    render: () => (
      <ChipGroup
        label="Level"
        value="Beginner"
        onChange={() => {}}
        options={[
          { id: "Beginner", label: "Beginner" },
          { id: "Advanced", label: "Advanced", disabled: true }
        ]}
      />
    )
  }
];
