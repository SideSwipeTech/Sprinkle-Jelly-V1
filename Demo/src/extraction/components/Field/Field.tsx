/**
 * Field — the labelled form control. Label, control, optional hint, optional error.
 *
 * Replaces `.field` (app.css:121-136): the demo styled `label > input|select|textarea`
 * descendants and left labelling to implicit wrapping. This version still styles the
 * control structurally, but the wiring is explicit: the child control is cloned with a
 * real `id`, `aria-describedby` (hint + error), `aria-invalid`, `required` and
 * `disabled`, so a `<label htmlFor>` names it properly and the error is announced.
 *
 * One control per field. Pass `<input>`, `<textarea>`, a sibling `Select` (it forwards
 * props to its `<select>`), or any single element that accepts those attributes.
 */

import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode
} from "react";
import "./Field.css";

export interface FieldProps {
  /** The control's visible name. Rendered as a real <label htmlFor>. */
  label: ReactNode;
  /** Exactly one control child — input, textarea, Select, or compatible element. */
  children: ReactElement;
  /** Supporting line under the control, referenced by aria-describedby. */
  hint?: ReactNode;
  /** Validation message. Sets aria-invalid + data-invalid and announces via role=alert. */
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Override the generated control id (e.g. when the caller already has one). */
  controlId?: string;
  className?: string;
}

export function Field({
  label,
  children,
  hint,
  error,
  required,
  disabled,
  controlId,
  className = ""
}: FieldProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = controlId ?? `x-field-${uid}`;
  const hintId = `x-field-hint-${uid}`;
  const errorId = `x-field-error-${uid}`;

  const describedBy =
    [hint ? hintId : null, error ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id,
        "aria-describedby": [
          (children.props as Record<string, unknown>)["aria-describedby"],
          describedBy
        ]
          .filter(Boolean)
          .join(" ") || undefined,
        "aria-invalid": error ? true : ((children.props as Record<string, unknown>)["aria-invalid"] ?? undefined),
        required: required || ((children.props as Record<string, unknown>).required as boolean | undefined),
        disabled: disabled || ((children.props as Record<string, unknown>).disabled as boolean | undefined)
      })
    : children;

  return (
    <div
      className={`x-field ${className}`}
      data-invalid={error ? true : undefined}
      data-disabled={disabled || undefined}
      data-required={required || undefined}
    >
      <label className="x-field__label" htmlFor={id}>
        {label}
        {required ? (
          <span className="x-field__required" aria-hidden="true"> *</span>
        ) : null}
      </label>
      {control}
      {hint ? (
        <p className="x-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="x-field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
