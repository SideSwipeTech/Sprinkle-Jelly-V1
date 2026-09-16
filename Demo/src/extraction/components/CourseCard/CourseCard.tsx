/**
 * CourseCard — one catalogue entry: optional cover strip, header, summary,
 * meta chips, CTA.
 *
 * Extracted from Learn.tsx:105-138 — the lessons grid paints the cover variant,
 * the video grid the plain one; both are this component. The "Enrolled" chip's
 * `rgba(45,212,191,.15)`/`#2dd4bf` literal is dead: enrolment is `data-enrolled`
 * with a check icon + word, never colour alone.
 */

import type { ReactNode } from "react";
import { Card, CardHeader } from "@components/Card";
import { CoverageTag } from "@components/Page";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./CourseCard.css";

export interface CourseCardProps {
  /** e.g. "Algorithms · PYTHON" or "Studio Video". */
  eyebrow: string;
  title: string;
  icon?: IconName;
  summary: ReactNode;
  /** The accent-gradient cover strip (lessons family). */
  cover?: boolean;
  /** Coverage vocabulary tag (kit CoverageTag). */
  coverage?: "not-started" | "learning" | "covered" | "completed";
  /** Renders the "Enrolled" chip — success tone + check icon. */
  enrolled?: boolean;
  /** Meta chips, e.g. ["12 lessons", "6h", "Beginner"]. */
  meta?: string[];
  /** CTA row under the meta. */
  action?: ReactNode;
  index?: number;
}

export function CourseCard({ eyebrow, title, icon, summary, cover, coverage, enrolled, meta, action, index = 0 }: CourseCardProps) {
  return (
    <Card index={index} className={`x-course-card ${cover ? "x-course-card--cover" : ""}`}>
      {cover ? <div className="x-course-card__cover" aria-hidden="true" /> : null}
      <CardHeader
        eyebrow={eyebrow}
        title={title}
        icon={icon}
        action={coverage ? <CoverageTag coverage={coverage} /> : undefined}
      />
      <p className="x-course-card__summary">{summary}</p>
      {meta?.length || enrolled ? (
        <div className="x-course-card__meta">
          {meta?.map((chip, i) => (
            <span key={i} className={`x-chip ${i === 0 ? "" : "x-chip--quiet"}`}>
              <span className="x-chip__text">{chip}</span>
            </span>
          ))}
          {enrolled ? (
            <span className="x-chip x-course-card__enrolled">
              <Icon name="check" size={12} />
              <span className="x-chip__text">Enrolled</span>
            </span>
          ) : null}
        </div>
      ) : null}
      {action ? <div className="x-course-card__action">{action}</div> : null}
    </Card>
  );
}
