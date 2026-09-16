import type { ReactNode } from "react";
import { AchievementTile } from "./AchievementTile";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "unlocked",
    label: "Unlocked",
    render: () => (
      <AchievementTile
        unlocked
        title="First Sitting"
        detail="Complete a sealed mock assessment sitting on this device."
        statusText="Unlocked on 16 Aug"
      />
    )
  },
  {
    key: "locked",
    label: "Locked",
    render: () => (
      <AchievementTile
        unlocked={false}
        title="Track Finisher"
        detail="Accept every problem on an authored challenges track."
      />
    )
  },
  {
    key: "pair",
    label: "Grid — both states together",
    render: () => (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: "var(--stack-gap)" }}>
        <AchievementTile unlocked title="Course Complete" detail="Finish every lesson on a curriculum." />
        <AchievementTile unlocked={false} title="Week of Rituals" detail="Solve the daily challenge seven days running." />
      </div>
    )
  }
];
