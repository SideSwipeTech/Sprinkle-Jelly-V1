/**
 * Practice studio editor routes — relative paths mounted under /admin.
 *
 * Mount inside the administration `<Routes>` as `{PracticeRoutes()}` (the
 * fragment's Route children flatten into the parent): each editor also
 * accepts `"new"` for the create flow, so every studio list row and every
 * calendar affordance has somewhere to land.
 */

import { Route } from "react-router-dom";
import { ChallengeEditor } from "./ChallengeEditor";
import { DailyEditor } from "./DailyEditor";
import { DebugCaseEditor } from "./DebugCaseEditor";

export function PracticeRoutes() {
  return (
    <>
      <Route path="challenges/:id" element={<ChallengeEditor />} />
      <Route path="daily/:date" element={<DailyEditor />} />
      <Route path="debug/:id" element={<DebugCaseEditor />} />
    </>
  );
}
