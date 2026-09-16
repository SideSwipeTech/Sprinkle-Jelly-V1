import { Link } from "react-router-dom";
import { Card } from "@components/Card";
import { Icon } from "@icons/Icon";
import { useStore } from "@state/useStore";
import { DEMO_SIGNUP_URL, DEMO_UPGRADE_URL } from "./config";
import { trackDemoEvent } from "./analytics";

export function DemoLanding() {
  const store = useStore();
  const streak = store.profile.streak;
  const solved = store.solved.length;

  return (
    <div className="demo-landing">
      <header className="demo-landing__hero">
        <h1 className="display">Wizly Labs</h1>
        <p className="page__lead">
          Practice coding, courses, and mock assessments in one workspace.
          This is a public demo — no signup, no billing, no real data.
        </p>
        <div className="demo-landing__actions">
          <Link
            className="btn btn--primary"
            to="/"
            onClick={() => trackDemoEvent("demo_cta_clicked", { label: "Explore the demo", path: "/" })}
          >
            <Icon name="play" size={16} /> Explore the demo
          </Link>
          <a
            className="btn btn--secondary"
            href={DEMO_SIGNUP_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackDemoEvent("demo_signup_clicked", { label: "Create account" })}
          >
            <Icon name="user" size={16} /> Create account
          </a>
          <a
            className="btn btn--quiet"
            href={DEMO_UPGRADE_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackDemoEvent("demo_cta_clicked", { label: "See pricing" })}
          >
            <Icon name="credits" size={16} /> See pricing
          </a>
        </div>
      </header>

      <div className="demo-landing__grid">
        <Card className="demo-landing__card">
          <Icon name="courses" size={32} />
          <h3>Courses & lessons</h3>
          <p className="meta">Progress through interactive Python, DSA and SQL paths.</p>
        </Card>
        <Card className="demo-landing__card">
          <Icon name="challenges" size={32} />
          <h3>Challenges</h3>
          <p className="meta">Solve problems with an in-browser editor and simulated test runner.</p>
        </Card>
        <Card className="demo-landing__card">
          <Icon name="daily" size={32} />
          <h3>Daily challenge</h3>
          <p className="meta">A fresh scheduled problem with a streak and scoring model.</p>
        </Card>
        <Card className="demo-landing__card">
          <Icon name="debug" size={32} />
          <h3>Debug Detective</h3>
          <p className="meta">Find and fix broken code in guided cases.</p>
        </Card>
        <Card className="demo-landing__card">
          <Icon name="projects" size={32} />
          <h3>Workspace</h3>
          <p className="meta">Multi-file project sandbox with a file tree and terminal.</p>
        </Card>
        <Card className="demo-landing__card">
          <Icon name="assessments" size={32} />
          <h3>Assessments</h3>
          <p className="meta">Timed mock and company papers with instant feedback.</p>
        </Card>
      </div>

      <div className="demo-landing__stats">
        <p className="meta">
          Pre-populated as <strong>{store.session.name}</strong> · {streak}-day streak · {solved} challenges solved
        </p>
      </div>
    </div>
  );
}
