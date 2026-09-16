/**
 * tracks — the authored challenge-progression paths.
 *
 * A track is a sequence of references into the same catalogue: solving a
 * track challenge is the same underlying solve, so coverage derives from the
 * learner's solved set, never a separate counter. The track's completion is
 * durable and dated — and pays nothing beyond the entries' own first-solve
 * awards (challenges §4.6).
 */

import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Page, Back } from "@components/Page";
import { Icon } from "@icons/Icon";
import { Charge } from "@components/Charge";
import { CHALLENGES, TRACKS } from "@data/catalog";
import { useStore } from "@state/useStore";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { detailFor, xpFor, TRACK_CONTENTS, TRACK_LANGUAGE } from "./data";
import { statusOf } from "./challenges";

/** Track status — Not started / In progress / Completed, all derived. */
function trackStatus(trackId: string, solved: string[], completions: Record<string, string>) {
  const contents = TRACK_CONTENTS[trackId] ?? [];
  if (completions[trackId] || (contents.length > 0 && contents.every((id) => solved.includes(id)))) {
    return "Completed";
  }
  const done = contents.filter((id) => solved.includes(id)).length;
  return done > 0 ? "In progress" : "Not started";
}

export function ChallengesDashboard() {
  const store = useStore();
  return (
    <Page
      kind="sink"
      kicker="Practice"
      title="Tracks"
      lead="Authored progression paths over the same catalogue. A solve made here is the same solve everywhere — coverage counts against each track's live contents."
      actions={<Back to="/challenges">Catalogue</Back>}
    >
      <div className="sink__grid">
        {TRACKS.map((t, i) => {
          const contents = TRACK_CONTENTS[t.id] ?? [];
          const done = contents.filter((id) => store.solved.includes(id)).length;
          const status = trackStatus(t.id, store.solved, store.trackCompletions);
          return (
            <Card key={t.id} index={i}>
              <CardHeader
                title={t.title}
                icon="tracks"
                eyebrow={`${TRACK_LANGUAGE[t.id] ?? "Mixed"} track · ${status}`}
              />
              <p className="meta">{t.description}</p>
              {contents.length > 0 ? (
                <div style={{ marginTop: "var(--space-3)" }}>
                  <Charge value={Math.round((done / contents.length) * 100)} label={`${t.title} coverage`} asOf="this device" />
                  <p className="meta" style={{ marginTop: "4px" }}>{done} of {contents.length} solved</p>
                </div>
              ) : (
                <p className="meta" style={{ marginTop: "var(--space-3)" }}>No challenges yet</p>
              )}
              <div style={{ marginTop: "var(--space-3)" }}>
                <Link className="btn btn--secondary" to={`/tracks/${t.id}`}>Open track</Link>
              </div>
            </Card>
          );
        })}
      </div>
    </Page>
  );
}

export function TrackDetail() {
  const { trackId } = useParams();
  const t = TRACKS.find((x) => x.id === trackId);
  const store = useStore();
  if (!t) {
    return (
      <Page kind="sink" title="Track unavailable">
        <StateBlock state="unavailable" message="This track cannot be opened." action={<Back to="/challenges/dashboard">Tracks</Back>} />
      </Page>
    );
  }

  const contents = TRACK_CONTENTS[t.id] ?? [];
  const items = contents
    .map((id) => CHALLENGES.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const done = items.filter((c) => store.solved.includes(c.id)).length;
  const status = trackStatus(t.id, store.solved, store.trackCompletions);
  const completedAt = store.trackCompletions[t.id];
  const firstUnsolved = items.find((c) => !store.solved.includes(c.id)) ?? null;
  const completionRecognised = status === "Completed";
  const pct = items.length === 0 ? null : Math.round((done / items.length) * 100);

  return (
    <Page
      kind="sink"
      kicker={`Track · ${TRACK_LANGUAGE[t.id] ?? "Mixed"}`}
      title={t.title}
      lead={t.description}
      actions={<Back to="/challenges/dashboard">Tracks</Back>}
    >
      <Card live>
        <CardHeader eyebrow={status} title={completionRecognised ? "Track complete" : "Your progress"} icon="tracks" />
        {completionRecognised ? (
          <p className="page__lead">
            Completed {completedAt ? new Date(completedAt).toLocaleDateString() : "on this device"} — recorded.
            Completion pays nothing beyond each entry's own first-solve award.
          </p>
        ) : (
          <>
            <Charge value={pct} label={`${t.title} coverage`} asOf="this device" />
            <p className="meta" style={{ marginTop: "var(--space-2)" }}>
              {items.length === 0 ? "Nothing published in this track yet." : `${done} of ${items.length} solved on this device.`}
            </p>
          </>
        )}
        <div className="row" style={{ marginTop: "var(--space-4)" }}>
          {completionRecognised ? (
            <Link className="btn btn--secondary" to="/solutions">Review your solutions</Link>
          ) : firstUnsolved ? (
            <Link className="btn btn--primary" to={`/challenges/${firstUnsolved.id}?track=${t.id}`}>
              {done === 0 ? "Start the track" : "Continue"} — {firstUnsolved.title}
            </Link>
          ) : null}
        </div>
      </Card>

      <Card>
        <CardHeader title="Contents — author order" icon="list" />
        {items.length === 0 ? (
          <StateBlock
            state="empty"
            message="No challenges yet — nothing was published into this track. There is no start to offer."
          />
        ) : (
          <List>
            {items.map((c, i) => {
              const st = statusOf(c.id, store.solved, store.submitted);
              const isNext = c.id === firstUnsolved?.id;
              return (
                <ListRow key={c.id} to={`/challenges/${c.id}?track=${t.id}`} done={st === "solved"} align="center">
                  <span className="meta" style={{ width: "20px", flexShrink: 0 }}>{i + 1}.</span>
                  <div style={{ flex: 1 }}>
                    <strong>{c.title}</strong>
                    <p className="meta" style={{ margin: "2px 0 0" }}>
                      {c.difficulty} · {xpFor(c.difficulty)} XP{detailFor(c.id).acceptRate !== null ? ` · ${detailFor(c.id).acceptRate}% acceptance` : ""}
                    </p>
                  </div>
                  {st === "solved" ? <span className="chip" style={{ fontSize: "11px" }}>✓ Solved</span> : null}
                  {st === "submitted" ? <span className="chip chip--quiet" style={{ fontSize: "11px" }}>Submitted</span> : null}
                  {isNext ? <span className="chip" style={{ fontSize: "11px" }}>Next</span> : null}
                  <Icon name="chevron-right" size={14} />
                </ListRow>
              );
            })}
          </List>
        )}
      </Card>
    </Page>
  );
}
