import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Page, Back } from "@components/Page";
import { Icon } from "@icons/Icon";
import { COURSES, SKILLS } from "@data/catalog";

export function SkillEvidence() {
  const { skillId } = useParams();
  const skill = SKILLS.find((s) => s.id === skillId);
  if (!skill) {
    return (
      <Page title="Receipt cannot be shown">
        <StateBlock state="refused" message="Receipt cannot be shown." action={<Back to="/skills">Skills</Back>} />
      </Page>
    );
  }
  const isPythonOrDsa = skill.id === "python" || skill.id === "dsa";

  return (
    <Page kind="sink" kicker="Private Evidence Receipt" title={`Why this result? — ${skill.title}`} lead="This receipt is read-only, deterministic, and never reconstructed from a displayed percentage." actions={<Back to={`/skills/${skill.id}`}>Return to skill</Back>}>
      <Card>
        <CardHeader title={isPythonOrDsa ? "Evidence threshold met" : "Judgment Withheld"} icon="shield" />
        {isPythonOrDsa ? (
          <div>
            <p className="page__lead" style={{ color: "#2dd4bf" }}>Status: Proficient · Minimum threshold weight 6 achieved across 3 distinct producers.</p>
            <p className="meta">Reconciled evidence from Challenges, Course Labs, and Mock OA sittings on this device.</p>
          </div>
        ) : (
          <div>
            <p className="page__lead">Freshness unavailable. The supplied record does not support a verdict.</p>
            <p className="meta">A skill needs minimum total weight 6 and 2 distinct eligible items.</p>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Producer Evidence Receipts" icon="list" />
        <p className="meta">Only authorized learner-visible fields appear. Difficulty reflects difficulty at time of solve.</p>
        <div className="b11-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Producer</th><th>Item</th><th>Date</th><th>Outcome</th><th>Weight</th><th>Open</th></tr>
            </thead>
            <tbody>
              {isPythonOrDsa ? (
                <>
                  <tr>
                    <td>Challenges</td>
                    <td>Balanced Brackets</td>
                    <td>14 Aug 2026</td>
                    <td><span className="chip" style={{ background: "rgba(45, 212, 191, 0.15)", color: "#2dd4bf" }}>Accepted</span></td>
                    <td><strong>3.0</strong></td>
                    <td><Link to="/challenges/balanced-brackets">Problem</Link></td>
                  </tr>
                  <tr>
                    <td>Challenges</td>
                    <td>Two Sum</td>
                    <td>12 Aug 2026</td>
                    <td><span className="chip" style={{ background: "rgba(45, 212, 191, 0.15)", color: "#2dd4bf" }}>Accepted</span></td>
                    <td><strong>2.0</strong></td>
                    <td><Link to="/challenges/two-sum">Problem</Link></td>
                  </tr>
                  <tr>
                    <td>Assessment</td>
                    <td>Python OA — Standard Set</td>
                    <td>16 Aug 2026</td>
                    <td><span className="chip" style={{ background: "rgba(45, 212, 191, 0.15)", color: "#2dd4bf" }}>100% Score</span></td>
                    <td><strong>4.0</strong></td>
                    <td><Link to="/mock/oa-python-01/result">Scorecard</Link></td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td>Challenges</td>
                  <td>Sample Drill</td>
                  <td>unavailable</td>
                  <td>unavailable</td>
                  <td>unavailable</td>
                  <td><Link to="/challenges/history">Attempt history</Link></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Excluded Evidence (Policy)" icon="x" />
        <ul className="home__list">
          <li className="home__row"><span className="home__row-title">Foundations of Python Reading Time</span><span className="chip chip--quiet">excluded · study time is not mastery</span></li>
          <li className="home__row"><span className="home__row-title">weather-dashboard CLI</span><span className="chip chip--quiet">excluded · self-marked project</span></li>
        </ul>
      </Card>
      <div className="row" style={{ marginTop: "var(--space-4)" }}>
        <Link className="btn btn--secondary" to="/skills">All Skills</Link>
        <Link className="btn btn--quiet" to="/stats">How Evidence is Weighted</Link>
      </div>
    </Page>
  );
}

export function RecapYear() {
  return (
    <Page kind="sink" kicker="Year in review" title="2025 recap" lead="Offered only when there is a year to tell. This visit is out of season.">
      <StateBlock state="empty" message="Out of season. No empty recap is fabricated for a year that has not closed on this device." action={<Link className="btn btn--secondary" to="/recap">Recap home</Link>} />
    </Page>
  );
}

export function ErrorStates() {
  return (
    <Page kind="sink" kicker="Platform reference" title="Error states" lead="Five shared failure patterns. Missing data is never turned into learner performance.">
      <Card>
        <CardHeader title="01 Full-page error" icon="error" />
        <StateBlock state="unavailable" message="The platform could not load. Every area is unavailable and there is no previously shown information to retain." />
      </Card>
      <Card>
        <CardHeader title="02 Inline banner" icon="alert" />
        <p className="page__lead">Activity rhythm and Achievements could not update. Other Dashboard areas are still available.</p>
      </Card>
      <Card>
        <CardHeader title="03 Region dash" icon="target" />
        <p className="meta">Average active time to solve</p>
        <p className="display">—</p>
        <p className="meta">unavailable · This figure could not be read. Never zero.</p>
      </Card>
      <Card>
        <StateBlock state="refused" message="This page isn’t available here. The request can’t be opened from this account. No private reason or system detail is shown." />
      </Card>
      <Card>
        <CardHeader title="05 Empty" icon="inbox" />
        <StateBlock state="empty" compact message="Nothing has been authored yet — distinct from unavailable and refused." />
      </Card>
    </Page>
  );
}

export function StatsExplainer() {
  return (
    <Page kind="sink" kicker="Skills" title="How a result is read" lead="A displayed percentage is never the source of a receipt. This page explains the gate; it is not a ranking.">
      <Card>
        <p className="page__lead">A skill needs minimum total weight 6 and 2 distinct eligible items from producing domains. Study time and self-marked projects do not become evidence.</p>
        <Link className="btn btn--secondary" to="/skills">Back to skills</Link>
      </Card>
    </Page>
  );
}

/* ── Course completion — kept resolving at its historical import address until
   the courses split lands it under ./courses. */
export function SubjectComplete() {
  const { courseId } = useParams();
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) {
    return <Page kind="courses" title="Completion unavailable"><StateBlock state="unavailable" message="This course address does not resolve." /></Page>;
  }
  return (
    <Page kind="courses" kicker="Interactive Curriculum" title={`${course.title} Completed`} lead="This completion is recorded in this demo session." actions={<Back to="/courses">Courses</Back>}>
      <div className="grid-2">
        <Card live>
          <CardHeader title="Completion certificate unlocked" icon="trophy" />
          <p className="page__lead">
            Congratulations! All required lessons and knowledge check checkpoints for <strong>{course.title}</strong> have been recorded as complete.
          </p>
          <div style={{ marginTop: "var(--space-4)", padding: "12px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)", fontSize: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Certificate:</span><code style={{ color: "var(--c-accent-primary)" }}>CERT-PY-FOUNDATIONS-2026</code></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span>Status:</span><strong style={{ color: "var(--c-accent-primary)" }}>Issued</strong></div>
          </div>
          <div className="row" style={{ marginTop: "var(--space-4)" }}>
            <Link className="btn btn--primary" to="/certificates/cert-py-01/verify">View certificate →</Link>
            <Link className="btn btn--secondary" to="/achievements">View Achievement Badges</Link>
          </div>
        </Card>

        <Card>
          <CardHeader title="Recommended Next Milestones" icon="challenges" />
          <p className="meta">Put your new knowledge to the test with real-world algorithmic challenges:</p>
          <div className="list" style={{ marginTop: "var(--space-3)" }}>
            <Link className="list-row" to="/challenges/two-sum">
              <Icon name="challenges" size={16} />
              <div style={{ flex: 1 }}>
                <strong>Two Sum & Hash Maps</strong>
                <p className="meta">O(N) one-pass hash map frequency lookup</p>
              </div>
              <span className="chip">Easy</span>
            </Link>
            <Link className="list-row" to="/challenges/balanced-brackets">
              <Icon name="challenges" size={16} />
              <div style={{ flex: 1 }}>
                <strong>Balanced Brackets</strong>
                <p className="meta">Stack-based nested bracket matching</p>
              </div>
              <span className="chip">Medium</span>
            </Link>
          </div>
        </Card>
      </div>
      <div style={{ marginTop: "var(--space-4)" }}>
        <Link className="btn btn--quiet" to="/courses">Return to Courses Catalogue</Link>
      </div>
    </Page>
  );
}

/* ── Assessment and daily pages — kept resolving at their historical import
   address. The implementations live under ./assessments and ./daily. */
export { MockStart } from "./assessments/mock";
export { CompanyRedo } from "./assessments/company";
export { DailySolve } from "./daily/DailySolve";
