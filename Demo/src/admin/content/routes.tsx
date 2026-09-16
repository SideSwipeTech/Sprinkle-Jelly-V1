/**
 * ContentRoutes — the content consoles' routes, flattened into AdminRoutes'
 * <Routes> at the administrative root. These replace the legacy single-page
 * versions at the same addresses.
 *
 *   approvals       → the publish-approval queue
 *   approvals/:id   → one submission — the whole picture before the decision
 *   review          → the review queue (learner content reports)
 *   taxonomy        → the vocabulary's one writing page
 *   knowledge       → the knowledge-base studio
 *   gaps            → Content Gaps, two panels from two sources
 *   requests        → the topic-request review list
 *   suggestion      → Home's curated suggestion slot
 *   broadcasts      → the broadcast composer and its history
 */

import { Route } from "react-router-dom";
import { ApprovalsIndex, ApprovalDetail } from "./Approvals";
import { ReviewQueue } from "./ReviewQueue";
import { Taxonomy } from "./Taxonomy";
import { Knowledge } from "./Knowledge";
import { ContentGaps } from "./ContentGaps";
import { RequestsQueue } from "./RequestsQueue";
import { Suggestion } from "./Suggestion";
import { Broadcasts } from "./Broadcasts";

export function ContentRoutes() {
  return (
    <>
      <Route path="approvals" element={<ApprovalsIndex />} />
      <Route path="approvals/:id" element={<ApprovalDetail />} />
      <Route path="review" element={<ReviewQueue />} />
      <Route path="taxonomy" element={<Taxonomy />} />
      <Route path="knowledge" element={<Knowledge />} />
      <Route path="gaps" element={<ContentGaps />} />
      <Route path="requests" element={<RequestsQueue />} />
      <Route path="suggestion" element={<Suggestion />} />
      <Route path="broadcasts" element={<Broadcasts />} />
    </>
  );
}
