/**
 * ActivityHeatmap — the 365-day accepted-solutions grid, three grains.
 *
 * Extracted from src/components/ActivityHeatmap.tsx. The hardcoded teal ramp is gone:
 * intensity levels read the identity's accent ramp (the same three tokens ChargeRing's
 * gradient stops read — accent-light blends up to accent-primary), and every inline
 * style is now a class or a custom property. Data arrives as `days` — the component
 * never invents a number (the demo's deterministic generator stays with the caller).
 *
 * Honest-absence: `state="empty"` and `state="unavailable"` render StateBlock, never
 * an apparent year of idleness.
 */

import { useMemo, useState } from "react";
import { StateBlock } from "../../../components/Card";
import "./ActivityHeatmap.css";

export interface HeatmapDay {
  /** ISO date — YYYY-MM-DD. */
  date: string;
  count: number;
}

export type HeatmapState = "grid" | "empty" | "unavailable";
export type RhythmGrain = "daily" | "weekly" | "monthly";

/** Accepted-solutions count → intensity level 0–4 (the ramp steps). */
export function intensityFor(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ActivityHeatmap({
  days,
  state = "grid",
  windowDays = 365,
  weekCount = 12,
  weeklyDenominator = 15
}: {
  days: HeatmapDay[];
  state?: HeatmapState;
  /** Labels only — the window the caller measured. */
  windowDays?: number;
  weekCount?: number;
  /** Weekly bars scale against this full-height count. */
  weeklyDenominator?: number;
}) {
  const [grain, setGrain] = useState<RhythmGrain>("daily");
  const [hovered, setHovered] = useState<HeatmapDay | null>(null);

  // Split the window into week columns of 7 days.
  const weeks = useMemo(() => {
    const res: HeatmapDay[][] = [];
    for (let i = 0; i < days.length; i += 7) res.push(days.slice(i, i + 7));
    return res;
  }, [days]);

  const weekAggregates = useMemo(
    () =>
      weeks.slice(-weekCount).map((w, idx) => ({
        label: `W${idx + 1}`,
        count: w.reduce((acc, d) => acc + d.count, 0)
      })),
    [weeks, weekCount]
  );

  const monthlyAggregates = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of days) map.set(d.date.slice(0, 7), (map.get(d.date.slice(0, 7)) ?? 0) + d.count);
    return Array.from(map.entries()).map(([month, count]) => ({
      month: MONTH_NAMES[Number(month.split("-")[1]) - 1] ?? month,
      count
    }));
  }, [days]);

  const totalSolves = useMemo(() => days.reduce((acc, d) => acc + d.count, 0), [days]);
  const activeDays = useMemo(() => days.filter((d) => d.count > 0).length, [days]);

  const grains: { key: RhythmGrain; label: string }[] = [
    { key: "daily", label: `${windowDays} days` },
    { key: "weekly", label: `${weekCount} weeks` },
    { key: "monthly", label: "Monthly" }
  ];

  return (
    <div className="x-heatmap">
      <div className="x-heatmap__controls">
        <div className="x-heatmap__grains" role="group" aria-label="Rhythm grain">
          {grains.map((g) => (
            <button
              key={g.key}
              type="button"
              className="x-chip"
              data-on={grain === g.key || undefined}
              aria-pressed={grain === g.key}
              onClick={() => setGrain(g.key)}
            >
              {g.label}
            </button>
          ))}
        </div>
        <span className="micro x-heatmap__scope">Accepted solutions only</span>
      </div>

      {state === "empty" ? (
        <StateBlock
          state="empty"
          message={`No recorded activity in this ${windowDays}-day window. No heatmap is drawn. Lifetime totals remain separate.`}
        />
      ) : null}

      {state === "unavailable" ? (
        <StateBlock
          state="unavailable"
          message="Activity history could not be read from the local measurement ledger. Drawing no grid rather than an apparent year of idleness."
        />
      ) : null}

      {state === "grid" && grain === "daily" ? (
        <div className="x-heatmap__daily">
          <p className="x-heatmap__readout" aria-live="polite">
            {hovered ? (
              <>
                <strong>{hovered.count} solve{hovered.count === 1 ? "" : "s"}</strong> on {hovered.date}
              </>
            ) : (
              "Hover over a cell to view accepted solutions"
            )}
          </p>

          {/* The matrix is a picture of the record; the totals beside it carry the same
              information in words, so the cells are presentational. */}
          <div className="x-heatmap__grid" aria-hidden="true">
            <div className="x-heatmap__weekdays">
              <span>M</span>
              <span />
              <span>W</span>
              <span />
              <span>F</span>
              <span />
              <span />
            </div>
            {weeks.map((week, wIdx) => (
              <div className="x-heatmap__week" key={wIdx}>
                {week.map((day) => (
                  <span
                    key={day.date}
                    className="x-heatmap__day"
                    data-level={intensityFor(day.count)}
                    onMouseEnter={() => setHovered(day)}
                    onMouseLeave={() => setHovered(null)}
                    title={`${day.date}: ${day.count} solves`}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="x-heatmap__legend">
            <span>
              {activeDays} active days · {totalSolves} accepted solutions
            </span>
            <span className="x-heatmap__ramp">
              <span>Less</span>
              {([0, 1, 2, 3, 4] as const).map((lvl) => (
                <span key={lvl} className="x-heatmap__day x-heatmap__day--static" data-level={lvl} />
              ))}
              <span>More</span>
            </span>
          </div>
        </div>
      ) : null}

      {state === "grid" && grain === "weekly" ? (
        <div className="x-heatmap__weekly">
          <div className="x-heatmap__bars">
            {weekAggregates.map((w) => (
              <div className="x-heatmap__bar-cell" key={w.label}>
                <span className="x-heatmap__bar-count">{w.count}</span>
                <span
                  className="x-heatmap__bar"
                  style={{ ["--x-h" as string]: `${Math.min(100, Math.max(15, (w.count / weeklyDenominator) * 100))}%` }}
                />
                <span className="x-heatmap__bar-label">{w.label}</span>
              </div>
            ))}
          </div>
          <p className="x-heatmap__note">Accepted solutions over the last {weekCount} weeks</p>
        </div>
      ) : null}

      {state === "grid" && grain === "monthly" ? (
        <div className="x-heatmap__months">
          {monthlyAggregates.map((m) => (
            <div className="x-heatmap__month" key={m.month}>
              <span className="micro x-heatmap__month-name">{m.month}</span>
              <span className="x-heatmap__month-count numeral">{m.count}</span>
              <span className="x-heatmap__month-unit">solves</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
