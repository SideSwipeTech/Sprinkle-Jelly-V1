/**
 * ApprovalQueue — `curriculum/approvals`. Submitted drafts from authors below
 * super administrator. A reviewer approves — which publishes in the same act —
 * or rejects with a note, which returns the draft to its author with the note.
 * Editing a submitted draft invalidates the submission. Nothing moves without
 * a person acting: no time-based or automatic transition.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import {
  findItem,
  loadedNote,
  readStudioTree,
  readSubmissions,
  writeStudioTree,
  type Submission
} from "./fixtures";
import "./courses.css";

type QueueRow = Submission & {
  status: "pending" | "approved" | "rejected" | "invalidated";
  decisionNote?: string;
};

export function ApprovalQueue() {
  const [items] = useState(readStudioTree);
  /* The queue reads the session overlay — a draft submitted from review &
     publish waits here after navigation. */
  const [rows, setRows] = useState<QueueRow[]>(() =>
    readSubmissions().map((s) => ({ ...s, status: "pending" as const }))
  );
  const [rejecting, setRejecting] = useState<QueueRow | null>(null);
  const [note, setNote] = useState("");

  const pending = rows.filter((r) => r.status === "pending");
  const settled = rows.filter((r) => r.status !== "pending");

  function approve(row: QueueRow) {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: "approved" } : r)));
    /* Approval publishes in the same act — the item goes live in the
       session overlay when it is on the tree. */
    if (findItem(items, row.itemId)) {
      writeStudioTree(
        items.map((i) => (i.id === row.itemId ? { ...i, lifecycle: "published" as const } : i))
      );
    }
  }

  function reject() {
    if (!rejecting || !note.trim()) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === rejecting.id ? { ...r, status: "rejected", decisionNote: note.trim() } : r
      )
    );
    setRejecting(null);
    setNote("");
  }

  function invalidate(row: QueueRow) {
    /* Editing a submitted draft invalidates the submission — the author
       resubmits when the edits are meant to be reviewed. */
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: "invalidated" } : r)));
  }

  function resubmit(row: QueueRow) {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: "pending" } : r)));
  }

  return (
    <AdminPage
      kicker="Content / Curriculum"
      title="The approval queue"
      lead="Drafts submitted by authors below super administrator. Approval publishes in the same act; rejection returns the draft with the reviewer's note."
      actions={<Link className="btn btn--secondary" to="/admin/curriculum">Back to Courses</Link>}
    >
      <p className="meta">{loadedNote(rows.length, null)}</p>

      <Card>
        <CardHeader
          title="Waiting on a reviewer"
          icon="inbox"
          eyebrow={`${pending.length} pending`}
        />
        {pending.length === 0 ? (
          <StateBlock state="empty" message="Nothing waits on review." compact />
        ) : (
          <div className="cs-lines">
            {pending.map((row) => (
              <div className="cs-node" key={row.id}>
                <div className="cs-node__row">
                  <span className="cs-node__title">
                    <strong>
                      {findItem(items, row.itemId) ? (
                        <Link to={`/admin/curriculum/items/${row.itemId}`}>{row.title}</Link>
                      ) : (
                        row.title
                      )}
                    </strong>
                    <span className="meta">
                      submitted by {row.author} · {row.submittedAt} · {row.note}
                    </span>
                  </span>
                  <span className="cs-node__end">
                    <button type="button" className="btn btn--primary" onClick={() => approve(row)}>
                      Approve — publish
                    </button>
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={() => {
                        setRejecting(row);
                        setNote("");
                      }}
                    >
                      Reject with a note
                    </button>
                    <button type="button" className="btn btn--quiet" onClick={() => invalidate(row)}>
                      Edit the submitted draft
                    </button>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="meta">
          Approval publishes in the same act. Rejection returns it with the note. Editing a
          submitted draft invalidates the submission.
        </p>
      </Card>

      {settled.length > 0 ? (
        <Card>
          <CardHeader title="Settled" icon="history" eyebrow={`${settled.length} settled`} />
          <div className="cs-lines">
            {settled.map((row) => (
              <div className="cs-preview-row" key={row.id}>
                <span className="cs-preview-row__title">
                  <strong>{row.title}</strong>
                  <p className="meta">
                    {row.status === "approved"
                      ? "approved — published in the same act"
                      : row.status === "rejected"
                        ? `rejected — returned to ${row.author} with the note “${row.decisionNote}”`
                        : "invalidated — the submitted draft was edited"}
                  </p>
                </span>
                <span className="cs-preview-row__end">
                  {row.status === "invalidated" ? (
                    <button type="button" className="btn btn--secondary" onClick={() => resubmit(row)}>
                      Resubmit
                    </button>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {rejecting ? (
        <Dialog
          title={`Reject — ${rejecting.title}`}
          icon="alert"
          onClose={() => setRejecting(null)}
          actions={
            <>
              <Button variant="quiet" onClick={() => setRejecting(null)}>
                Cancel
              </Button>
              <Button variant="destructive" disabled={!note.trim()} onClick={reject}>
                Reject with this note
              </Button>
            </>
          }
        >
          <p>
            Rejection returns the draft to {rejecting.author} with your note. The note is required —
            a bare refusal tells the author nothing.
          </p>
          <label className="field">
            <span className="meta">Reviewer's note</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              aria-label="Reviewer's note"
            />
          </label>
        </Dialog>
      ) : null}
    </AdminPage>
  );
}
