/**
 * routes — the people pages' routes, flattened into the parent registry under
 * /admin (like AssessmentsRoutes — a fragment of <Route>s, not a mounted
 * <Routes>, so the parent keeps ownership of the table).
 *
 *   users                      → the person directory (search, filters, lenses)
 *   users/:userId              → the person's detail beside the action rail
 *   users/:userId/suspend      → set a suspension
 *   users/:userId/lift         → lift one early
 *   users/:userId/ban          → ban
 *   users/:userId/unban        → unban
 *   credits                    → the person picker for a correction
 *   credits/:userId            → XP and credit correction
 */

import { Route } from "react-router-dom";
import { Users } from "./Users";
import { PersonDetail } from "./PersonDetail";
import { Moderation } from "./Moderation";
import { Correction } from "./Correction";

export function PeopleRoutes() {
  return (
    <>
      <Route path="users" element={<Users />} />
      <Route path="users/:userId" element={<PersonDetail />} />
      <Route path="users/:userId/suspend" element={<Moderation kind="suspend" />} />
      <Route path="users/:userId/lift" element={<Moderation kind="lift" />} />
      <Route path="users/:userId/ban" element={<Moderation kind="ban" />} />
      <Route path="users/:userId/unban" element={<Moderation kind="unban" />} />
      <Route path="credits" element={<Correction />} />
      <Route path="credits/:userId" element={<Correction />} />
    </>
  );
}
