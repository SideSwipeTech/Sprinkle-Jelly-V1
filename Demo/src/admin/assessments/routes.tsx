/**
 * routes — the assessment studio's routes, mounted by AdminRoutes under
 * /admin/mocks and /admin/sittings (and the companies registry at
 * /admin/mocks/companies — literal before identifier).
 */

import { Route } from "react-router-dom";
import { AssessmentsIndex, SittingsIndex } from "./Indexes";
import { PaperStudio } from "./PaperStudio";
import { QuestionAuthoring } from "./QuestionAuthoring";
import { BulkImport } from "./BulkImport";
import { PublishChecklist } from "./PublishChecklist";
import { PublishedView } from "./PublishedView";
import { PublishedSettings } from "./PublishedSettings";
import { CompaniesRoles } from "./CompaniesRoles";
import { CompanyDetail } from "./CompanyDetail";
import { RecordedEventReview } from "./RecordedEventReview";
import { Invalidation } from "./Invalidation";
import { MockAnalytics } from "./MockAnalytics";
import { CompanyAnalytics } from "./CompanyAnalytics";

export function AssessmentsRoutes() {
  return (
    <>
      {/* Paper studio — one authoring page for the paper's whole life */}
      <Route path="mocks" element={<AssessmentsIndex />} />
      {/* The registry's literals win over the paper identifier — a literal
          assessment address always beats one read as carrying an identifier. */}
      <Route path="mocks/companies" element={<CompaniesRoles />} />
      <Route path="mocks/companies/:companyId" element={<CompanyDetail />} />
      <Route path="mocks/:paperId" element={<PaperStudio />} />
      <Route path="mocks/:paperId/sections/:sectionId/questions/:questionId" element={<QuestionAuthoring />} />
      <Route path="mocks/:paperId/import" element={<BulkImport />} />
      <Route path="mocks/:paperId/publish" element={<PublishChecklist />} />
      <Route path="mocks/:paperId/published" element={<PublishedView />} />
      <Route path="mocks/:paperId/settings" element={<PublishedSettings />} />
      <Route path="mocks/:paperId/analytics" element={<MockAnalytics />} />
      <Route path="mocks/:paperId/company-analytics" element={<CompanyAnalytics />} />

      {/* Tests */}
      <Route path="sittings" element={<SittingsIndex />} />
      <Route path="sittings/:sittingId/events" element={<RecordedEventReview />} />
      <Route path="sittings/:sittingId/invalidate" element={<Invalidation />} />
    </>
  );
}
