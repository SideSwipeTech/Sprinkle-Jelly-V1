/**
 * DifficultyBadge state matrix for the Kitchen Sink.
 */
import type { ReactNode } from "react";
import { DifficultyBadge } from "./DifficultyBadge";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "easy", label: "Easy — 1 pip", render: () => <DifficultyBadge level="Easy" /> },
  { key: "medium", label: "Medium — 2 pips", render: () => <DifficultyBadge level="Medium" /> },
  { key: "hard", label: "Hard — 3 pips", render: () => <DifficultyBadge level="Hard" /> },
  {
    key: "with-xp",
    label: "With XP meta",
    render: () => <DifficultyBadge level="Medium" meta="40 XP" />
  }
];
