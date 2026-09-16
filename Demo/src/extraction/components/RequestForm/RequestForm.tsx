/**
 * RequestForm — the topic-request form.
 *
 * Extracted from Account.tsx:591-602 + app.css:227-234 (`.request-form`):
 * a topic field and a description textarea spanning the grid, an area select
 * and a gated submit on the last row, and a role=status feedback line. The form
 * owns its draft; the page owns persistence through `onSubmit`.
 */

import { useId, useState, type FormEvent } from "react";
import "./RequestForm.css";

export interface RequestDraft {
  title: string;
  description: string;
  area: string;
}

export interface RequestFormProps {
  areas: string[];
  onSubmit: (draft: RequestDraft) => void;
  /** Minimum topic length before submit unlocks (demo: 3). */
  minTitleLength?: number;
  submitLabel?: string;
  /** Feedback line — announced with role=status (was .form-message). */
  feedback?: string;
}

export function RequestForm({ areas, onSubmit, minTitleLength = 3, submitLabel = "Submit request", feedback }: RequestFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState(areas[0] ?? "");
  const ready = title.trim().length >= minTitleLength;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    onSubmit({ title: title.trim(), description: description.trim(), area });
    setTitle("");
    setDescription("");
  }

  return (
    <form className="x-request-form" onSubmit={submit}>
      <div className="x-field x-request-form__span">
        <label className="x-field__label" htmlFor={`${uid}-topic`}>Topic</label>
        <input id={`${uid}-topic`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Raft consensus in Go" />
      </div>
      <div className="x-field x-request-form__span">
        <label className="x-field__label" htmlFor={`${uid}-desc`}>What should the material help you learn?</label>
        <textarea id={`${uid}-desc`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the concepts or practice outcome…" />
      </div>
      <div className="x-field x-request-form__area">
        <label className="x-field__label" htmlFor={`${uid}-area`}>Area</label>
        <select id={`${uid}-area`} value={area} onChange={(e) => setArea(e.target.value)}>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <button type="submit" className="x-btn x-btn--primary x-request-form__submit" disabled={!ready}>
        {submitLabel}
      </button>
      {feedback ? <p className="x-request-form__feedback" role="status">{feedback}</p> : null}
    </form>
  );
}
