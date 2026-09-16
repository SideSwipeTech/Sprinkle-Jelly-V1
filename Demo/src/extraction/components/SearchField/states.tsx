/**
 * SearchField state matrix for the Kitchen Sink.
 */
import { useState, type ReactNode } from "react";
import { SearchField } from "./SearchField";

function LiveDemo() {
  const [q, setQ] = useState("");
  return <SearchField value={q} onChange={setQ} placeholder="Search problems or tags…" />;
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "empty", label: "Empty, growing", render: () => <LiveDemo /> },
  {
    key: "filled",
    label: "With value",
    render: () => <SearchField defaultValue="binary tree" placeholder="Search…" />
  },
  {
    key: "hug",
    label: "Content-sized (grow off)",
    render: () => <SearchField grow={false} placeholder="Filter actions" />
  },
  {
    key: "disabled",
    label: "Disabled",
    render: () => <SearchField disabled placeholder="Search papers…" />
  }
];
