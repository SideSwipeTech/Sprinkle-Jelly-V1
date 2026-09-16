/**
 * Maintenance — Operations › maintenance (admin pages: "Maintenance windows").
 *
 * Declaring a window with its start, expected end, what it affects and its
 * learner-safe message, and ending it. The record is Jobs' own — declared here
 * through Jobs — and a window that could not be recorded is not in force:
 * refused and said so, never displayed as scheduled while nothing enforces it.
 *
 * A window ends on health rather than on the clock: one that overruns stays
 * declared until the affected path is genuinely available again. No outside
 * status destination exists, so a window names none and renders no link.
 */

import { useState } from "react";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { declareMaintenance, endMaintenance } from "@state/store";
import { Button } from "../../extraction/components/Button/Button";
import { Chip } from "../../extraction/components/Chip/Chip";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Field } from "../../extraction/components/Field/Field";
import { MaintenancePreview } from "../../extraction/components/MaintenancePreview/MaintenancePreview";
import {
  CapabilityRefusal,
  PreviewBar,
  StudioLoading,
  usePreview,
  type PreviewKey
} from "../assessments/shared";
import "./governance.css";

const PREVIEWS: PreviewKey[] = ["loaded", "loading", "refused"];

interface MaintWindow {
  id: string;
  start: string;
  end: string;
  affects: string;
  message: string;
  status: "declared" | "ended";
}

/** The fixture window already in force this visit. */
const SEED_WINDOWS: MaintWindow[] = [
  {
    id: "mw-2026-08-26",
    start: "2026-08-26T02:00",
    end: "2026-08-26T04:00",
    affects: "Batch execution, assessment grading",
    message: "Some results may take longer to appear. Interactive work remains available.",
    status: "declared"
  }
];

const END_NOTE =
  "A window ends on health, not the clock — one that overruns stays declared until the affected path is genuinely available again.";

export function Maintenance() {
  const { preview, setPreview, allowed } = usePreview(PREVIEWS);
  const [windows, setWindows] = useState<MaintWindow[]>(SEED_WINDOWS);
  const [start, setStart] = useState("2026-08-28T02:00");
  const [end, setEnd] = useState("2026-08-28T04:00");
  const [affects, setAffects] = useState("");
  const [message, setMessage] = useState("");
  const [endingId, setEndingId] = useState<string | null>(null);

  const complete =
    Boolean(start) &&
    Boolean(end) &&
    end > start &&
    affects.trim().length > 3 &&
    message.trim().length > 8;

  function declare() {
    if (!complete) return;
    const w: MaintWindow = {
      id: `mw-${Date.now()}`,
      start,
      end,
      affects: affects.trim(),
      message: message.trim(),
      status: "declared"
    };
    setWindows((ws) => [w, ...ws]);
    /* The record is Jobs' own — declared through it, and committed with its
       audit row. */
    declareMaintenance(w.message);
  }

  function endWindow(id: string) {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, status: "ended" } : w)));
    endMaintenance();
    setEndingId(null);
  }

  if (preview === "loading") {
    return (
      <AdminPage kicker="Operations" title="Maintenance windows">
        <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
        <StudioLoading />
      </AdminPage>
    );
  }

  const ending = windows.find((w) => w.id === endingId);

  return (
    <AdminPage
      kicker="Operations"
      title="Maintenance windows"
      lead="A declared window has exactly four parts — when it starts, when it is expected to end, what it affects, and the learner-safe message it carries."
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />
      {preview === "refused" ? <CapabilityRefusal action="the maintenance-window write" /> : null}

      {preview === "loaded" ? (
        <>
          <Card>
            <CardHeader title="Declare a window" icon="settings" />
            <div className="admin-form-grid">
              <Field label="Start" required>
                <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
              </Field>
              <Field
                label="Expected end"
                required
                error={start && end && end <= start ? "The expected end must fall after the start." : undefined}
              >
                <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
              </Field>
              <Field label="What it affects" required className="admin-form-grid__wide">
                <input
                  value={affects}
                  onChange={(e) => setAffects(e.target.value)}
                  placeholder="e.g. Batch execution, assessment grading"
                />
              </Field>
              <Field label="Learner-safe message" required className="admin-form-grid__wide">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  placeholder="What learners read while the window runs"
                />
              </Field>
            </div>
            <Button variant="primary" icon="check" disabled={!complete} onClick={declare}>
              Declare window
            </Button>
            <p className="meta">
              A window that could not be recorded is not in force — refused and said so, never
              displayed as scheduled while nothing enforces it. No outside status destination exists,
              so a window names none.
            </p>
          </Card>

          <Card live={windows.some((w) => w.status === "declared")}>
            <CardHeader title="Windows" icon="clock" eyebrow="learner-facing read" />
            {windows.length === 0 ? (
              <StateBlock state="empty" message="No window declared." />
            ) : (
              <div className="list">
                {windows.map((w) =>
                  w.status === "declared" ? (
                    <div key={w.id}>
                      <MaintenancePreview
                        status="Declared"
                        title={w.affects}
                        message={w.message}
                        facts={[
                          { term: "Starts", value: w.start.replace("T", " ") },
                          { term: "Expected end", value: w.end.replace("T", " ") }
                        ]}
                        note={END_NOTE}
                      />
                      <div className="row">
                        <Button variant="secondary" size="sm" onClick={() => setEndingId(w.id)}>
                          End window…
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <article key={w.id} className="list-row">
                      <div>
                        <strong>{w.affects}</strong>
                        <p className="meta">
                          {w.start.replace("T", " ")} → {w.end.replace("T", " ")}
                        </p>
                      </div>
                      <Chip size="sm" variant="quiet">ended</Chip>
                    </article>
                  )
                )}
              </div>
            )}
          </Card>

          <Dialog
            open={endingId !== null}
            title="End this window?"
            icon="clock"
            onClose={() => setEndingId(null)}
            actions={
              <>
                <Button variant="primary" onClick={() => ending && endWindow(ending.id)}>
                  End window
                </Button>
                <Button variant="quiet" onClick={() => setEndingId(null)}>
                  Cancel
                </Button>
              </>
            }
          >
            <p>
              The record closes and the learner-safe message clears once the affected paths report
              available. {ending ? `“${ending.affects}” — ${ending.start.replace("T", " ")} → ${ending.end.replace("T", " ")}.` : ""}
            </p>
          </Dialog>
        </>
      ) : null}
    </AdminPage>
  );
}
