/**
 * solutions — the learner's unlocked editorial record.
 *
 * Entries appear only after the first accepted solve. The three tabs are real
 * filters, not decoration: Challenges (catalogue accepts), Daily rituals
 * (completed product dates) and Debug fixes (accepted case fixes). A debug
 * fix opens its case file; a daily entry opens the day's record.
 */

import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Page, Back } from "@components/Page";
import { Icon } from "@icons/Icon";
import { CHALLENGES, DEBUG_CASES } from "@data/catalog";
import { useStore } from "@state/useStore";
import { List, ListRow } from "../../extraction/components/ListRow/ListRow";
import { ChipTabBar } from "../../extraction/components/ChipTabBar/ChipTabBar";
import { xpFor, languageLabel } from "./data";
import { dailyChallengeForDate, formatProductDay } from "../daily/schedule";

type EntryKind = "challenge" | "daily" | "debug";

interface SolutionEntry {
  key: string;
  kind: EntryKind;
  title: string;
  subtitle: string;
  dateLabel: string;
  to: string;
}

export function Solutions() {
  const store = useStore();
  const [filter, setFilter] = useState<"all" | EntryKind>("all");

  const entries = useMemo(() => {
    const rows: SolutionEntry[] = [];
    for (const id of store.solved) {
      const c = CHALLENGES.find((x) => x.id === id);
      if (!c) continue;
      const latest = store.submissions.find((s) => s.challengeId === id && s.verdict === "accepted");
      rows.push({
        key: `c-${id}`,
        kind: "challenge",
        title: c.title,
        subtitle: `${c.difficulty} · ${xpFor(c.difficulty)} XP${latest ? ` · ${languageLabel(latest.language)}` : ""}`,
        dateLabel: latest ? new Date(latest.at).toLocaleDateString() : "on this device",
        to: `/solutions/${id}`
      });
    }
    for (const date of store.dailySolved) {
      const c = dailyChallengeForDate(date);
      if (!c) continue;
      rows.push({
        key: `d-${date}`,
        kind: "daily",
        title: `${c.title} — Daily`,
        subtitle: `${c.difficulty} · product date ${formatProductDay(date)}`,
        dateLabel: formatProductDay(date),
        to: `/daily/${date}`
      });
    }
    for (const id of store.debugResolved) {
      const c = DEBUG_CASES.find((x) => x.id === id);
      if (!c) continue;
      rows.push({
        key: `g-${id}`,
        kind: "debug",
        title: c.title,
        subtitle: `${c.difficulty} debug case`,
        dateLabel: "fixed",
        to: `/debug/${id}`
      });
    }
    return rows;
  }, [store.solved, store.dailySolved, store.debugResolved, store.submissions]);

  const shown = filter === "all" ? entries : entries.filter((e) => e.kind === filter);

  return (
    <Page
      kind="sink"
      kicker="Practice"
      title="Your solutions"
      lead="Editorials and accepted work you unlocked — each lands only after a first accepted solve."
    >
      <ChipTabBar
        label="Solution families"
        value={filter}
        onChange={(v) => setFilter(v as typeof filter)}
        tabs={[
          { id: "all", label: `All (${entries.length})` },
          { id: "challenge", label: `Challenges (${entries.filter((e) => e.kind === "challenge").length})` },
          { id: "daily", label: `Daily rituals (${entries.filter((e) => e.kind === "daily").length})` },
          { id: "debug", label: `Debug fixes (${entries.filter((e) => e.kind === "debug").length})` }
        ]}
      />
      {shown.length === 0 ? (
        <Card>
          <StateBlock
            state="empty"
            message={
              filter === "all"
                ? "No accepted work yet — your first accepted solve unlocks its editorial here."
                : "Nothing in this family yet."
            }
            action={<Link className="btn btn--primary" to="/challenges">Browse challenges</Link>}
          />
        </Card>
      ) : (
        <List>
          {shown.map((e) => (
            <ListRow key={e.key} to={e.to} align="center">
              <div style={{ flex: 1 }}>
                <strong>{e.title}</strong>
                <p className="meta" style={{ margin: "2px 0 0" }}>{e.subtitle}</p>
              </div>
              <span className="chip chip--quiet" style={{ fontSize: "11px" }}>{e.dateLabel}</span>
              <Icon name="chevron-right" size={14} />
            </ListRow>
          ))}
        </List>
      )}
    </Page>
  );
}

export function SolutionDetail() {
  const { solutionId } = useParams();
  const item = CHALLENGES.find((c) => c.id === solutionId);
  const store = useStore();
  if (!item) {
    return (
      <Page kind="sink" title="Solution unavailable">
        <StateBlock state="unavailable" message="This solution cannot be opened." action={<Back to="/solutions">Solutions</Back>} />
      </Page>
    );
  }
  const unlocked = store.solved.includes(item.id);
  const mine = store.submissions.find((s) => s.challengeId === item.id && s.verdict === "accepted" && s.code);
  const langsTried = Array.from(new Set(store.submissions.filter((s) => s.challengeId === item.id).map((s) => s.language)));

  return (
    <Page
      kind="sink"
      kicker={`Solution · ${item.difficulty}`}
      title={item.title}
      lead={unlocked ? "Unlocked on your first accepted solve — your code and the editorial." : "Locked"}
      actions={<Back to="/solutions">Solutions</Back>}
    >
      {!unlocked ? (
        <Card>
          <StateBlock
            state="refused"
            message="Solve this challenge first — the editorial unlocks on your first accepted submission, never earlier."
            action={<Link className="btn btn--primary" to={`/challenges/${item.id}`}>Open the workbench</Link>}
          />
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.35fr", gap: "16px" }}>
          <Card>
            <CardHeader title="Editorial" icon="solutions" />
            {item.solutionEditorial ? (
              <>
                <p className="page__lead">{item.solutionEditorial.approach}</p>
                <div style={{ margin: "var(--space-3) 0", padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)", fontSize: "var(--text-sm)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span>Time</span>
                    <strong style={{ fontFamily: "var(--font-mono)" }}>{item.solutionEditorial.timeComplexity}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Space</span>
                    <strong style={{ fontFamily: "var(--font-mono)" }}>{item.solutionEditorial.spaceComplexity}</strong>
                  </div>
                </div>
                <pre className="code" style={{ margin: 0, whiteSpace: "pre-wrap", maxHeight: 260, overflowY: "auto" }}>{item.solutionEditorial.code}</pre>
              </>
            ) : (
              <p className="meta">
                No authored editorial is held for this challenge on this device — your accepted code below stands on its own.
              </p>
            )}
            <p className="meta" style={{ margin: "12px 0 0" }}>
              Your submissions in: {langsTried.length > 0 ? langsTried.map(languageLabel).join(", ") : "—"}
            </p>
          </Card>
          <Card>
            <CardHeader title={mine ? `My accepted code — ${languageLabel(mine.language)}` : "My accepted code"} icon="code" />
            {mine?.code ? (
              <pre className="code" style={{ margin: 0, whiteSpace: "pre-wrap" }}>{mine.code}</pre>
            ) : (
              <p className="meta">
                This solve predates stored submission code on this device — the accepted text itself was not kept.
              </p>
            )}
            {mine ? (
              <p className="meta" style={{ marginTop: "8px" }}>
                Accepted {new Date(mine.at).toLocaleString()} · {mine.casesPassed}/{mine.casesTotal} cases.
              </p>
            ) : null}
          </Card>
        </div>
      )}
    </Page>
  );
}
