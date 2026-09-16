import { Route, Routes } from "react-router-dom";
import { AdminLayout, AdminUnknown } from "./AdminShell";
import { AdminHub } from "./AdminPages";
import { AssessmentsRoutes } from "./assessments/routes";
import { AssistantRoutes } from "./assistant/routes";
import { ContentRoutes } from "./content/routes";
import { CoursesRoutes } from "./courses/routes";
import { CredentialsRoutes } from "./credentials/routes";
import { EditorialRoutes } from "./editorial/routes";
import { EconomyRoutes } from "./economy/routes";
import { GovernanceRoutes } from "./governance/routes";
import { PeopleRoutes } from "./people/routes";
import { PracticeRoutes } from "./practice/routes";
import { ChallengesRoutes } from "./practice/challenges/routes";
import { DailyRoutes } from "./practice/daily/routes";
import { DebugRoutes } from "./practice/debug/routes";
import { WorkspaceRoutes } from "./workspace/routes";

/** Splat parent `/admin/*` + descendant Routes so nested slugs never fall through to the learner 404. */
export function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminHub />} />

        {/* Courses studio — the spec's ten pages own the whole curriculum tree */}
        <Route path="curriculum/*" element={<CoursesRoutes />} />

        {/* Practice studio editors — challenges/:id · daily/:date · debug/:id */}
        {PracticeRoutes()}

        {/* Studio indexes + domain workflows — challenges (+review + tracks), daily (+health), debug (+vocabulary +review +maintenance) */}
        {ChallengesRoutes()}
        {DailyRoutes()}
        {DebugRoutes()}

        {/* Assessment studio — index + every nested page (fragment flattened by Routes) */}
        {AssessmentsRoutes()}

        {/* Workspace — template list + studio */}
        <Route path="templates/*" element={<WorkspaceRoutes />} />

        {/* Editorial studio — pick-list + per-item worked-solution studio */}
        <Route path="editorial/*" element={<EditorialRoutes />} />

        {/* Tracks studio (list-only — no depth pages in spec) */}

        {/* Content ops — approvals/review/taxonomy/knowledge/gaps/requests/suggestion/broadcasts */}
        {ContentRoutes()}

        {/* People — users, person detail, moderation acts, credit correction */}
        {PeopleRoutes()}

        {/* Credentials — certificates index, parked generations, the four acts */}
        {CredentialsRoutes()}

        {/* Governance — progress-reset/audit/lifecycle/identity/maintenance/reporting (+analytics alias) */}
        {GovernanceRoutes()}

        {/* Economy — config, failed rewards, aggregate operations */}
        {EconomyRoutes()}

        {/* Assistant — identity, responses, nudges, KB administration */}
        {AssistantRoutes()}

        <Route path="*" element={<AdminUnknown />} />
      </Routes>
    </AdminLayout>
  );
}
