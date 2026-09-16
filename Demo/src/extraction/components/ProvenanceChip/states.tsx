/**
 * ProvenanceChip state matrix for the Kitchen Sink.
 */
import type { ReactNode } from "react";
import { ProvenanceChip } from "./ProvenanceChip";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "actual",
    label: "Actual — observed in a real sitting",
    render: () => <ProvenanceChip kind="actual">Actual 2026 OA Pattern</ProvenanceChip>
  },
  {
    key: "curated",
    label: "Curated — authored archetype",
    render: () => <ProvenanceChip kind="curated">Curated Archetype</ProvenanceChip>
  },
  {
    key: "device",
    label: "Device — derived on this device",
    render: () => <ProvenanceChip kind="device">Active IST Window</ProvenanceChip>
  }
];
