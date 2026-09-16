/**
 * gates — the tier-three handoff refusal, shared by every write on a person.
 * admin.F11: the third confirmation tier additionally needs a fresh handoff
 * from the main site, no older than ACCESS_FRESH_HANDOFF_MINUTES; without one
 * the act is refused naming that remedy.
 */

import { StateBlock } from "@components/Card";
import { ACCESS_FRESH_HANDOFF_MINUTES, HANDOFF } from "./fixtures";

/** Renders the refusal when the session's handoff is stale; nothing when
 *  fresh. Callers keep the confirm unreachable on `!HANDOFF.fresh`. */
export function FreshHandoffGate() {
  if (HANDOFF.fresh) return null;
  return (
    <StateBlock
      state="refused"
      compact
      message={`A typed confirmation plus a reason needs a fresh handoff from the main site, no older than ACCESS_FRESH_HANDOFF_MINUTES (${ACCESS_FRESH_HANDOFF_MINUTES} minutes) — the handoff in this session is ${HANDOFF.ageMinutes} minutes old. Refresh the handoff in this browser to proceed.`}
    />
  );
}
