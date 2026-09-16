import type { ReactNode } from "react";
import { Stat } from "@components/Card";
import { HealthTile, HealthTileGrid } from "./HealthTileGrid";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "dependency",
    label: "Dependency health — all three verdicts",
    render: () => (
      <HealthTileGrid label="Dependency health">
        <HealthTile name="Identity" verdict="healthy" reading="healthy" />
        <HealthTile name="Interactive execution" verdict="degraded" reading="degraded · batch healthy" />
        <HealthTile name="Batch execution" verdict="healthy" reading="healthy" />
        <HealthTile name="Object store" verdict="unknown" reading="unknown" />
      </HealthTileGrid>
    )
  },
  {
    key: "stats",
    label: "Cells hosting kit Stat (analytics)",
    render: () => (
      <HealthTileGrid label="Active learners">
        <HealthTile name="Distinct active"><Stat label="Distinct active" value={61} /><p className="x-health-tile__reading">today</p></HealthTile>
        <HealthTile name="First-time active"><Stat label="first_time_active" value={7} /></HealthTile>
        <HealthTile name="Cross-bucket sum"><Stat label="Cross-bucket sum" value={null} /><p className="x-health-tile__reading">unavailable — never the sum of buckets</p></HealthTile>
      </HealthTileGrid>
    )
  }
];
