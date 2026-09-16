/**
 * AssistantRoutes — the WizBit domain's four destinations under Assistant,
 * mounted inside Administration's console shell. A fragment: the parent
 * registry in AdminRoutes flattens these into its own Routes, the same way
 * AssessmentsRoutes mounts.
 *
 * Each destination declares its own named privileged action and is
 * separately permissioned, even while one role holds them all. The fifth
 * admin destination — the knowledge-base studio — lives under Content and
 * belongs to that registry, not this one.
 *
 *   assistant              → companion identity — artwork and accent
 *   assistant/responses    → the response-rule studio
 *   assistant/nudges       → nudge configuration — three levers
 *   assistant/knowledge    → knowledge-base administration — the two gate
 *                            settings
 */

import { Route } from "react-router-dom";
import { AssistantIdentity } from "./Identity";
import { AssistantResponses } from "./Responses";
import { AssistantNudges } from "./Nudges";
import { KnowledgeAdmin } from "./KnowledgeAdmin";

export function AssistantRoutes() {
  return (
    <>
      <Route path="assistant" element={<AssistantIdentity />} />
      <Route path="assistant/responses" element={<AssistantResponses />} />
      <Route path="assistant/nudges" element={<AssistantNudges />} />
      <Route path="assistant/knowledge" element={<KnowledgeAdmin />} />
    </>
  );
}
