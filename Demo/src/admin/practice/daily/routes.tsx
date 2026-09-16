/**
 * DailyRoutes — the daily domain's own index routes, mounted under /admin by
 * AdminRoutes beside PracticeRoutes (`daily/:date` is the editor's):
 *
 *   daily         → the scheduling calendar (the domain's index)
 *   daily/health  → schedule health over the next DAILY_SCHEDULE_HEALTH_DAYS
 *
 * `daily/health` is a literal and outranks the editor's `daily/:date`, so the
 * health window never resolves as a product date.
 */

import { Route } from "react-router-dom";
import { DailyIndex } from "./DailyIndex";
import { ScheduleHealth } from "./ScheduleHealth";

export function DailyRoutes() {
  return (
    <>
      <Route path="daily" element={<DailyIndex />} />
      <Route path="daily/health" element={<ScheduleHealth />} />
    </>
  );
}
