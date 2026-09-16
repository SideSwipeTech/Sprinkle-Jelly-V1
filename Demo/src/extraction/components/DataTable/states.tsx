import { useState, type ReactNode } from "react";
import { DataTable } from "./DataTable";

const ECONOMY = [
  { key: "CYCLE_CREDIT_GRANT", cat: "Credits Allowance", current: "20", range: "10 – 50 Credits", desc: "Monthly cycle grant posted with active membership." },
  { key: "HINT_RUNG_1_PRICE", cat: "Assistance Pricing", current: "1", range: "1 Credit (Fixed)", desc: "Conceptual direction hint price." },
  { key: "DAILY_SOLVE_BASE_XP", cat: "Experience Awards", current: "40", range: "20 – 100 XP", desc: "Base XP on an accepted daily solve." },
  { key: "GENERATED_AI_ASSISTANCE", cat: "System Gates", current: "OFF", range: "Owner locked", desc: "Launch gate is off." }
];

/** The Economy staged-edit pattern — selection rides data-on, staging rides a real button. */
function EconomyDemo() {
  const [selected, setSelected] = useState("CYCLE_CREDIT_GRANT");
  return (
    <DataTable
      label="16 registered configuration variables"
      columns={["Variable Key", "Category", "Enforced Value", "Allowed Range", "Action"]}
      rows={ECONOMY.map((s) => ({
        key: s.key,
        on: s.key === selected,
        cells: [
          <span><code className="x-data-table__code">{s.key}</code><span className="x-data-table__sub">{s.desc}</span></span>,
          <span className="x-chip x-chip--quiet"><span className="x-chip__text">{s.cat}</span></span>,
          <strong className="x-data-table__value">{s.current}</strong>,
          <span className="meta">{s.range}</span>,
          <button
            type="button"
            className="x-btn x-btn--quiet"
            aria-pressed={s.key === selected}
            onClick={() => setSelected(s.key)}
          >
            Stage Edit
          </button>
        ]
      }))}
    />
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "economy", label: "Economy staged-edit rows (selectable)", render: () => <EconomyDemo /> },
  {
    key: "work-health",
    label: "Work health — plain cells",
    render: () => (
      <DataTable
        label="Work health by producing area"
        columns={["Producing area", "Waiting", "Running", "Succeeded", "Failed", "Failure classes"]}
        rows={[
          { key: "r", cells: ["Rewards", "6", "1", "183", "2", "validation · dependency · exhausted · unclassified"] },
          { key: "i", cells: ["Identity delivery", "3", "2", "91", "0", "validation · dependency · exhausted · unclassified"], on: true },
          { key: "l", cells: ["Data lifecycle", "1", "1", "28", "1", "validation · dependency · exhausted · unclassified"] }
        ]}
      />
    )
  },
  {
    key: "scroll",
    label: "Self-scroll — narrow container",
    render: () => (
      <div style={{ maxWidth: "26rem" }}>
        <DataTable
          label="Overflowing table"
          columns={["A", "B", "C", "D", "E"]}
          rows={[{ key: "1", cells: ["alpha", "beta", "gamma", "delta", "epsilon"] }]}
        />
      </div>
    )
  }
];
