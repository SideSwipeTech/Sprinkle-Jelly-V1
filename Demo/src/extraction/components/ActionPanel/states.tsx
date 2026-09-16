import { useState, type ReactNode } from "react";
import { ActionPanel } from "./ActionPanel";

function RevokeDemo() {
  const [reason, setReason] = useState("");
  const [outcome, setOutcome] = useState("");
  return (
    <ActionPanel
      eyebrow="Issuer revocation"
      lead="Makes the public check non-disclosing. This does not erase the awarding event."
      outcome={outcome || undefined}
    >
      <div className="x-field">
        <label className="x-field__label" htmlFor="ap-reason">Reason</label>
        <input id="ap-reason" value={reason} onChange={(e) => { setReason(e.target.value); setOutcome(""); }} placeholder="Required audit reason" />
      </div>
      <div className="row">
        <button
          type="button"
          className="x-btn x-btn--primary"
          disabled={reason.trim().length < 4}
          onClick={() => setOutcome("Issuer revocation recorded.")}
        >
          Confirm revoke
        </button>
        <button type="button" className="x-btn x-btn--quiet">Cancel</button>
      </div>
    </ActionPanel>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "revoke", label: "Staged action — gated confirm + outcome", render: () => <RevokeDemo /> },
  {
    key: "plain",
    label: "Panel frame only",
    render: () => (
      <ActionPanel eyebrow="Document reissue" lead="Replaces exactly one certificate document. Validity remains unchanged.">
        <div className="row">
          <button type="button" className="x-btn x-btn--primary">Confirm reissue</button>
          <button type="button" className="x-btn x-btn--quiet">Cancel</button>
        </div>
      </ActionPanel>
    )
  }
];
