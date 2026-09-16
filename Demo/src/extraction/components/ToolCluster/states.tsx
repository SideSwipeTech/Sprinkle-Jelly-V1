import { useState, type ReactNode } from "react";
import { ToolCluster } from "./ToolCluster";

function DeclaredTools() {
  const [readout, setReadout] = useState("Selected item: Foundations of Python.");
  return (
    <ToolCluster
      label="Declared tools"
      readout={readout}
    >
      <button type="button" className="x-btn x-btn--secondary" onClick={() => setReadout("Move recorded. Archived containers are refused.")}>move</button>
      <button type="button" className="x-btn x-btn--secondary" onClick={() => setReadout("Lesson reorder recorded.")}>reorder</button>
      <button type="button" className="x-btn x-btn--secondary" onClick={() => setReadout("Draft copy created with no learner-facing trace.")}>duplicate</button>
      <button type="button" className="x-btn x-btn--secondary" onClick={() => setReadout("Revision restored into the draft, never live content.")}>restore</button>
      <button type="button" className="x-btn x-btn--quiet" onClick={() => setReadout("Preview opens the learner surface.")}>preview</button>
    </ToolCluster>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "declared-tools", label: "Declared tools + live readout", render: () => <DeclaredTools /> },
  {
    key: "no-readout",
    label: "Tools only",
    render: () => (
      <ToolCluster label="Certificate actions">
        <button type="button" className="x-btn x-btn--secondary">Correct display name</button>
        <button type="button" className="x-btn x-btn--secondary">Reissue document</button>
        <button type="button" className="x-btn x-btn--quiet">Record revocation</button>
      </ToolCluster>
    )
  }
];
