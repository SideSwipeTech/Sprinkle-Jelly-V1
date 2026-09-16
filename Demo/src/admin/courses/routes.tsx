/**
 * CoursesRoutes — the courses studio's pages, mounted inside
 * Administration's console shell. The parent registry mounts this at
 * `curriculum/*` in AdminRoutes.
 *
 * The studio tree browses one level at a time:
 *
 *   (index) · tree           → level 0 — the two families, subject/course cards
 *   items/:itemId            → level 1 — an item's chapter/module cards
 *   items/:itemId/groups/:groupId → level 2 — a chapter/module's lesson list
 *   lessons/:id              → the lesson editor and its live preview
 *   lessons/:id/revisions    → revisions and the four author tools
 *   :id/preview              → the learner-order preview
 *   :id/publish              → review & publish (the dry run)
 *   approvals                → the approval queue
 *   :id/settings             → settings and classification
 *   :id/retire               → retirement (archive, cascade, hard delete;
 *                              ?group= / ?lesson= scope the act exactly)
 *   import-export            → whole-file draft import and export
 *   :id/review               → content review and aggregate analytics
 */

import { Link, Route, Routes } from "react-router-dom";
import { StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { CoursesIndex } from "./CoursesIndex";
import { ItemPage } from "./ItemPage";
import { GroupPage } from "./GroupPage";
import { LessonEditor } from "./LessonEditor";
import { OrderPreview } from "./OrderPreview";
import { Revisions } from "./Revisions";
import { DryRun } from "./DryRun";
import { ApprovalQueue } from "./ApprovalQueue";
import { CourseSettings } from "./CourseSettings";
import { Retirement } from "./Retirement";
import { ImportExport } from "./ImportExport";
import { CourseReview } from "./CourseReview";

function CoursesUnknown() {
  return (
    <AdminPage kicker="Content / Curriculum" title="Courses studio">
      <StateBlock
        state="unavailable"
        message="That studio address does not exist."
        action={<Link className="btn btn--secondary" to="/admin/curriculum">Back to Courses</Link>}
      />
    </AdminPage>
  );
}

export function CoursesRoutes() {
  return (
    <Routes>
      <Route index element={<CoursesIndex />} />
      {/* `tree` stays resolving — the level-0 browse replaced the expanded tree. */}
      <Route path="tree" element={<CoursesIndex />} />
      <Route path="items/:itemId" element={<ItemPage />} />
      <Route path="items/:itemId/groups/:groupId" element={<GroupPage />} />
      <Route path="lessons/:id" element={<LessonEditor />} />
      <Route path="lessons/:id/revisions" element={<Revisions />} />
      <Route path="approvals" element={<ApprovalQueue />} />
      <Route path="import-export" element={<ImportExport />} />
      <Route path=":id/preview" element={<OrderPreview />} />
      <Route path=":id/publish" element={<DryRun />} />
      <Route path=":id/settings" element={<CourseSettings />} />
      <Route path=":id/retire" element={<Retirement />} />
      <Route path=":id/review" element={<CourseReview />} />
      <Route path="*" element={<CoursesUnknown />} />
    </Routes>
  );
}
