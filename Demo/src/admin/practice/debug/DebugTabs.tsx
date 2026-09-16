/**
 * DebugTabs — the debug studio's local section row, shared by the four
 * studio pages so Cases, Review, Bug types and Maintenance read as one
 * studio's destinations rather than orphan pages. Cases is the default;
 * review and bug types stay secondary, and the maintenance path carries its
 * "advanced" tag at the tail of the row — the only place permanent removal
 * is offered (debug.F22).
 *
 * Local navigation only — the global sidebar groups are unchanged.
 */

import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { ChipTabBar } from "../../../extraction/components/ChipTabBar/ChipTabBar";
import type { IconName } from "@icons/keyline";

export type DebugSection = "cases" | "review" | "vocabulary" | "maintenance";

const SECTIONS: { id: DebugSection; label: ReactNode; to: string; icon: IconName }[] = [
  { id: "cases", label: "Cases", to: "/admin/debug", icon: "debug" },
  { id: "review", label: "Review", to: "/admin/debug/review", icon: "clipboard" },
  { id: "vocabulary", label: "Bug types", to: "/admin/debug/vocabulary", icon: "list" },
  {
    id: "maintenance",
    label: (
      <>
        Maintenance <span className="dbg-tab__tag">advanced</span>
      </>
    ),
    to: "/admin/debug/maintenance",
    icon: "settings"
  }
];

export function DebugTabs({ current }: { current: DebugSection }) {
  const navigate = useNavigate();
  return (
    <ChipTabBar
      ruled
      label="Debug studio sections"
      value={current}
      tabs={SECTIONS.map(({ id, label, icon }) => ({ id, label, icon }))}
      onChange={(id) => {
        const section = SECTIONS.find((s) => s.id === id);
        if (section) navigate(section.to);
      }}
    />
  );
}
