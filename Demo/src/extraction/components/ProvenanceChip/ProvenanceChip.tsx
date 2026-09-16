/**
 * ProvenanceChip — where the material came from. Kills the literal
 * teal-vs-indigo provenance chips at Assess.tsx:679-688 ("Actual 2026 OA
 * Pattern" vs "Curated Archetype") and :779-788, plus the accent "Active IST
 * Window" provenance tag at Practice.tsx:759.
 *
 * Kinds are closed and each carries its own glyph (SHR-R38 — the difference
 * between "actually observed" and "authored approximation" is a trust claim;
 * it must survive greyscale):
 *
 *   actual    observed in a real sitting      — shield (verified)
 *   curated   authored archetype              — layers (assembled)
 *   device    derived on this device          — user  (local ledger)
 *
 * `device` covers the demo's "this device" provenance claims (the daily IST
 * window, the device measurement ledger) so they stop borrowing accent paint.
 */

import type { ReactNode } from "react";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./ProvenanceChip.css";

export type ProvenanceKind = "actual" | "curated" | "device";

const KIND_ICON: Record<ProvenanceKind, IconName> = {
  actual: "shield",
  curated: "layers",
  device: "user"
};

export interface ProvenanceChipProps {
  kind: ProvenanceKind;
  /** The claim — e.g. "Actual 2026 OA Pattern", "Curated Archetype". */
  children: ReactNode;
  className?: string;
}

export function ProvenanceChip({ kind, children, className = "" }: ProvenanceChipProps) {
  return (
    <span className={`x-provenance-chip ${className}`.trim()} data-kind={kind}>
      <Icon name={KIND_ICON[kind]} size={12} />
      <span className="x-provenance-chip__label">{children}</span>
    </span>
  );
}
