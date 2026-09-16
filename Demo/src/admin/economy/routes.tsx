/**
 * EconomyRoutes — the economy domain's three admin destinations, mounted
 * inside Administration's console shell. A fragment: the parent registry in
 * AdminRoutes flattens these into its own Routes, the same way
 * AssessmentsRoutes mounts.
 *
 *   economy              → economy configuration — the shell around XP and
 *                          credit values (admin.F32)
 *   rewards              → failed rewards — the failed_rewards attention
 *                          condition's owning page (decision 173)
 *   economy-operations   → the operational view over the seven aggregate
 *                          keys (decision 173)
 */

import { Route } from "react-router-dom";
import { EconomyConfig } from "./EconomyConfig";
import { FailedRewards } from "./FailedRewards";
import { EconomyOps } from "./EconomyOps";

export function EconomyRoutes() {
  return (
    <>
      <Route path="economy" element={<EconomyConfig />} />
      <Route path="rewards" element={<FailedRewards />} />
      <Route path="economy-operations" element={<EconomyOps />} />
    </>
  );
}
