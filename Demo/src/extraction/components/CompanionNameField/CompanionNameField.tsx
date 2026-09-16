/**
 * CompanionNameField — the learner's own name for their companion (AST-R34).
 *
 * Extracted from Account.tsx:746-777. A draft/validation field inside a
 * PreferenceRow: 2–32 displayed characters, control characters and `<>`
 * stripped, a reserved-label list, Reset restoring the platform default.
 * Validation notes arrive via role=status — the field never silently refuses.
 */

import { useEffect, useId, useState } from "react";
import "./CompanionNameField.css";

const RESERVED = /^(staff|admin|administrator|wizly|wizly labs|instructor|support)$/i;

export interface CompanionNameFieldProps {
  /** The stored name; "" means the default is in effect. */
  value: string;
  /** The platform default (AST-DR-02 fixes it at "WizBit"). */
  defaultName?: string;
  onSave: (name: string) => void;
  onReset: () => void;
  /** Extra reserved labels beyond the canned platform list. */
  reserved?: RegExp;
}

export function CompanionNameField({ value, defaultName = "WizBit", onSave, onReset, reserved }: CompanionNameFieldProps) {
  const [draft, setDraft] = useState(value);
  const [note, setNote] = useState<string | null>(null);
  const inputId = useId();
  useEffect(() => { setDraft(value); }, [value]);

  const shown = value.trim() || defaultName;
  const dirty = draft.trim() !== value.trim();

  function save() {
    const trimmed = Array.from(draft)
      .filter((ch) => { const c = ch.charCodeAt(0); return c >= 32 && c !== 127 && ch !== "<" && ch !== ">"; })
      .join("")
      .trim();
    const length = Array.from(trimmed).length;
    if (length === 0) { setNote(`An empty name is not saved — ${shown} stays.`); setDraft(value); return; }
    if (length < 2 || length > 32) { setNote(`A name is 2 to 32 characters. ${shown} stays.`); return; }
    if (RESERVED.test(trimmed) || reserved?.test(trimmed)) { setNote(`That label is reserved. ${shown} stays.`); return; }
    onSave(trimmed);
    setNote(null);
  }

  return (
    <div className="x-preference-row x-companion-name">
      <div className="x-companion-name__text">
        <strong>Name</strong>
        <p className="x-companion-name__hint">
          Shown wherever the companion is drawn. Changes the name only — never the
          artwork, the expressions or what it does. Currently <b>{shown}</b>.
        </p>
        {note ? <p className="x-companion-name__note" role="status">{note}</p> : null}
      </div>
      <div className="x-companion-name__controls">
        <div className="x-field x-companion-name__field">
          <label className="x-field__label" htmlFor={inputId}>Companion name</label>
          <input
            id={inputId}
            value={draft}
            maxLength={40}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); save(); } }}
            placeholder={defaultName}
          />
        </div>
        <button type="button" className="x-btn x-btn--secondary" onClick={save} disabled={!dirty}>
          Save
        </button>
        <button
          type="button"
          className="x-btn x-btn--quiet"
          onClick={() => { onReset(); setDraft(""); setNote(null); }}
          disabled={!value}
        >
          Reset to {defaultName}
        </button>
      </div>
    </div>
  );
}
