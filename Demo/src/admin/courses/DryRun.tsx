/**
 * DryRun — `curriculum/:id/publish`. Review & publish for the item in
 * context — the global item picker is gone; the page opens scoped to the
 * selected item and returns to it.
 *
 * The gate: blocking issues and warnings list separately, each linking to
 * the lesson or field it concerns; publish is available only at zero
 * blockers AND only when the registered checks actually verified — a run
 * with no registered checks, a check still processing, or a check that
 * could not run reads "Cannot verify" and never enables Publish. The publish
 * itself re-checks the gate. A super administrator publishes directly;
 * every other role's publish becomes a submission that waits in the
 * approval queue.
 */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import { AdminPage } from "../AdminShell";
import { Breadcrumbs } from "../../extraction/components/Breadcrumbs/Breadcrumbs";
import { useStore } from "@state/useStore";
import { publishLessonSnapshot } from "@state/store";
import { canPublishDirect } from "../roles";
import { itemTo } from "./hierarchy";
import {
  GROUP_LABEL,
  addSubmission,
  dryRunFor,
  findItem,
  itemStats,
  nextNodeId,
  readStudioTree,
  writeStudioTree,
  type Finding
} from "./fixtures";
import "./courses.css";

type Phase = "idle" | "running" | "done" | "publishing" | "refused" | "published" | "submitted";

function FindingRow({ finding }: { finding: Finding }) {
  return (
    <div className="cs-preview-row">
      <span className="cs-preview-row__title">
        <strong>{finding.message}</strong>
        <p className="meta">
          {finding.target} · field: {finding.field}
        </p>
      </span>
      <span className="cs-preview-row__end">
        {finding.to ? (
          <Link className="btn btn--quiet" to={finding.to}>Open it</Link>
        ) : null}
      </span>
    </div>
  );
}

/** The run's verdict — derived, never asserted. Publishing needs zero
 *  blockers AND every registered check verified; anything less reads what
 *  it is: blocked, checking, or cannot verify. */
function verdict(fixture: ReturnType<typeof dryRunFor>, publishRefusal: Finding | null) {
  const blockerCount = fixture.blockers.length + (publishRefusal ? 1 : 0);
  if (fixture.checks.length === 0) {
    return { key: "cannot-verify" as const, blockerCount, reason: "No checks were registered for this draft — nothing verified it." };
  }
  const unsettled = fixture.checks.filter((c) => c.state !== "ready");
  if (unsettled.length > 0) {
    return {
      key: "cannot-verify" as const,
      blockerCount,
      reason: `${unsettled.length} ${unsettled.length === 1 ? "check" : "checks"} could not verify — ${unsettled.map((c) => c.label).join("; ")}.`
    };
  }
  if (blockerCount > 0) return { key: "blocked" as const, blockerCount };
  return { key: "ready" as const, blockerCount };
}

