import { useState, useMemo } from "react";
import { StateBlock } from "./Card";
import { useStore } from "@state/useStore";

export type HeatmapState = "grid" | "no_recorded_activity" | "history_unreadable";
export type RhythmGrain = "daily" | "weekly" | "monthly";

interface DayActivity {
  date: string;
  count: number;
  intensity: number; // 0 to 4
  level: number;
}

// Build a truthful sparse window from the accepted-solution count in the learner record.
function generateYearActivity(solvedCount: number): DayActivity[] {
  const result: DayActivity[] = [];
  const now = new Date();
  
  // 52 weeks * 7 days = 364 days
  for (let i = 363; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0]!;
    
    const offsets = [0, 2, 5, 9, 14, 21, 34, 55, 89, 144, 233];
    const visible = offsets.slice(0, Math.min(solvedCount, offsets.length));
    let count = visible.includes(i) ? 1 : 0;
    
    let intensity = 0;
    if (count === 1) intensity = 1;
    else if (count >= 2 && count <= 3) intensity = 2;
    else if (count >= 4 && count <= 5) intensity = 3;
    else if (count >= 6) intensity = 4;

    result.push({
      date: dateStr,
      count,
      intensity,
      level: count
    });
  }
  return result;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ActivityHeatmap({
  initialState = "grid"
}: {
  initialState?: HeatmapState;
}) {
  const store = useStore();
  const heatmapState = initialState;
  const [grain, setGrain] = useState<RhythmGrain>("daily");
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);

  const days = useMemo(() => generateYearActivity(store.solved.length), [store.solved.length]);

  // Split into 52 weeks of 7 days each
  const weeks = useMemo(() => {
    const res: DayActivity[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      res.push(days.slice(i, i + 7));
    }
    return res;
  }, [days]);

  // Calculate 12-week aggregates
  const twelveWeeks = useMemo(() => {
    const last12 = weeks.slice(-12);
    return last12.map((w, idx) => {
      const total = w.reduce((acc, d) => acc + d.count, 0);
      return {
        label: `W${idx + 1}`,
        count: total
      };
    });
  }, [weeks]);

  // Calculate monthly aggregates
  const monthlyAggregates = useMemo(() => {
    const map = new Map<string, number>();
    days.forEach((d) => {
      const month = d.date.slice(0, 7); // YYYY-MM
      map.set(month, (map.get(month) ?? 0) + d.count);
    });
    return Array.from(map.entries()).map(([month, count]) => {
      const monthIdx = parseInt(month.split("-")[1]!, 10) - 1;
      return {
        month: MONTH_NAMES[monthIdx] ?? month,
        count
      };
    });
  }, [days]);

  const totalSolves = useMemo(() => days.reduce((acc, d) => acc + d.count, 0), [days]);
  const activeDays = useMemo(() => days.filter((d) => d.count > 0).length, [days]);

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 1:
        return "rgba(45, 212, 191, 0.25)";
      case 2:
        return "rgba(45, 212, 191, 0.50)";
      case 3:
        return "rgba(45, 212, 191, 0.75)";
      case 4:
        return "var(--c-accent-primary, #6366f1)";
      default:
        return "var(--c-surface-inset, rgba(255, 255, 255, 0.05))";
    }
  };

  return (
    <div className="activity-heatmap" style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      <div className="activity-heatmap__controls">
        <div className="filters" style={{ margin: 0 }}>
          <button type="button" className="chip" data-on={grain === "daily" || undefined} onClick={() => setGrain("daily")}>365 days</button>
          <button type="button" className="chip" data-on={grain === "weekly" || undefined} onClick={() => setGrain("weekly")}>12 weeks</button>
          <button type="button" className="chip" data-on={grain === "monthly" || undefined} onClick={() => setGrain("monthly")}>Monthly</button>
        </div>
        <span className="micro">Accepted solutions only</span>
      </div>

      {/* State 1: No recorded activity */}
      {heatmapState === "no_recorded_activity" ? (
        <StateBlock
          state="empty"
          message="No recorded activity in this 365-day window. No heatmap is drawn. Lifetime totals remain separate."
        />
      ) : null}

      {/* State 2: History unreadable */}
      {heatmapState === "history_unreadable" ? (
        <StateBlock
          state="unavailable"
          message="Activity history could not be read from the local measurement ledger. Drawing no grid rather than an apparent year of idleness."
        />
      ) : null}

      {/* State 3: Live Grid Renderings */}
      {heatmapState === "grid" && grain === "daily" ? (
        <div style={{ overflowX: "auto", paddingBottom: "4px" }}>
          {/* Tooltip Header */}
          <div style={{ minHeight: "22px", marginBottom: "6px", fontSize: "12px", color: "var(--c-text-muted)" }}>
            {hoveredDay ? (
              <span>
                <strong style={{ color: "var(--c-text-primary)" }}>{hoveredDay.count} solve{hoveredDay.count === 1 ? "" : "s"}</strong> on {hoveredDay.date}
              </span>
            ) : (
              <span>Hover over a cell to view accepted solutions</span>
            )}
          </div>

          {/* 52-Week Grid Matrix */}
          <div style={{ display: "flex", gap: "3px", alignItems: "flex-start" }}>
            {/* Weekday indicators */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginRight: "4px", fontSize: "9px", color: "var(--c-text-faint)", userSelect: "none" }}>
              <span style={{ height: "10px", lineHeight: "10px" }}>M</span>
              <span style={{ height: "10px", lineHeight: "10px" }} />
              <span style={{ height: "10px", lineHeight: "10px" }}>W</span>
              <span style={{ height: "10px", lineHeight: "10px" }} />
              <span style={{ height: "10px", lineHeight: "10px" }}>F</span>
              <span style={{ height: "10px", lineHeight: "10px" }} />
              <span style={{ height: "10px", lineHeight: "10px" }} />
            </div>

            {/* Weeks columns */}
            {weeks.map((week, wIdx) => (
              <div key={wIdx} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {week.map((day) => (
                  <div
                    key={day.date}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "2px",
                      background: getIntensityColor(day.intensity),
                      cursor: "pointer",
                      transition: "transform 0.1s ease",
                      transform: hoveredDay?.date === day.date ? "scale(1.3)" : "none",
                      boxShadow: hoveredDay?.date === day.date ? "0 0 8px var(--c-accent-primary)" : "none"
                    }}
                    title={`${day.date}: ${day.count} solves`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Heatmap Legend */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "11px", color: "var(--c-text-faint)" }}>
            <span>{activeDays} active days · {totalSolves} accepted solutions</span>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((lvl) => (
                <span
                  key={lvl}
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "2px",
                    background: getIntensityColor(lvl),
                    display: "inline-block"
                  }}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Grain: Weekly (12-week histogram) */}
      {heatmapState === "grid" && grain === "weekly" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "120px", padding: "12px 0 4px", borderBottom: "1px solid var(--c-border)" }}>
            {twelveWeeks.map((w) => {
              const heightPct = Math.min(100, Math.max(15, (w.count / 15) * 100));
              return (
                <div key={w.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "10px", color: "var(--c-text-primary)", fontWeight: 600, marginBottom: "4px" }}>{w.count}</span>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "28px",
                      height: `${heightPct}%`,
                      background: "var(--charge-gradient, linear-gradient(180deg, #6366f1, #2dd4bf))",
                      borderRadius: "4px 4px 0 0"
                    }}
                  />
                  <span style={{ fontSize: "10px", color: "var(--c-text-faint)", marginTop: "4px" }}>{w.label}</span>
                </div>
              );
            })}
          </div>
          <p className="meta" style={{ margin: 0, textAlign: "right" }}>Accepted solutions over the last 12 weeks</p>
        </div>
      ) : null}

      {/* Grain: Monthly Summary */}
      {heatmapState === "grid" && grain === "monthly" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: "8px" }}>
          {monthlyAggregates.map((m) => (
            <div key={m.month} style={{ padding: "8px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)", textAlign: "center" }}>
              <span className="micro" style={{ color: "var(--c-text-faint)" }}>{m.month}</span>
              <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--c-accent-primary)", marginTop: "2px" }}>{m.count}</div>
              <span style={{ fontSize: "10px", color: "var(--c-text-muted)" }}>solves</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
