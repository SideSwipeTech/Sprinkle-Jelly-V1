/**
 * CourseReview — `curriculum/:id/review`. Per-lesson content review and
 * aggregate course analytics: which lessons reach learners without being
 * completed; starts, completions, drop-off and certificate counts. Counts and
 * rates only — no learner-authored text, no learner identity, no rankings.
 * Each figure states when it was computed; a figure that cannot be read says
 * so rather than rendering zero.
 */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, Stat, StateBlock } from "@components/Card";
import { AdminPage } from "../AdminShell";
import { Breadcrumbs } from "../../extraction/components/Breadcrumbs/Breadcrumbs";
import { itemTo } from "./hierarchy";
import {
  COURSE_REVIEWS,
  findItem,
  loadedNote,
  readStudioTree
} from "./fixtures";
import "./courses.css";

export function CourseReview() {
  const { id = "" } = useParams();
  const [items] = useState(readStudioTree);
  /* Scoped to the item it was opened on — no picker. */
  const item = findItem(items, id);
  const review = item ? COURSE_REVIEWS[item.id] : undefined;

  if (!item) {
    return (
      <AdminPage kicker="Content / Curriculum" title="Content review and analytics">
        <StateBlock
          state="unavailable"
          message="That item is not in the studio tree."
          action={<Link className="btn btn--secondary" to="/admin/curriculum">Back to Courses</Link>}
        />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      kicker={`Content / Curriculum / ${item.title}`}
      title="Content review and analytics"
      lead="Counts and rates only — no learner-authored text, no learner identity, no rankings. Every figure states when it was computed; one that cannot be read says so rather than rendering zero."
      actions={<Link className="btn btn--secondary" to={itemTo(item.id)}>Back to {item.title}</Link>}
    >
      <Breadcrumbs
        label="Studio tree"
        items={[
          { label: "Courses", to: "/admin/curriculum" },
          { label: item.title, to: itemTo(item.id) },
          { label: "Content review" }
        ]}
      />

      {!review ? (
        <StateBlock
          state="unavailable"
          message={`The figures for “${item.title}” cannot be read — they are stated as unreadable, never as zero.`}
        />
      ) : (
        <>
          <Card>
            <CardHeader title="Aggregate analytics" icon="grid" />
            <p className="cs-figure-note">Computed {review.computedAt}</p>
            <div className="admin-health">
              <div className="admin-health__cell">
                <Stat label="Starts" value={review.aggregate.starts} asOf={review.computedAt} />
              </div>
              <div className="admin-health__cell">
                <Stat label="Completions" value={review.aggregate.completions} asOf={review.computedAt} />
              </div>
              <div className="admin-health__cell">
                <Stat
                  label="Drop-off rate"
                  value={review.aggregate.dropOff === null ? null : `${review.aggregate.dropOff}%`}
                  asOf={review.aggregate.dropOff === null ? undefined : review.computedAt}
                />
                {review.aggregate.dropOff === null ? (
                  <p className="cs-figure-note">cannot be read — stated, never zero</p>
                ) : null}
              </div>
              <div className="admin-health__cell">
                <Stat label="Certificates" value={review.aggregate.certificates} asOf={review.computedAt} />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Per-lesson content review" icon="lessons" />
            <p className="meta">
              Which lessons reach learners without being completed. {loadedNote(review.lessons.length, review.lessons.length)}
            </p>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Lesson</th>
                  <th>Reached</th>
                  <th>Reached, not completed</th>
                  <th>Rate</th>
                  <th>Computed</th>
                </tr>
              </thead>
              <tbody>
                {review.lessons.map((row) => (
                  <tr key={row.lessonId}>
                    <td>
                      <Link to={`/admin/curriculum/lessons/${row.lessonId}`}>{row.title}</Link>
                    </td>
                    <td>{row.reached}</td>
                    <td>{row.reachedNotCompleted}</td>
                    <td>{row.reached === 0 ? "—" : `${Math.round((row.reachedNotCompleted / row.reached) * 100)}%`}</td>
                    <td className="meta">{row.computedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="meta">
              Three figures deliberately do not exist: frequently-missed questions, any
              distribution across versions, and any judgment of a learner.
            </p>
          </Card>
        </>
      )}
    </AdminPage>
  );
}
