/**
 * TagCloud state matrix for the Kitchen Sink.
 */
import { useState, type ReactNode } from "react";
import { TagCloud } from "./TagCloud";

const TAGS = ["arrays", "hash-map", "two-pointers", "dp", "graphs", "recursion", "strings", "sorting", "binary-search", "greedy"];

function SelectableDemo() {
  const [tag, setTag] = useState<string | null>("dp");
  return <TagCloud tags={TAGS} selected={tag} onSelect={setTag} label="Filter by tag" />;
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "selectable", label: "Single-select cloud", render: () => <SelectableDemo /> },
  {
    key: "none-selected",
    label: "Nothing selected",
    render: () => <TagCloud tags={TAGS.slice(0, 5)} selected={null} onSelect={() => {}} label="Filter by tag" />
  },
  {
    key: "static",
    label: "Static tag display (no onSelect)",
    render: () => <TagCloud tags={TAGS.slice(0, 6)} label="Problem tags" />
  }
];
