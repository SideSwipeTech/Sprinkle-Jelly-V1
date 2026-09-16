import { useState, type ReactNode } from "react";
import { CertificateCard } from "./CertificateCard";

function ToggleDemo({ start }: { start: "public" | "hidden" }) {
  const [vis, setVis] = useState(start);
  return (
    <CertificateCard
      id="python-foundations"
      title="Foundations of Python"
      awarded="16 Aug 2026"
      valid
      visibility={vis}
      onToggleVisibility={() => setVis((v) => (v === "public" ? "hidden" : "public"))}
      verifyTo="/certificates/python-foundations/verify"
      proof={{ id: "python-foundations", title: "Foundations of Python" }}
    />
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "public", label: "Public check on — toggle it", render: () => <ToggleDemo start="public" /> },
  { key: "hidden", label: "Hidden from public", render: () => <ToggleDemo start="hidden" /> },
  {
    key: "revoked",
    label: "Revoked record",
    render: () => (
      <CertificateCard
        id="legacy-sql"
        title="Relational SQL Primer"
        awarded="02 Jan 2025"
        valid={false}
        visibility="hidden"
        onToggleVisibility={() => {}}
        verifyTo="/certificates/legacy-sql/verify"
        proof={{}}
      />
    )
  }
];
