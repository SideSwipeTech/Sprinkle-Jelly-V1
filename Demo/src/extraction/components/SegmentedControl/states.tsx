/**
 * SegmentedControl state matrix for the Kitchen Sink.
 */
import { useState, type ReactNode } from "react";
import { SegmentedControl } from "./SegmentedControl";

function TwoOptionDemo() {
  const [v, setV] = useState("companion");
  return (
    <SegmentedControl
      label="Companion presentation"
      value={v}
      onChange={setV}
      options={[
        { id: "companion", label: "The companion" },
        { id: "plain", label: "Plain messages" }
      ]}
    />
  );
}

function ThreeOptionDemo() {
  const [v, setV] = useState("present");
  return (
    <SegmentedControl
      label="Companion volume"
      value={v}
      onChange={setV}
      options={[
        { id: "present", label: "Present" },
        { id: "quiet", label: "Quiet" },
        { id: "off", label: "Off", disabled: true }
      ]}
    />
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "two", label: "Two options, first selected", render: () => <TwoOptionDemo /> },
  { key: "three-disabled", label: "Three options, one disabled", render: () => <ThreeOptionDemo /> },
  {
    key: "icons",
    label: "With icons",
    render: () => (
      <SegmentedControl
        label="View"
        value="grid"
        onChange={() => {}}
        options={[
          { id: "list", label: "List", icon: "list" },
          { id: "grid", label: "Grid", icon: "grid" }
        ]}
      />
    )
  }
];
