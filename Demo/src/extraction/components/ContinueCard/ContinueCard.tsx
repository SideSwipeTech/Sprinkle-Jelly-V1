/**
 * ContinueCard — the "resume where you left off" region.
 *
 * Extracted from Learn.tsx:51-59 (the compact rail card on /courses) and
 * Dashboard.tsx:72-96 (the hero cell in home__grid). One component, two
 * layouts; both resolve to the same honest empty state when there is nothing
 * eligible — an absent resume target is a StateBlock, never a fabricated one.
 */

import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { Card, CardHeader, StateBlock } from "@components/Card";
import { Charge } from "@components/Charge";
import "./ContinueCard.css";

export interface ContinueTarget {
  /** The lesson title — the thing being resumed. */
  title: string;
  /** Context line, e.g. "Foundations of Python". */
  context: string;
  /** 0–100 coverage. */
  percent: number;
  /** Resume destination. */
  to: string;
}

export interface ContinueCardProps {
  /** null renders the honest empty state — nothing is invented as a target. */
  item: ContinueTarget | null;
  /** `hero` puts the Resume action in the header (Dashboard); `rail` is the
      narrow card with the CTA at the foot (Courses). */
  layout?: "hero" | "rail";
  /** Action inside the empty state — e.g. a "Browse Courses" link. */
  emptyAction?: ReactNode;
  emptyMessage?: string;
  /** Charge label — e.g. "Course progress" / "Coverage". */
  chargeLabel?: string;
  className?: string;
}

const EMPTY_DEFAULT = "No eligible item in progress. Open the catalogue to start an interactive path.";

export function ContinueCard({
  item,
  layout = "rail",
  emptyAction,
  emptyMessage = EMPTY_DEFAULT,
  chargeLabel = "Coverage",
  className = ""
}: ContinueCardProps) {
  if (!item) {
    return (
      <Card className={`x-continue-card x-continue-card--${layout} x-continue-card--empty ${className}`}>
        {layout === "hero" ? <CardHeader eyebrow="Continue" title="Nothing in progress" icon="lessons" /> : null}
        <StateBlock state="empty" compact={layout === "rail"} message={emptyMessage} action={emptyAction} />
      </Card>
    );
  }

  const cta = (
    <Link className="x-btn x-btn--primary x-continue-card__cta" to={item.to}>
      Resume
    </Link>
  );

  return (
    <Card live className={`x-continue-card x-continue-card--${layout} ${className}`}>
      {layout === "hero" ? (
        <>
          <CardHeader eyebrow="Continue" title={item.title} icon="lessons" scale="hero" action={cta} />
          <p className="x-continue-card__meta">{item.context} · {item.percent}% through</p>
          <Charge value={item.percent} label={chargeLabel} asOf="this device" />
        </>
      ) : (
        <>
          <p className="micro x-continue-card__label">Continue learning</p>
          <h2 className="x-continue-card__title">{item.title}</h2>
          <p className="x-continue-card__meta">{item.context} · {item.percent}% covered</p>
          <Charge value={item.percent} label={chargeLabel} showValue={false} />
          {cta}
        </>
      )}
    </Card>
  );
}
