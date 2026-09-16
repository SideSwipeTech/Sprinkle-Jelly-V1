/**
 * FilterBar state matrix for the Kitchen Sink.
 * Chips inside are emitted with the sibling x-chip classes, per CONTRACT §6.
 */
import { useState, type ReactNode } from "react";
import { FilterBar } from "./FilterBar";

function FullDemo() {
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState("All");
  return (
    <FilterBar
      label="Challenge filters"
      search={{ value: q, onChange: setQ, placeholder: "Search problems or tags…" }}
      count="12 challenges"
    >
      {["All", "Easy", "Medium", "Hard"].map((d) => (
        <button
          key={d}
          type="button"
          className="x-chip"
          data-on={diff === d || undefined}
          aria-pressed={diff === d}
          onClick={() => setDiff(d)}
        >
          <span className="x-chip__text">{d}</span>
        </button>
      ))}
    </FilterBar>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "full", label: "Search + chips + count", render: () => <FullDemo /> },
  {
    key: "chips-only",
    label: "Chips only (notification filters)",
    render: () => (
      <FilterBar label="Notification filters">
        {["All", "Achievements", "Daily", "System"].map((c, i) => (
          <button
            key={c}
            type="button"
            className="x-chip"
            data-on={i === 0 || undefined}
            aria-pressed={i === 0}
          >
            <span className="x-chip__text">{c}</span>
          </button>
        ))}
      </FilterBar>
    )
  },
  {
    key: "search-count",
    label: "Search + count, no chips",
    render: () => (
      <FilterBar
        label="Paper filters"
        search={{ value: "", onChange: () => {}, placeholder: "Search papers…" }}
        count="4 papers"
      />
    )
  }
];
