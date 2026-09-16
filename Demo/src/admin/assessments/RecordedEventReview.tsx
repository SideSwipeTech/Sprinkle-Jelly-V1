/**
 * RecordedEventReview — the staff read of one test's integrity record
 * (assessments.F22, sittings/:sittingId/events).
 *
 * Read-only: the authoritative count of Recorded Events, the reason the
 * platform ended the test in plain language, and the timeline — every entry in
 * order, each carrying its kind, its time, its test, whether it counted and the
 * technical source. No camera, microphone, screen or typed text is ever read;
 * a count is never a finding about a person.
 */

import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, Stat, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { RecordedEventTimeline } from "../../extraction/components/RecordedEventTimeline/RecordedEventTimeline";
import { ACTION, getSitting } from "./fixtures";
import {
  ALL_PREVIEWS,
  CapabilityRefusal,
  ConflictDialog,
  ContentGuardNote,
  ContentWriteRefusal,
  LoadedLine,
  NotVerifiableNote,
  OutOfDateNote,
  PreviewBar,
  StudioLoading,
  usePreview
} from "./shared";

export function RecordedEventReview() {
  const { sittingId } = useParams();
  const sitting = getSitting(sittingId);
  const { preview, setPreview, allowed } = usePreview(ALL_PREVIEWS);

  if (!sitting) {
    return (
      <AdminPage kicker="Assessments · Recorded-Event review" title="Recorded Events" lead="The integrity record of one test.">
        <StateBlock state="unavailable" message="No test at this address."
          action={<Link className="btn btn--secondary" to="/admin/sittings">Tests</Link>} />
      </AdminPage>
    );
  }

  const counted = sitting.events.filter((e) => e.counted).length;

  return (
    <AdminPage
      kicker={`Assessments · ${sitting.paperTitle}`}
      title={`Recorded Events — test ${sitting.id}`}
      lead="Read-only. The authoritative count, the plain-language ending and the timeline — neutral browser events, never an accusation."
      actions={sitting.state !== "invalidated" ? (
        <Link className="btn btn--quiet" to={`/admin/sittings/${sitting.id}/invalidate`}>Invalidate this test…</Link>
      ) : undefined}
    >
      <PreviewBar active={preview} onChange={setPreview} allowed={allowed} />

      {preview === "loading" ? <StudioLoading /> : null}
      {preview === "refused" ? <CapabilityRefusal action={ACTION.reviewRecordedEvent} /> : null}
      {preview === "unverifiable" ? <NotVerifiableNote subject="The authoritative count" /> : null}
      {preview === "out-of-date" ? <OutOfDateNote /> : null}
      {preview === "content-write" ? <ContentWriteRefusal /> : null}
      {preview === "content-guard" ? <ContentGuardNote subject={`test ${sitting.id}`} /> : null}
      <ConflictDialog open={preview === "conflict"} onResolve={() => setPreview("loaded")} />

      {preview !== "loading" && preview !== "refused" && preview !== "conflict" ? (
        <>
          <div className="admin-health">
            <div className="admin-health__cell"><Stat label="Recorded Events — the authoritative count" value={String(counted)} unit={`of ${sitting.events.length} recorded · ceiling ${sitting.countedEventCeiling}`} /></div>
            <div className="admin-health__cell"><Stat label="Strictness on this test" value={sitting.strictness} /></div>
            <div className="admin-health__cell"><Stat label="State" value={sitting.state} /></div>
          </div>

          <Card>
            <CardHeader title="How the test ended" icon="info" />
            <p className="page__lead">
              {sitting.endedAt
                ? `${sitting.endingReason} — ${sitting.endedAt}.`
                : "The test has not ended — it is still in progress."}
            </p>
            {sitting.invalidation ? (
              <p className="meta">
                Invalidated by {sitting.invalidation.administrator} — {sitting.invalidation.reason.toLowerCase()}; note recorded.
              </p>
            ) : null}
          </Card>

          <Card>
            <CardHeader title="The timeline" icon="list" eyebrow="every entry in order" />
            <LoadedLine loaded={sitting.events.length} total={sitting.events.length} />
            <RecordedEventTimeline events={sitting.events} />
            <p className="meta">
              What never reaches this page: camera, microphone, screen contents, clipboard contents or
              typed text — nothing beyond these counts and their timeline is taken, stored or shown.
            </p>
          </Card>
        </>
      ) : null}
    </AdminPage>
  );
}
