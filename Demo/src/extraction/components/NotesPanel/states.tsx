/**
 * NotesPanel state matrix.
 */

import type { ReactNode } from "react";
import { NotesPanel } from "./NotesPanel";

const SAMPLE =
  "Invariant: the left pointer never passes the right.\nNext step: prove the merge case before optimizing.";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "closed",
    label: "Closed (renders nothing — its trigger is the header icon)",
    render: () => <NotesPanel open={false} value="" onChange={() => {}} onClose={() => {}} />
  },
  {
    key: "open-empty",
    label: "Open — empty scratchpad, saved",
    render: () => <NotesPanel value="" onChange={() => {}} onClose={() => {}} />
  },
  {
    key: "open-draft",
    label: "Open — drafted note, saved",
    render: () => <NotesPanel value={SAMPLE} onChange={() => {}} onClose={() => {}} />
  },
  {
    key: "saving",
    label: "Saving — indicator mid-flight",
    render: () => (
      <NotesPanel value={SAMPLE} onChange={() => {}} onClose={() => {}} saveState="saving" />
    )
  },
  {
    key: "near-cap",
    label: "Near the character cap",
    render: () => (
      <NotesPanel value={"x".repeat(49900)} onChange={() => {}} onClose={() => {}} />
    )
  }
];
