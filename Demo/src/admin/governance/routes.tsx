/**
 * GovernanceRoutes — the governance and operations destinations this folder
 * owns, mounted inside Administration's console shell. A fragment: mount inside
 * the administration `<Routes>` as `{GovernanceRoutes()}` and the Route
 * children flatten into the parent.
 *
 *   progress-reset   → ProgressReset    (Operations — the nine scopes)
 *   audit            → AuditTrail       (Governance)
 *   lifecycle        → DataLifecycle    (Governance — holds + deletion queue)
 *   identity         → IdentityDelivery (Operations — boundary events + icon)
 *   maintenance      → Maintenance      (Operations — declare and end a window)
 *   reporting        → Reporting        (Governance — the only reporting area)
 *   analytics        → Reporting        (the same destination — /admin/analytics
 *                                        stays nav-linked and answers here)
 */

import { Route } from "react-router-dom";
import { ProgressReset } from "./ProgressReset";
import { AuditTrail } from "./AuditTrail";
import { DataLifecycle } from "./DataLifecycle";
import { IdentityDelivery } from "./IdentityDelivery";
import { Maintenance } from "./Maintenance";
import { Reporting } from "./Reporting";

export function GovernanceRoutes() {
  return (
    <>
      <Route path="progress-reset" element={<ProgressReset />} />
      <Route path="audit" element={<AuditTrail />} />
      <Route path="lifecycle" element={<DataLifecycle />} />
      <Route path="identity" element={<IdentityDelivery />} />
      <Route path="maintenance" element={<Maintenance />} />
      <Route path="reporting" element={<Reporting />} />
      {/* The one reporting destination answers at both addresses; nav names
          `reporting`, and the legacy `analytics` address resolves to the same
          page rather than a second report. */}
      <Route path="analytics" element={<Reporting />} />
    </>
  );
}
