/**
 * BadgeDot state matrix for the Kitchen Sink.
 * The pip is absolute-positioned, so each state renders it pinned inside the
 * sibling `x-icon-btn` host it was built for (referenced by class per §6).
 */
import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import { BadgeDot } from "./BadgeDot";

function host(children: ReactNode): ReactNode {
  return (
    <button type="button" className="x-icon-btn" aria-label="Notifications">
      <Icon name="notifications" size={18} />
      {children}
    </button>
  );
}

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  { key: "count", label: "Count — 3 unread", render: () => host(<BadgeDot count={3} />) },
  { key: "overflow", label: "Overflow — 140 → 99+", render: () => host(<BadgeDot count={140} />) },
  { key: "dot", label: "Presence dot — no numeral", render: () => host(<BadgeDot dot />) },
  {
    key: "zero",
    label: "Zero — renders nothing (honest absence)",
    render: () => host(<BadgeDot count={0} />)
  }
];
