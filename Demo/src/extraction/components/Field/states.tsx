/**
 * Field state matrix for the Kitchen Sink.
 */
import type { ReactNode } from "react";
import { Field } from "./Field";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "text",
    label: "Text input",
    render: () => (
      <Field label="Name">
        <input defaultValue="Bracket lab notes" placeholder="Enter a title…" />
      </Field>
    )
  },
  {
    key: "textarea",
    label: "Textarea",
    render: () => (
      <Field label="What should the material help you learn?">
        <textarea defaultValue="Describe the concepts or practice outcome…" />
      </Field>
    )
  },
  {
    key: "select",
    label: "Select control",
    render: () => (
      <Field label="Template">
        <select defaultValue="notes-cli">
          <option value="notes-cli">Lab notes CLI</option>
          <option value="parser">Mini parser</option>
        </select>
      </Field>
    )
  },
  {
    key: "hint",
    label: "With hint (aria-describedby)",
    render: () => (
      <Field label="Companion name" hint="2 to 32 displayed characters, plain text.">
        <input placeholder="WizBit" />
      </Field>
    )
  },
  {
    key: "error",
    label: "With error (aria-invalid + role=alert)",
    render: () => (
      <Field label="Companion name" error="A name is 2 to 32 characters. WizBit stays.">
        <input defaultValue="x" />
      </Field>
    )
  },
  {
    key: "required",
    label: "Required",
    render: () => (
      <Field label="Reason" required>
        <input placeholder="Required audit reason" />
      </Field>
    )
  },
  {
    key: "disabled",
    label: "Disabled",
    render: () => (
      <Field label="Gate" disabled>
        <input defaultValue="Locked while published" />
      </Field>
    )
  }
];
