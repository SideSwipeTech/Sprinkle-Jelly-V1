import { useState, type ReactNode } from "react";
import { PreferenceRow } from "./PreferenceRow";

function CheckboxDemo() {
  const [on, setOn] = useState(true);
  return (
    <PreferenceRow
      asLabel
      title="Motion cues"
      hint="Entrances and transitions celebrate progress. Turning this off stops decorative motion."
      control={<input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} />}
      note={on ? undefined : "Motion cues are off."}
    />
  );
}

function ControlDemo() {
  const [mode, setMode] = useState("guided");
  return (
    <PreferenceRow
      title="Companion presence"
      hint="Where the companion is allowed to appear."
      control={
        <div className="x-segmented" role="group" aria-label="Companion presence">
          {["guided", "quiet", "off"].map((m) => (
            <button key={m} type="button" className="x-segmented__option" data-on={mode === m || undefined} aria-pressed={mode === m} onClick={() => setMode(m)}>
              {m}
            </button>
          ))}
        </div>
      }
    />
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "checkbox", label: "Checkbox row (asLabel)", render: () => <CheckboxDemo /> },
  { key: "control", label: "Control row (segmented)", render: () => <ControlDemo /> }
];
