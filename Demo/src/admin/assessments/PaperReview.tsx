/**
 * PaperReview — the publish-gate surface the workspace's Review tab and the
 * standalone /publish route share (assessments.F17, the W03 pattern).
 *
 * Blocking issues are listed separately from warnings, each pointing at the
 * field or section it concerns. The gate runs on the current draft — a draft
 * changed since the last run invalidates that readiness and the commit is
 * refused until the checks re-run. A run against nothing registered cannot
 * verify and never reads ready; a check that cannot run is not yet verifiable
 * and blocks like a failure. A super administrator publishes directly; every
 * other role's publish becomes a submission that stays in draft for the
 * approval queue. On a frozen paper the same surface reads back what the gate
 * saw and names the correction paths — administrative invalidation for a
 * test, a duplicate for content.
 */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import { useStore } from "@state/useStore";
import { canPublishDirect } from "../roles";
import { Dialog } from "../../extraction/components/Dialog/Dialog";
import { Button } from "../../extraction/components/Button/Button";
import {
  invalidatableSittingFor,
  markPaperPublished,
  publishChecksFor,
  publishWarningsFor,
  type PublishCheck,
  type StudioPaper
} from "./fixtures";

const STATUS_ICON = { pass: "check", fail: "x", unverifiable: "alert" } as const;
const STATUS_WORD = { pass: "pass", fail: "fails", unverifiable: "not yet verifiable" } as const;

type Phase = "idle" | "checking" | "done";
type Outcome = "published" | "submitted" | null;

function CheckRow({ check }: { check: PublishCheck }) {
  return (
    <div className="a-check" data-status={check.status}>
      <span className="a-check__mark" aria-hidden="true"><Icon name={STATUS_ICON[check.status]} size={13} /></span>
      <div className="a-check__body">
        <div className="a-check__name">{check.name}</div>
        <div className="a-check__meta">
          {check.scope === "shared" ? "shared contract" : `${check.scope === "mock" ? "Mock" : "Company"} contract`} · {STATUS_WORD[check.status]}
          {check.detail ? ` · ${check.detail}` : ""}
        </div>
      </div>
    </div>
  );
}

/** A blocking issue: the failed or unverifiable check, its fix, and a link to
 *  the field or section the fix lands on — each offending question named and
 *  linked to its own authoring address. */
