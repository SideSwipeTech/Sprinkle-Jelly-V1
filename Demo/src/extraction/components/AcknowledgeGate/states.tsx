/**
 * AcknowledgeGate state matrix for the Kitchen Sink.
 * The gated action below is the sibling Button (x-btn classes are Button's own).
 */
import { useState, type ReactNode } from "react";
import { AcknowledgeGate } from "./AcknowledgeGate";
import { Button } from "../Button/Button";

function BriefingDemo() {
  const [ok, setOk] = useState(false);
  return (
    <AcknowledgeGate
      checked={ok}
      onChange={setOk}
      label="I acknowledge the test rules and commit to personal integrity."
      hint="The timer starts when you begin; answers save to this device."
    >
      {(acknowledged: boolean) => (
        <div className="row">
          <Button to="/mock/demo/sitting" disabled={!acknowledged}>Start Sealed Sitting Now →</Button>
          <Button to="/assessments/browse" variant="secondary">Browse Others</Button>
        </div>
      )}
    </AcknowledgeGate>
  );
}

function CheckedDemo() {
  const [ok, setOk] = useState(true);
  return (
    <AcknowledgeGate
      checked={ok}
      onChange={setOk}
      label="I confirm I am ready to begin the private timed sitting."
    >
      {(acknowledged: boolean) => (
        <Button disabled={!acknowledged}>Start Company Sitting Now →</Button>
      )}
    </AcknowledgeGate>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "unchecked", label: "Unchecked — action gated off (toggle the box)", render: () => <BriefingDemo /> },
  { key: "checked", label: "Checked — action enabled", render: () => <CheckedDemo /> },
  {
    key: "no-hint",
    label: "No hint",
    render: () => (
      <AcknowledgeGate
        checked={false}
        onChange={() => {}}
        label="I acknowledge the estimate may be uncomputable."
      >
        {(acknowledged: boolean) => <Button disabled={!acknowledged}>Send</Button>}
      </AcknowledgeGate>
    )
  }
];
