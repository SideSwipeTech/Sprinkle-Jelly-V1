/**
 * WorkspaceRoutes — the workspace domain's admin destinations, mounted inside
 * Administration's console shell. The parent registry mounts this at
 * `templates/*` in AdminRoutes (this domain's one admin page — the template
 * studio — plus its list).
 *
 *   templates          → the list (author, list, edit — the studio's index)
 *   templates/new      → a pristine blank draft
 *   templates/:id      → the studio for one template
 *
 * `:id` is resolved once and keyed — switching ids remounts the studio so a
 * dirty form can never bleed into the next template.
 */

import { Route, Routes, useParams } from "react-router-dom";
import { StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Button } from "../../extraction/components/Button/Button";
import { TemplateIndex, TemplateStudio } from "./TemplateStudio";

function StudioRoute() {
  const { id } = useParams();
  if (!id) {
    return (
      <AdminPage kicker="Content / Workspace" title="Template unavailable">
        <StateBlock
          state="unavailable"
          message="This template does not resolve."
          action={<Button variant="secondary" to="/admin/templates">Project templates</Button>}
        />
      </AdminPage>
    );
  }
  return <TemplateStudio key={id} id={id} />;
}

export function WorkspaceRoutes() {
  return (
    <Routes>
      <Route index element={<TemplateIndex />} />
      <Route path="new" element={<TemplateStudio key="new" id="new" />} />
      <Route path=":id" element={<StudioRoute />} />
      <Route
        path="*"
        element={
          <AdminPage kicker="Content / Workspace" title="Address unavailable">
            <StateBlock
              state="unavailable"
              message="This administration address does not exist."
              action={<Button variant="secondary" to="/admin/templates">Project templates</Button>}
            />
          </AdminPage>
        }
      />
    </Routes>
  );
}
