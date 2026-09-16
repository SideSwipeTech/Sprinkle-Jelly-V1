import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export type PageKind = "courses" | "sink" | "assess";

export function Page({
  kicker,
  title,
  lead,
  actions,
  children,
  kind = "sink"
}: {
  kicker?: string;
  title: string;
  lead?: string;
  actions?: ReactNode;
  children?: ReactNode;
  kind?: PageKind;
}) {
  const head =
    kind === "courses" ? "courses__head" : kind === "assess" ? "assess__head" : "sink__head";
  const titleClass =
    kind === "courses" ? "courses__title" : kind === "assess" ? "assess__title" : "sink__title";

  return (
    <div className={kind}>
      <header className={`${head} enter`} data-reveal="">
        <div>
          {kicker ? <p className="micro page__kicker">{kicker}</p> : null}
          <h1 className={`display ${titleClass}`}>{title}</h1>
          {lead ? <p className="page__lead">{lead}</p> : null}
        </div>
        {actions}
      </header>
      {children}
    </div>
  );
}

export function Back({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="btn btn--quiet" to={to}>
      {children}
    </Link>
  );
}

export function CoverageTag({ coverage }: { coverage: "not-started" | "learning" | "covered" | "completed" }) {
  const label = {
    "not-started": "Not started",
    learning: "Learning",
    covered: "Covered",
    completed: "Completed"
  }[coverage];
  return (
    <span className="coverage" data-coverage={coverage}>
      <span className="coverage__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
