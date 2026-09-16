import { useState, type ReactNode } from "react";
import { CompanionNameField } from "./CompanionNameField";

function NameDemo({ initial = "" }: { initial?: string }) {
  const [name, setName] = useState(initial);
  return (
    <CompanionNameField
      value={name}
      onSave={setName}
      onReset={() => setName("")}
    />
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "default", label: "Default in effect (try saving \"admin\")", render: () => <NameDemo /> },
  { key: "named", label: "Saved name", render: () => <NameDemo initial="Moss" /> }
];
