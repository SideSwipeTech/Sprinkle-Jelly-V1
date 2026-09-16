/**
 * Select state matrix for the Kitchen Sink.
 */
import { useState, type ReactNode } from "react";
import { Select } from "./Select";
import { Field } from "../Field/Field";

const LANGS = [
  { value: "python", label: "Python 3" },
  { value: "javascript", label: "JavaScript (ES6)" },
  { value: "typescript", label: "TypeScript 5.5" },
  { value: "go", label: "Go 1.22" }
];

const SPEEDS = [
  { value: "0.75", label: "0.75x" },
  { value: "1.0", label: "1.0x (Normal)" },
  { value: "1.5", label: "1.5x" },
  { value: "2.0", label: "2.0x" }
];

function WorkbenchDemo() {
  const [lang, setLang] = useState("python");
  return <Select size="sm" options={LANGS} value={lang} onChange={setLang} aria-label="Runtime starter" />;
}

function FieldDemo() {
  const [tpl, setTpl] = useState("notes-cli");
  return (
    <Field label="Template">
      <Select
        size="md"
        value={tpl}
        onChange={setTpl}
        options={[
          { value: "notes-cli", label: "Lab notes CLI" },
          { value: "parser", label: "Mini parser" },
          { value: "portfolio", label: "Portfolio page", disabled: true }
        ]}
      />
    </Field>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "sm", label: "sm — workbench register (mono)", render: () => <WorkbenchDemo /> },
  { key: "md", label: "md — field register", render: () => <FieldDemo /> },
  {
    key: "md-plain",
    label: "md — bare with aria-label",
    render: () => <Select size="md" options={SPEEDS} defaultValue="1.0" aria-label="Playback speed" />
  },
  {
    key: "children",
    label: "<option> children form",
    render: () => (
      <Select size="sm" defaultValue="python" aria-label="Language">
        <option value="python">Python</option>
        <option value="go">Go</option>
      </Select>
    )
  },
  {
    key: "disabled",
    label: "Disabled",
    render: () => <Select size="sm" options={LANGS} defaultValue="python" disabled aria-label="Language" />
  }
];
