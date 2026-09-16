/**
 * challenges — the learner catalogue, the submission history and Random.
 *
 * Catalogue (challenges/01): one volume line, the continue region, the topic
 * cloud, the track cards and the standalone listing — each row states
 * difficulty, XP at stake, the learner's own status and the acceptance
 * figure where one was counted.
 *
 * Status is the closed set: New / Submitted / Solved. A platform fault never
 * produces a "Submitted" — only a finalized submission of record does.
 */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Page, Back } from "@components/Page";
import { Icon } from "@icons/Icon";
import { CHALLENGES, TRACKS } from "@data/catalog";
import { useStore } from "@state/useStore";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { FilterBar } from "../../extraction/components/FilterBar/FilterBar";
import { ChipGroup } from "../../extraction/components/ChipGroup/ChipGroup";
import { detailFor, xpFor, TRACK_CONTENTS, TRACK_LANGUAGE } from "./data";

export type ChallengeStatus = "new" | "submitted" | "solved";

/** The learner's own status on a challenge — derived from the record, never stored twice. */
export function statusOf(id: string, solved: string[], submitted: string[]): ChallengeStatus {
  if (solved.includes(id)) return "solved";
  if (submitted.includes(id)) return "submitted";
  return "new";
}

export function Challenges() {
  const [statusFilter, setStatusFilter] = useState<"all" | ChallengeStatus>("all");
  const [diff, setDiff] = useState("All");
  const [tag, setTag] = useState("All");
  const [q, setQ] = useState("");
  const store = useStore();

  const allTags = useMemo(
    () => ["All", ...Array.from(new Set(CHALLENGES.flatMap((c) => c.tags))).sort()],
    []
  );

  const list = CHALLENGES.filter((c) => {
    const st = statusOf(c.id, store.solved, store.submitted);
    if (statusFilter !== "all" && st !== statusFilter) return false;
    if (diff !== "All" && c.difficulty !== diff) return false;
    if (tag !== "All" && !c.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return false;
    if (q && !`${c.title} ${c.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const solvedCount = CHALLENGES.filter((c) => store.solved.includes(c.id)).length;
  /* The continue region: the most recent submitted-but-unsolved challenge. */
  const continueTarget =
    store.submissions.find((s) => !store.solved.includes(s.challengeId)) ?? null;
  const continueChallenge = continueTarget
    ? CHALLENGES.find((c) => c.id === continueTarget.challengeId) ?? null
    : null;
  const filtered = statusFilter !== "all" || diff !== "All" || tag !== "All" || q !== "";

  return (
    <Page
      kind="sink"
      kicker="Practice"
      title="Challenges"
      lead={`${CHALLENGES.length} published challenges — ${solvedCount} solved on this device. Run checks the visible samples; Submit grades the full set.`}
      actions={<Link className="btn btn--quiet" to="/challenges/history">Submission history</Link>}
    >
      {continueChallenge ? (
        <Card live>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <p className="micro" style={{ margin: 0, color: "var(--c-text-faint)" }}>CONTINUE</p>
              <strong>{continueChallenge.title}</strong>
              <p className="meta" style={{ margin: "2px 0 0" }}>
                Last submission {continueTarget!.verdict === "wrong_answer" ? "was a wrong answer" : "ended without acceptance"} — the editor still holds your draft.
              </p>
            </div>
            <Link className="btn btn--primary" to={`/challenges/${continueChallenge.id}`}>Resume</Link>
          </div>
        </Card>
      ) : null}

      {/* Track cards — authored progression paths */}
      <section>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
          <h2 style={{ margin: 0, fontSize: "var(--text-lg)" }}>Tracks</h2>
          <Link className="btn btn--quiet" to="/challenges/dashboard">All tracks</Link>
        </div>
        <div className="sink__grid">
          {TRACKS.map((t, i) => {
            const contents = TRACK_CONTENTS[t.id] ?? [];
            const done = contents.filter((id) => store.solved.includes(id)).length;
            const completed = Boolean(store.trackCompletions[t.id]);
            return (
              <Card key={t.id} index={i}>
                <CardHeader title={t.title} icon="tracks" eyebrow={`${TRACK_LANGUAGE[t.id] ?? "Mixed"} track`} />
                <p className="meta">{t.description}</p>
                <p className="meta" style={{ marginTop: "var(--space-2)" }}>
                  {contents.length === 0
                    ? "No challenges yet"
                    : `${done} of ${contents.length} solved on this device${completed ? " · completed" : ""}`}
                </p>
                <div style={{ marginTop: "var(--space-3)" }}>
                  <Link className="btn btn--secondary" to={`/tracks/${t.id}`}>Open track</Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <FilterBar
        label="Challenge filters"
        search={{ value: q, onChange: setQ, placeholder: "Search problems or tags…" }}
        count={`${list.length} of ${CHALLENGES.length} challenge${CHALLENGES.length === 1 ? "" : "s"}`}
      >
        <ChipGroup
          label="Status"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as typeof statusFilter)}
          options={[
            { id: "all", label: "All" },
            { id: "new", label: "New" },
            { id: "submitted", label: "Submitted" },
            { id: "solved", label: "Solved" }
          ]}
        />
        <ChipGroup
          label="Difficulty"
          value={diff === "All" ? "all" : diff.toLowerCase()}
          onChange={(v) => setDiff(v === "all" ? "All" : v[0]!.toUpperCase() + v.slice(1))}
          options={[
            { id: "all", label: "All" },
            { id: "easy", label: "Easy" },
            { id: "medium", label: "Medium" },
            { id: "hard", label: "Hard" }
          ]}
        />
      </FilterBar>

      <ChipGroup
        label="Topic"
        hideLabel
        variant="quiet"
        size="sm"
        value={tag}
        onChange={setTag}
        options={allTags.map((t) => ({ id: t, label: t }))}
      />

      {list.length === 0 ? (
        <Card>
          <StateBlock
            state="empty"
            message="Nothing matches the current filters — the catalogue itself loaded fine."
            action={
              filtered ? (
                <button
                  className="btn btn--secondary"
                  type="button"
                  onClick={() => { setStatusFilter("all"); setDiff("All"); setTag("All"); setQ(""); }}
                >
                  Clear filters
                </button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <List>
          {list.map((c) => {
            const st = statusOf(c.id, store.solved, store.submitted);
            const detail = detailFor(c.id);
            return (
              <ListRow key={c.id} to={`/challenges/${c.id}`} done={st === "solved"} align="center">
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: "var(--text-base)" }}>{c.title}</strong>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                      <span className="chip chip--quiet" style={{ fontSize: "11px" }}>{xpFor(c.difficulty)} XP</span>
                      <span className="chip chip--quiet" style={{ fontSize: "11px" }}>{c.difficulty}</span>
                      {st === "solved" ? <span className="chip" style={{ fontSize: "11px" }}>✓ Solved</span> : null}
                      {st === "submitted" ? <span className="chip chip--quiet" style={{ fontSize: "11px" }}>Submitted</span> : null}
                    </div>
                  </div>
                  <p className="meta" style={{ margin: "4px 0 0" }}>
                    {c.tags.join(" · ")}
                    {detail.acceptRate !== null ? ` · ${detail.acceptRate}% acceptance` : ""}
                  </p>
                </div>
                <Icon name="chevron-right" size={14} />
              </ListRow>
            );
          })}
        </List>
      )}

      <div className="row">
        <Link className="btn btn--secondary" to="/challenges/random">Random challenge</Link>
      </div>
    </Page>
  );
}

export function ChallengeHistory() {
  const store = useStore();
  return (
    <Page
      kind="sink"
      kicker="Practice"
      title="Submission history"
      lead="Finalized submissions on this device, newest first. A platform fault writes no row — a fault is never a wrong answer."
      actions={<Back to="/challenges">Catalogue</Back>}
    >
      {store.submissions.length === 0 ? (
        <Card><StateBlock state="empty" message="No submissions yet." action={<Link className="btn btn--primary" to="/challenges">Browse challenges</Link>} /></Card>
      ) : (
        <List>
          {store.submissions.map((s) => {
            const c = CHALLENGES.find((x) => x.id === s.challengeId);
            return (
              <ListRow key={s.id} to={`/challenges/${s.challengeId}`} align="center">
                <div style={{ flex: 1 }}>
                  <strong>{c?.title ?? s.challengeId}</strong>
                  <p className="meta" style={{ margin: "2px 0 0" }}>
                    {new Date(s.at).toLocaleString()} · {s.language} · {s.casesPassed}/{s.casesTotal} cases
                  </p>
                </div>
                <span className={`chip ${s.verdict === "accepted" ? "" : "chip--quiet"}`} style={{ fontSize: "11px" }}>
                  {s.verdict === "accepted" ? "Accepted" : s.verdict === "wrong_answer" ? "Wrong answer" : s.verdict === "runtime_error" ? "Runtime error" : "Time limit"}
                </span>
              </ListRow>
            );
          })}
        </List>
      )}
    </Page>
  );
}

export function RandomChallenge() {
  const store = useStore();
  const [picked, setPicked] = useState<string | null>(null);
  const [declined, setDeclined] = useState<string[]>([]);

  /* Uniform over the published standalone challenges still unsolved on this
     device (challenges §4.7) — declined picks leave the pool for this visit. */
  const pool = CHALLENGES.filter((c) => !store.solved.includes(c.id) && !declined.includes(c.id));
  const pick = picked ? CHALLENGES.find((c) => c.id === picked) ?? null : null;

  function pickOne() {
    if (pool.length === 0) return;
    if (pick) setDeclined((d) => [...d, pick.id]);
    const next = pool[Math.floor(Math.random() * pool.length)];
    setPicked(next?.id ?? null);
  }

  return (
    <Page
      kind="sink"
      kicker="Practice"
      title="Random challenge"
      lead="A uniform pick over the unsolved published catalogue — eligibility only, never a ranking and never a re-serve of a solved problem."
      actions={<Back to="/challenges">Catalogue</Back>}
    >
      {pick ? (
        <Card live>
          <CardHeader title={pick.title} icon="challenges" eyebrow={`${pick.difficulty} · ${xpFor(pick.difficulty)} XP`} />
          <p className="page__lead">{pick.prompt.split("\n")[0]}</p>
          <p className="meta">{pick.tags.join(" · ")}</p>
          <div className="row" style={{ marginTop: "var(--space-4)" }}>
            <Link className="btn btn--primary" to={`/challenges/${pick.id}`}>Open the workbench</Link>
            <button className="btn btn--quiet" type="button" onClick={pickOne}>Pick again</button>
          </div>
        </Card>
      ) : pool.length === 0 ? (
        <Card>
          <StateBlock
            state="empty"
            message={
              CHALLENGES.every((c) => store.solved.includes(c.id))
                ? "Everything the catalogue reaches is solved on this device — that is an achievement, not an error."
                : "No unsolved challenge is left in the pick pool."
            }
            action={<Link className="btn btn--secondary" to="/challenges">Browse the catalogue</Link>}
          />
        </Card>
      ) : (
        <Card live>
          <CardHeader title="Draw one" icon="challenges" />
          <p className="page__lead">{pool.length} unsolved challenge{pool.length === 1 ? "" : "s"} in the pool.</p>
          <button className="btn btn--primary" type="button" onClick={pickOne}>Pick a challenge</button>
        </Card>
      )}
    </Page>
  );
}
