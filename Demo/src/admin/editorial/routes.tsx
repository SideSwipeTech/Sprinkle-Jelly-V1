/**
 * EditorialRoutes — the editorial studio's destinations, mounted inside
 * Administration's console shell. The parent registry mounts this at
 * `editorial/*` in AdminRoutes.
 *
 *   editorial          → the pick-list of items that can carry a worked solution
 *   editorial/:itemId  → the studio for one item, per language
 *
 * `:itemId` is resolved once and keyed — switching items remounts the studio
 * so one item's edits can never bleed into another's.
 */

import { Route, Routes, useParams } from "react-router-dom";
import { StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Button } from "../../extraction/components/Button/Button";
import { EditorialIndex, EditorialStudio } from "./EditorialStudio";

function StudioRoute() {
  const { itemId } = useParams();
  if (!itemId) {
    return (
      <AdminPage kicker="Content / Editorial studio" title="Item unavailable">
        <StateBlock
          state="unavailable"
          message="This item does not resolve."
          action={<Button variant="secondary" to="/admin/editorial">Editorial</Button>}
        />
      </AdminPage>
    );
  }
  return <EditorialStudio key={itemId} itemId={itemId} />;
}

export function EditorialRoutes() {
  return (
    <Routes>
      <Route index element={<EditorialIndex />} />
      <Route path=":itemId" element={<StudioRoute />} />
      <Route
        path="*"
        element={
          <AdminPage kicker="Content / Editorial studio" title="Address unavailable">
            <StateBlock
              state="unavailable"
              message="This administration address does not exist."
              action={<Button variant="secondary" to="/admin/editorial">Editorial</Button>}
            />
          </AdminPage>
        }
      />
    </Routes>
  );
}