export function DryRun() {
  const { id = "" } = useParams();
  const store = useStore();
  const [items, setItems] = useState(readStudioTree);
  const item = findItem(items, id);

  const [phase, setPhase] = useState<Phase>("idle");
  const [publishRefusal, setPublishRefusal] = useState<Finding | null>(null);
  const [announce, setAnnounce] = useState<"announce" | "quiet">("quiet");

  if (!item) {
    return (
      <AdminPage kicker="Content / Curriculum" title="Review & publish">
        <StateBlock
          state="unavailable"
          message="That item is not in the studio tree."
          action={<Link className="btn btn--secondary" to="/admin/curriculum">Back to Courses</Link>}
        />
      </AdminPage>
    );
  }

  const fixture = dryRunFor(item);
  const v = verdict(fixture, publishRefusal);
  const stats = itemStats(item);
  const groupWord = GROUP_LABEL[item.family];
  const direct = canPublishDirect(store.session.role);

  function runDryRun() {
    setPhase("running");
    setPublishRefusal(null);
    window.setTimeout(() => setPhase("done"), 600);
  }

  function publish() {
    /* The publish re-checks the gate — a blocker that appeared since the dry
       run refuses the whole publish and names itself. */
    setPhase("publishing");
    window.setTimeout(() => {
      if (!item) return;
      if (fixture.blockerAtPublish) {
        setPublishRefusal(fixture.blockerAtPublish);
        setPhase("refused");
        return;
      }
      if (direct) {
        /* The publish lands in the session overlay: the item goes live and
           every complete draft lesson publishes with it; incomplete drafts
           stay drafts — they were never part of this publish. */
        const next = items.map((it) =>
          it.id === item.id
            ? {
                ...it,
                lifecycle: "published" as const,
                pristine: false,
                groups: it.groups.map((g) => ({
                  ...g,
                  lessons: g.lessons.map((l) =>
                    l.lifecycle === "draft" && !l.incomplete
                      ? { ...l, lifecycle: "published" as const }
                      : l
                  )
                }))
              }
            : it
        );
        setItems(next);
        writeStudioTree(next);
        /* The live-outline seam — each lesson this publish carries gets a
           published snapshot, so the learner reader shows exactly what the
           author just published and nothing else. */
        const publishedItem = next.find((it) => it.id === item.id);
        publishedItem?.groups.forEach((g) =>
          g.lessons.forEach((l) => {
            if (l.lifecycle === "published")
              publishLessonSnapshot({
                lessonId: l.id,
                courseId: item.id,
                title: l.title,
                type: l.type,
                minutes: l.minutes,
                blocks: l.blocks,
                publishedAt: new Date().toISOString()
              });
          })
        );
        setPhase("published");
      } else {
        /* A submission stays in draft and waits in the one approval queue. */
        addSubmission({
          id: nextNodeId("sub"),
          itemId: item.id,
          title: item.title,
          author: store.session.name,
          submittedAt: "just now",
          note: `${stats.lessons} ${stats.lessons === 1 ? "lesson" : "lessons"} — submitted from review & publish`
        });
        const next = items.map((it) =>
          it.id === item.id ? { ...it, lifecycle: "submitted" as const } : it
        );
        setItems(next);
        writeStudioTree(next);
        setPhase("submitted");
      }
    }, 600);
  }

  const settled = phase === "published" || phase === "submitted";

  return (
    <AdminPage
      kicker={`Content / Curriculum / ${item.title}`}
      title="Review & publish"
      lead="The dry run checks the saved draft of this item. Blockers list separately from warnings and each names the lesson or field it concerns. Publish is available only at zero blockers with every registered check verified — and is re-checked at the publish itself."
      actions={
        <Link className="btn btn--secondary" to={itemTo(item.id)}>Back to {item.title}</Link>
      }
    >
      <Breadcrumbs
        label="Studio tree"
        items={[
          { label: "Courses", to: "/admin/curriculum" },
          { label: item.title, to: itemTo(item.id) },
          { label: "Review & publish" }
        ]}
      />

      <Card>
        <CardHeader
          title={item.title}
          icon="check"
          eyebrow={`${item.lifecycle} · ${stats.groups} ${groupWord}${stats.groups === 1 ? "" : "s"} · ${stats.lessons} ${stats.lessons === 1 ? "lesson" : "lessons"}`}
          action={
            <button
              type="button"
              className="btn btn--secondary"
              onClick={runDryRun}
              disabled={phase === "running" || phase === "publishing" || settled}
            >
              {phase === "running" ? "Running…" : phase === "done" || phase === "refused" ? "Re-run the checks" : "Run the checks"}
            </button>
          }
        />

        {phase === "running" || phase === "publishing" ? (
          <StateBlock
            state="pending"
            message={phase === "running" ? "Running the gate on the draft…" : "Re-checking the gate at the publish…"}
            compact
          />
        ) : phase === "idle" ? (
          <p className="meta">Not checked — run the checks on this draft. A changed draft invalidates a previous result.</p>
        ) : (
          <>
            <h3 className="cs-label">Checks</h3>
            {fixture.checks.length === 0 ? (
              <p className="cs-note" data-tone="err" role="alert">
                <Icon name="alert" size={14} /> Cannot verify — no checks were registered for this
                draft. Publish stays unavailable; an unverified draft never goes live.
              </p>
            ) : (
              <div className="cs-lines">
                {fixture.checks.map((c) => (
                  <div className="cs-preview-row" key={c.id}>
                    <span className="cs-preview-row__title">
                      <strong>{c.label}</strong>
                      {c.note ? <p className="meta">{c.note}</p> : null}
                    </span>
                    <span className="cs-preview-row__end">
                      {c.state === "ready" ? (
                        <span className="cs-badge" data-tone="ok">verified</span>
                      ) : c.state === "processing" ? (
                        <span className="cs-badge" data-tone="warn">still processing</span>
                      ) : (
                        <span className="cs-badge" data-tone="err">cannot verify</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <h3 className="cs-label">
              Blocking issues — {fixture.blockers.length === 0 ? "none" : `${fixture.blockers.length} standing`}
            </h3>
            {fixture.blockers.length === 0 ? (
              <p className="meta">No blocking issues stand against this draft.</p>
            ) : (
              <div className="cs-lines">
                {fixture.blockers.map((f) => <FindingRow key={f.id} finding={f} />)}
              </div>
            )}

            <h3 className="cs-label">Warnings — publish goes through with them</h3>
            {fixture.warnings.length === 0 ? (
              <p className="meta">No warnings.</p>
            ) : (
              <div className="cs-lines">
                {fixture.warnings.map((f) => <FindingRow key={f.id} finding={f} />)}
              </div>
            )}

            <h3 className="cs-label">Change summary</h3>
            <p className="meta">
              {item.lifecycle === "published"
                ? `“${item.title}” is live — this publish carries the saved draft over it.`
                : `“${item.title}” goes live for the first time.`}{" "}
              {stats.lessons} {stats.lessons === 1 ? "lesson" : "lessons"} across {stats.groups}{" "}
              {groupWord}{stats.groups === 1 ? "" : "s"}; {stats.drafts}{" "}
              {stats.drafts === 1 ? "lesson stays" : "lessons stay"} in draft
              {stats.drafts > 0 ? " (incomplete drafts are never part of a publish)" : ""}.
            </p>

            <h3 className="cs-label">Announcement</h3>
            <div className="list" role="radiogroup" aria-label="Announcement">
              <label className="cs-check">
                <input
                  type="radio"
                  name="announce"
                  checked={announce === "quiet"}
                  onChange={() => setAnnounce("quiet")}
                />
                Publish quietly — no announcement
              </label>
              <label className="cs-check">
                <input
                  type="radio"
                  name="announce"
                  checked={announce === "announce"}
                  onChange={() => setAnnounce("announce")}
                  disabled={item.enrolled === 0}
                />
                Announce to the {item.enrolled} enrolled {item.enrolled === 1 ? "learner" : "learners"}
              </label>
            </div>

            {phase === "refused" && publishRefusal ? (
              <p className="cs-note" data-tone="err" role="alert">
                <Icon name="alert" size={14} /> The publish was re-checked and a blocker now
                stands — {publishRefusal.message} ({publishRefusal.target}, field:{" "}
                {publishRefusal.field}). Nothing went live, not partially.
              </p>
            ) : null}
            {phase === "published" ? (
              <>
                <p className="cs-note" data-tone="ok" role="status">
                  <Icon name="check" size={14} /> Published — the draft is live in one act, parents
                  before children{announce === "announce" ? `, announced to the ${item.enrolled} enrolled` : ", no announcement sent"}. The change record captured who changed what and when.
                </p>
                <div className="row">
                  <Link className="btn btn--primary" to={`/courses/${item.id}`}>View as learner</Link>
                  <Link className="btn btn--secondary" to={itemTo(item.id)}>Back to {item.title}</Link>
                </div>
              </>
            ) : null}
            {phase === "submitted" ? (
              <>
                <p className="cs-note" data-tone="warn" role="status">
                  <Icon name="clock" size={14} /> Submitted — your role's publish became a
                  submission. The draft waits in the approval queue; editing it invalidates the
                  submission.
                </p>
                <div className="row">
                  <Link className="btn btn--secondary" to="/admin/curriculum/approvals">Open the approval queue</Link>
                  <Link className="btn btn--secondary" to={itemTo(item.id)}>Back to {item.title}</Link>
                </div>
              </>
            ) : null}

            {!settled ? (
              <div className="cs-commit">
                {direct ? (
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={v.key !== "ready"}
                    title={
                      v.key === "blocked"
                        ? "Publish is available only at zero blocking issues"
                        : v.key === "cannot-verify"
                          ? "Publish needs every registered check verified"
                          : undefined
                    }
                    onClick={publish}
                  >
                    Publish
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={v.key !== "ready"}
                    title={
                      v.key === "blocked"
                        ? "Submission is available only at zero blocking issues"
                        : v.key === "cannot-verify"
                          ? "Submission needs every registered check verified"
                          : undefined
                    }
                    onClick={publish}
                  >
                    Submit for approval
                  </button>
                )}
                {v.key === "blocked" ? (
                  <span className="meta">
                    available only at zero blocking issues — {v.blockerCount} standing
                  </span>
                ) : v.key === "cannot-verify" ? (
                  <span className="meta">cannot verify — {v.reason}</span>
                ) : (
                  <span className="meta">
                    {fixture.warnings.length === 0
                      ? "verified — ready"
                      : `ready with ${fixture.warnings.length} ${fixture.warnings.length === 1 ? "warning" : "warnings"}`}
                  </span>
                )}
              </div>
            ) : null}
          </>
        )}
      </Card>
    </AdminPage>
  );
}
