import type { ReactNode } from "react";
import { useState } from "react";
import { LanguageSelect } from "./LanguageSelect";

function Demo({ showLabel = false, disabled = false, strings = false }) {
  const [v, setV] = useState("python");
  return (
    <LanguageSelect
      value={v}
      onChange={setV}
      options={strings ? ["python", "javascript", "go"] : undefined}
      label="Runtime starter"
      showLabel={showLabel}
      disabled={disabled}
    />
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "toolbar",
    label: "Toolbar form (aria-label only) — CodeLab starter picker",
    render: () => <Demo />
  },
  {
    key: "labelled",
    label: "Visible label form",
    render: () => <Demo showLabel />
  },
  {
    key: "string-options",
    label: "String options self-label",
    render: () => <Demo strings />
  },
  {
    key: "disabled",
    label: "Disabled — real attribute + aria-disabled",
    render: () => <Demo disabled />
  }
];
