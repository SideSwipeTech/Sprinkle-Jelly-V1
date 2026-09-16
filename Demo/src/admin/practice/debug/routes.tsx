/**
 * Debug studio routes — relative paths mounted under /admin.
 *
 * Mount inside the administration `<Routes>` as `{DebugRoutes()}` (the
 * fragment's Route children flatten into the parent, the same shape
 * PracticeRoutes uses). The `debug/:id` editor is already mounted by
 * PracticeRoutes; static segments outrank it, so `debug/vocabulary`,
 * `debug/review` and `debug/maintenance` never resolve as case ids.
 */

import { Route } from "react-router-dom";
import { DebugIndex } from "./DebugIndex";
import { Vocabulary } from "./Vocabulary";
import { DebugReview } from "./DebugReview";
import { Maintenance } from "./Maintenance";

export function DebugRoutes() {
  return (
    <>
      <Route path="debug" element={<DebugIndex />} />
      <Route path="debug/vocabulary" element={<Vocabulary />} />
      <Route path="debug/review" element={<DebugReview />} />
      <Route path="debug/maintenance" element={<Maintenance />} />
    </>
  );
}
