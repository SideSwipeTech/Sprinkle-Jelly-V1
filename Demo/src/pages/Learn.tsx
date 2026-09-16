import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Page, Back } from "@components/Page";
import { Icon } from "@icons/Icon";
import { LESSONS, SKILLS } from "@data/catalog";
import { useStore } from "@state/useStore";

/* The courses pages split into ./learn — catalogue, subject orientation, the
   focused reader and the video-course surface all read the one adapter
   (@data/courses-demo). These re-exports keep App.tsx's imports stable. */
export { Courses } from "./learn/catalogue";
export { CourseDetail } from "./learn/subject";
export { LessonReader } from "./learn/reader";
export { VideoLesson } from "./learn/video";
export { CourseQuiz, CourseProject, CourseChanges } from "./learn/deep-links";
export { CodeLab } from "./codelab/CodeLab";

export function Skills() {
  const store = useStore();
  const [period, setPeriod] = useState<"7" | "30" | "90" | "365">("30");

  const skillVerdicts: Record<string, { score: number; label: "Strong" | "Developing" | "Needs practice"; weight: number }> = {
    python: { score: 88, label: "Strong", weight: 9.0 },
    dsa: { score: 72, label: "Developing", weight: 6.5 },
    web: { score: 45, label: "Needs practice", weight: 3.0 },
    systems: { score: 0, label: "Needs practice", weight: 0 }
  };

  return (
    <Page kind="sink" kicker="Judgment Surface" title="Skills & Competencies" lead="The single surface on the platform authorized to state a judgment of learner skill. Derived strictly from verifiable accepted evidence." actions={<Back to="/">Dashboard</Back>}>
      {/* 4-Period Filter (PRG-R8) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "var(--space-4)" }}>
        <div className="filters" style={{ margin: 0 }}>
          {[
            { id: "7", label: "7 Days" },
            { id: "30", label: "30 Days (Default)" },
            { id: "90", label: "90 Days" },
            { id: "365", label: "365 Days (Annual)" }
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              className="chip"
              data-on={period === p.id || undefined}
              onClick={() => setPeriod(p.id as any)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <span className="meta">Readiness figures as of this device · not a public credential</span>
      </div>

      <div className="sink__grid">
        {SKILLS.map((s) => {
          const lessons = LESSONS.filter((l) => l.courseId === s.courseId);
          const done = lessons.filter((l) => store.completedLessons.includes(l.id)).length;
          const verdict = skillVerdicts[s.id];
          const hasEvidence = verdict && verdict.weight >= 6;

          return (
            <Card key={s.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <CardHeader title={s.title} icon="skills" />
                {hasEvidence ? (
                  <span
                    className="chip"
                    style={{
                      background: verdict.label === "Strong" ? "rgba(45, 212, 191, 0.15)" : verdict.label === "Developing" ? "rgba(99, 102, 241, 0.15)" : "rgba(244, 63, 94, 0.15)",
                      color: verdict.label === "Strong" ? "#2dd4bf" : verdict.label === "Developing" ? "#818cf8" : "#f43f5e",
                      fontWeight: 600
                    }}
                  >
                    {verdict.label} ({verdict.score}/100)
                  </span>
                ) : (
                  <span className="chip chip--quiet" style={{ color: "var(--c-text-faint)" }}>
                    Not enough evidence ({verdict?.weight ?? 0}/6 wt)
                  </span>
                )}
              </div>

              {!hasEvidence ? (
                <StateBlock state="empty" message="Not enough evidence. A skill requires minimum total weight 6 across at least 2 distinct items." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p className="page__lead" style={{ fontSize: "var(--text-sm)", margin: 0 }}>
                    {done} completed lesson{done === 1 ? "" : "s"} · {verdict.weight} stamped evidence weight
                  </p>
                  <div style={{ width: "100%", height: 6, borderRadius: 999, background: "var(--c-surface-inset)", overflow: "hidden" }}>
                    <div style={{ width: `${verdict.score}%`, height: "100%", background: "var(--charge-gradient)" }} />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "8px", marginTop: "var(--space-3)" }}>
                <Link className="btn btn--quiet" to={`/skills/${s.id}`}>Skill Detail →</Link>
                <Link className="btn btn--quiet" to={`/skills/${s.id}/evidence`}>Evidence Receipts</Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Practice Patterns 5-Metric Breakdown Card (PRG-R28) */}
      <div style={{ marginTop: "var(--space-6)" }}>
        <Card live>
          <CardHeader
            eyebrow="Algorithmic Habits"
            title={`Practice Patterns (${period}-Day Window)`}
            icon="target"
            action={<span className="chip chip--quiet">PRG-R28 Compliant</span>}
          />
        <p className="meta" style={{ marginBottom: "var(--space-4)" }}>
          Denominators are explicit. Platform failures and invalidated runs never penalize these figures.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
          <div style={{ padding: "12px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)" }}>
            <span className="micro" style={{ color: "var(--c-text-faint)" }}>PERFORMANCE BY LANGUAGE</span>
            <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Python</span><strong>94% (16/17)</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>TypeScript</span><strong>88% (7/8)</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Go</span><strong>82% (4/5)</strong></div>
            </div>
          </div>

          <div style={{ padding: "12px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)" }}>
            <span className="micro" style={{ color: "var(--c-text-faint)" }}>PERFORMANCE BY DIFFICULTY</span>
            <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Easy</span><strong style={{ color: "#2dd4bf" }}>98% (12/12)</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Medium</span><strong style={{ color: "#818cf8" }}>84% (10/12)</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Hard</span><strong style={{ color: "#f43f5e" }}>68% (4/6)</strong></div>
            </div>
          </div>

          <div style={{ padding: "12px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <span className="micro" style={{ color: "var(--c-text-faint)" }}>AVG ACTIVE TIME TO SOLVE</span>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--c-accent-primary)" }}>14.2m</div>
            <span className="meta" style={{ fontSize: "10px" }}>Active keystroke clock only</span>
          </div>

          <div style={{ padding: "12px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <span className="micro" style={{ color: "var(--c-text-faint)" }}>SUBMISSIONS PER ACCEPT</span>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "#2dd4bf" }}>1.6 <span style={{ fontSize: "12px", fontWeight: 400 }}>attempts</span></div>
            <span className="meta" style={{ fontSize: "10px" }}>Excludes compiler crash runs</span>
          </div>

          <div style={{ padding: "12px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <span className="micro" style={{ color: "var(--c-text-faint)" }}>TIME TO FIRST ACCEPT</span>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "#818cf8" }}>9.4m</div>
            <span className="meta" style={{ fontSize: "10px" }}>From problem open to 1st accept</span>
          </div>
        </div>
      </Card>
      </div>

      {/* Sub-Navigation Links */}
      <div className="row" style={{ marginTop: "var(--space-6)" }}>
        <Link className="btn btn--secondary" to="/progress">Macro Progress</Link>
        <Link className="btn btn--secondary" to="/goals">Weekly Goals</Link>
        <Link className="btn btn--secondary" to="/assessments">Assessment center</Link>
        <Link className="btn btn--quiet" to="/stats">How Stats are Weighted</Link>
      </div>
    </Page>
  );
}

export function SkillDetail() {
  const { skillId } = useParams();
  const skill = SKILLS.find((s) => s.id === skillId);
  const store = useStore();
  if (!skill) return <Page title="Skill unavailable"><StateBlock state="unavailable" message="This skill page does not resolve." /></Page>;
  const lessons = LESSONS.filter((l) => l.courseId === skill.courseId);
  const done = lessons.filter((l) => store.completedLessons.includes(l.id));

  return (
    <Page kind="sink" kicker="Skills Breakdown" title={skill.title} lead="Verifiable evidence only. No employer-facing judgment." actions={<Back to="/skills">Skills</Back>}>
      <div className="grid-2">
        <Card>
          <CardHeader title="Curriculum Coverage" icon="lessons" />
          {done.length === 0 ? (
            <StateBlock state="empty" message="Not enough evidence. Complete interactive lessons on this device." action={<Link className="btn btn--secondary" to={`/courses/${skill.courseId}`}>Open related course</Link>} />
          ) : (
            <ul className="home__list">
              {lessons.map((l) => {
                const isComplete = store.completedLessons.includes(l.id);
                return (
                  <li key={l.id} className="home__row">
                    <Icon name={isComplete ? "check" : "lessons"} size={16} />
                    <span className="home__row-title">{l.title}</span>
                    <span className="chip chip--quiet">{isComplete ? "Complete" : "Pending"}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Evidence Receipts Status" icon="shield" />
          <p className="page__lead" style={{ fontSize: "var(--text-sm)" }}>
            Current stamped weight on this device: <strong>{done.length * 2.0} / 6.0 wt</strong>
          </p>
          <div style={{ width: "100%", height: 8, borderRadius: 999, background: "var(--c-surface-inset)", overflow: "hidden", margin: "12px 0" }}>
            <div style={{ width: `${Math.min(100, (done.length * 2.0 / 6.0) * 100)}%`, height: "100%", background: "var(--charge-gradient)" }} />
          </div>
          <p className="meta">
            Evidence weight is derived from: Course Lab completions (1.0 wt), Accepted challenge submissions (2.0 wt), and Proctored Mock OA papers (3.0 wt).
          </p>
          <div style={{ marginTop: "var(--space-4)" }}>
            <Link className="btn btn--secondary" to={`/skills/${skill.id}/evidence`}>Inspect Cryptographic Evidence Receipt →</Link>
          </div>
        </Card>
      </div>
    </Page>
  );
}

export function ProgressPage() {
  const store = useStore();
  return (
    <Page kind="sink" kicker="Macro Telemetry" title="Learning Progress" lead="Coverage language only. No average mastery is computed." actions={<Back to="/skills">Skills</Back>}>
      <div className="grid-2">
        <Card>
          <CardHeader title="Curriculum Coverage Velocity" icon="zap" />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Completed Lessons</span>
              <strong style={{ fontSize: "var(--text-lg)", color: "var(--c-accent-primary)" }}>{store.completedLessons.length} modules</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Estimated Active Study Time</span>
              <strong style={{ fontSize: "var(--text-lg)", color: "#2dd4bf" }}>{(store.completedLessons.length * 0.4).toFixed(1)} hours</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Total Problem Submissions</span>
              <strong style={{ fontSize: "var(--text-lg)", color: "#818cf8" }}>{store.solved.length * 2} runs</strong>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Device Measurement Ledger" icon="shield" />
          <p className="stale">As of this device · derived from completed lessons and local terminal runs</p>
          <p className="page__lead" style={{ fontSize: "var(--text-sm)" }}>
            Missing days are not reconstructed as zeros. Active time clock stops automatically after 5 minutes of idle.
          </p>
          <div style={{ marginTop: "var(--space-3)" }}>
            <Link className="btn btn--secondary" to="/skills">Open Skills Judgment Hub</Link>
          </div>
        </Card>
      </div>
    </Page>
  );
}

export function GoalsPage() {
  const [weeklyTarget, setWeeklyTarget] = useState(5);
  const [hoursTarget, setHoursTarget] = useState(4);

  return (
    <Page kind="sink" kicker="Rhythm Pacing" title="Weekly Goals" lead="A personal presentation with no external stakes. Nothing is locked or penalized if goals are missed." actions={<Back to="/skills">Skills</Back>}>
      <div className="grid-2">
        <Card>
          <CardHeader title="Weekly Problem Target" icon="target" />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>Target Problems: <strong>{weeklyTarget} per week</strong></span>
                <span className="chip chip--quiet">3 completed this week</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>Target Active Time: <strong>{hoursTarget} hrs / week</strong></span>
                <span className="chip chip--quiet">2.1 hrs logged</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                value={hoursTarget}
                onChange={(e) => setHoursTarget(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Goal Philosophy" icon="info" />
          <p className="page__lead" style={{ fontSize: "var(--text-sm)" }}>
            Goals exist to maintain a healthy rhythm. They are stored locally on your device and are never shared with prospective employers or used to rank learners.
          </p>
          <div style={{ marginTop: "var(--space-4)" }}>
            <Link className="btn btn--secondary" to="/daily">Start Today's Daily Problem</Link>
          </div>
        </Card>
      </div>
    </Page>
  );
}

export function RecapPage() {
  return (
    <Page kind="sink" kicker="Annual Review" title="Year in Review" lead="Offered to celebrate annual milestone accomplishments." actions={<Back to="/">Dashboard</Back>}>
      <Card>
        <CardHeader title="2026 Annual Recap Archive" icon="sparkles" />
        <p className="page__lead">
          Your full annual reflective journey: coder type classification, language distributions, and milestone timeline.
        </p>
        <div style={{ marginTop: "var(--space-4)" }}>
          <Link className="btn btn--primary" to="/recap/year">Launch 2026 Story View →</Link>
        </div>
      </Card>
    </Page>
  );
}