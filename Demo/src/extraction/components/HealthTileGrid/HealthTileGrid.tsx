/**
 * HealthTileGrid — the dependency-health cell grid.
 *
 * Extracted from admin-shell.css:117-131 (`.admin-health` + `data-verdict`).
 * Cells host either a plain strong+reading or the kit `Stat`. Verdicts are
 * closed — healthy | degraded | unknown — and each gets an icon as well as the
 * border tone: an unread signal is "unknown", never painted healthy.
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./HealthTileGrid.css";

export function HealthTileGrid({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="x-health-grid" role="list" aria-label={label}>
      {children}
    </div>
  );
}

export type HealthVerdict = "healthy" | "degraded" | "unknown";

const VERDICT_ICON: Record<HealthVerdict, IconName> = {
  healthy: "check",
  degraded: "alert",
  unknown: "help"
};

export interface HealthTileProps {
  name: string;
  /** The reading, e.g. "degraded · batch healthy". */
  reading?: ReactNode;
  verdict?: HealthVerdict;
  /** Optional metric body — the kit Stat slots here (analytics cells). */
  children?: ReactNode;
}

export function HealthTile({ name, reading, verdict, children }: HealthTileProps) {
  return (
    <div className="x-health-tile" role="listitem" data-verdict={verdict}>
      <div className="x-health-tile__head">
        <strong className="x-health-tile__name">{name}</strong>
        {verdict ? <Icon name={VERDICT_ICON[verdict]} size={14} /> : null}
      </div>
      {children}
      {reading ? <p className="x-health-tile__reading">{reading}</p> : null}
    </div>
  );
}