function BlockerRow({ check }: { check: PublishCheck }) {
  return (
    <div className="a-check" data-status={check.status}>
      <span className="a-check__mark" aria-hidden="true"><Icon name={STATUS_ICON[check.status]} size={13} /></span>
      <div className="a-check__body">
        <div className="a-check__name">{check.name}</div>
        <div className="a-check__meta">
          {check.scope === "shared" ? "shared contract" : `${check.scope === "mock" ? "Mock" : "Company"} contract`} · {STATUS_WORD[check.status]}
          {check.detail ? ` · ${check.detail}` : ""}
        </div>
        {check.fix ? <p className="a-check__fix">{check.fix}</p> : null}
        {check.status === "unverifiable" ? (
          <p className="a-check__fix a-check__fix--warn">
            not yet verifiable — the check could not run; publication is refused rather than allowed through
          </p>
        ) : null}
        {check.to ? (
          <p className="a-check__to">
            <Link to={check.to}>Open where it is fixed</Link>
            {check.links?.map((l) => (
              <Link key={l.to} to={l.to}>{l.label}</Link>
            ))}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function PaperReview({
  paper,
  /** Fingerprint of the checked object — a changed draft invalidates the
   *  readiness of a previous run. */
  revision,
  /** After a direct publish — the workspace flips its own lifecycle. */
  onPublished
}: {
  paper: StudioPaper;
  revision: string;
  onPublished?: () => void;
}) {
  const store = useStore();
  const [phase, setPhase] = useState<Phase>("idle");
  const [ranRevision, setRanRevision] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);

  /* The gate reads the saved revision — the paper's reference is stable across
     a save, so the fingerprint keys the recompute. */
  const checks = useMemo(() => publishChecksFor(paper), [paper, revision]);
  const warnings = useMemo(() => publishWarningsFor(paper), [paper, revision]);
  const blockers = checks.filter((c) => c.status !== "pass");
  const frozen = paper.lifecycle !== "draft" || outcome === "published";
  const stale = phase === "done" && ranRevision !== revision;
  const direct = canPublishDirect(store.session.role);
  const invalidatable = invalidatableSittingFor(paper.id);
  const publishable =
    phase === "done" && !stale && checks.length > 0 && blockers.length === 0 &&
    paper.lifecycle === "draft" && outcome === null;

  function runChecks() {
    const rev = revision;
    setPhase("checking");
    window.setTimeout(() => {
      setRanRevision(rev);
      setPhase("done");
    }, 500);
  }

  function commit() {
    setConfirming(false);
    if (!direct) {
      /* Awaiting approval is the workflow state of the draft — the paper
         itself stays a draft until a reviewer approves or returns it. */
      setOutcome("submitted");
      return;
    }
    /* The freeze lands on the record itself so the index, the workspace and
       the standalone routes agree for the session. */
    markPaperPublished(paper.id);
    setOutcome("published");
    onPublished?.();
  }

  return (
    <>
      <Card>
        <CardHeader
          title={frozen ? "The gate, read back" : "Review & publish"}
          icon="check"
          eyebrow={`${paper.type === "mock" ? "Mock" : "Company"} contract + shared contract`}
          action={
            !frozen ? (
              <Button variant="secondary" size="sm" icon="check"
                disabled={phase === "checking"} onClick={runChecks}>
                {phase === "checking" ? "Checking…" : phase === "done" ? "Re-check the draft" : "Check for issues"}
              </Button>
            ) : undefined
          }
        />

        {frozen ? (
          <>
            <p className="meta">
              {paper.lifecycle === "archived" ? "Archived — the step is terminal; " : "Published — "}
              the paper froze at publish and this is the gate's read-back of the record, not a live
              gate. Administrative invalidation voids a test; the only content correction is a
              duplicate — archive, fix the copy, publish it as a new paper.
            </p>
            {checks.map((c) => <CheckRow key={c.id} check={c} />)}
          </>
        ) : phase === "idle" ? (
          <p className="meta">The gate has not run on this draft — check for issues.</p>
        ) : phase === "checking" ? (
          <StateBlock state="pending" compact message="Running every registered check against the current draft…" />
        ) : checks.length === 0 ? (
          /* No registered checks can never read ready. */
          <StateBlock
            state="refused"
            message="Cannot verify — no checks are registered for this paper. Publication is refused rather than allowed through on an unknown."
          />
        ) : (
          <>
            {stale ? (
              <StateBlock
                state="stale"
                compact
                message="The draft changed since the last check run — previous readiness is invalidated; re-check before the commit is offered."
              />
            ) : null}

            <h3 className="a-subhead">
              Blocking issues — {blockers.length === 0 ? "none standing" : `${blockers.length} standing`}
            </h3>
            {blockers.length === 0 ? (
              <p className="meta">No blockers stand against this draft.</p>
            ) : (
              blockers.map((c) => <BlockerRow key={c.id} check={c} />)
            )}

            <h3 className="a-subhead">Warnings — the commit goes through with them</h3>
            {warnings.length === 0 ? (
              <p className="meta">No warnings.</p>
            ) : (
              warnings.map((w) => (
                <div className="a-check" data-status="warn" key={w.id}>
                  <span className="a-check__mark" aria-hidden="true"><Icon name="alert" size={13} /></span>
                  <div className="a-check__body">
                    <div className="a-check__name">{w.message}</div>
                    <p className="a-check__to"><Link to={w.to}>Open where it is addressed</Link></p>
                  </div>
                </div>
              ))
            )}

            <h3 className="a-subhead">
              Every named check — {checks.filter((c) => c.status === "pass").length} of {checks.length} pass
            </h3>
            {checks.map((c) => <CheckRow key={c.id} check={c} />)}
          </>
        )}
      </Card>

      <Card>
        <CardHeader title={frozen ? "Correction paths" : direct ? "Publish" : "Submit for approval"} icon="arrow-right" />
        {frozen ? (
          <>
            <div className="row">
              <Link className="btn btn--secondary" to={`/admin/mocks/${paper.id}/published`}>
                The read-only record — duplicate or archive
              </Link>
              <Link className="btn btn--quiet" to={`/admin/mocks/${paper.id}?tab=settings`}>
                Settings after publication
              </Link>
              {invalidatable ? (
                <Link className="btn btn--quiet" to={`/admin/sittings/${invalidatable.id}/invalidate`}>
                  Invalidate a test…
                </Link>
              ) : null}
            </div>
          </>
        ) : (
          <>
            {outcome === "submitted" ? (
              <StateBlock
                state="pending"
                compact
                message="Submitted — awaiting approval. The draft stays a draft until a reviewer approves or returns it; editing the draft invalidates the submission."
              />
            ) : (
              <>
                {phase !== "done" ? (
                  <p className="meta">The commit is refused until the checks have run on this draft.</p>
                ) : stale ? (
                  <p className="meta">The commit is refused until the changed draft is re-checked.</p>
                ) : blockers.length > 0 ? (
                  <p className="meta">
                    The commit is refused until every named check passes — {blockers.length}{" "}
                    blocking issue{blockers.length === 1 ? "" : "s"}, each reported above with its fix.
                  </p>
                ) : checks.length === 0 ? null : (
                  <p className="meta">
                    Every check passes{warnings.length > 0 ? ` — ${warnings.length} warning${warnings.length === 1 ? "" : "s"} ride along, listed above` : ""}.
                  </p>
                )}
                <div className="row">
                  <button
                    className="btn btn--primary"
                    type="button"
                    disabled={!publishable}
                    onClick={() => setConfirming(true)}
                  >
                    {direct ? "Publish — the paper freezes permanently" : "Submit for approval"}
                  </button>
                  {!publishable ? <span className="meta">Not offered while a blocker or a stale run stands.</span> : null}
                </div>
              </>
            )}
          </>
        )}
      </Card>

      <Dialog
        open={confirming}
        title={direct ? "Publish this paper?" : "Submit this paper for approval?"}
        icon="alert"
        onClose={() => setConfirming(false)}
        actions={
          <>
            <Button onClick={commit}>
              {direct ? "Publish — the paper freezes permanently" : "Submit for approval"}
            </Button>
            <Button variant="secondary" onClick={() => setConfirming(false)}>Keep the draft</Button>
          </>
        }
      >
        {direct ? (
          <>
            <p>Publishing <strong>{paper.title || "this draft"}</strong> states three things:</p>
            <ul>
              <li>The paper freezes permanently — questions, options, keys, marks, explanations, the section set and its order. There are no paper versions.</li>
              <li>The only correction is a duplicate — archive, fix the copy, publish it as a new paper with a new identity.</li>
              <li>Settings stay editable — the enumerated set for this type, validated exactly as on a draft.</li>
            </ul>
          </>
        ) : (
          <p>
            Your role's publish becomes a submission — <strong>{paper.title || "this draft"}</strong>{" "}
            is held in draft as awaiting approval until a reviewer approves or returns it. Editing the
            draft invalidates the submission.
          </p>
        )}
      </Dialog>
    </>
  );
}
