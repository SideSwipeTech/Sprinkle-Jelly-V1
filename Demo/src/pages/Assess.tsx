/**
 * Assessments — the learner's Mock and Company pages.
 *
 * The implementations live in focused modules under ./assessments:
 *   catalogue  — overview, Mock/Company/History discovery views
 *   mock       — briefing → preflight → sealed sitting → scorecard → practice
 *   company    — employer → papers → briefing → preflight → sitting → record
 *   sittings   — the persisted in-progress drafts and next-action verdicts
 *   shared     — navigation, advisory preflight, sealed chrome, practice
 *
 * This file stays the stable import address the router resolves against.
 */

export { AssessmentHome, AssessmentBrowse, AssessmentHistory } from "./assessments/catalogue";
export { MockBriefing, MockStart, MockSitting, MockResult, MockPractice } from "./assessments/mock";
export {
  CompanyDetail,
  CompanyBriefing,
  CompanyStart,
  CompanySitting,
  CompanyResult,
  CompanyPractice,
  CompanyRedo
} from "./assessments/company";
