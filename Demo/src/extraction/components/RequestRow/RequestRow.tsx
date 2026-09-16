/**
 * RequestRow — one private topic request, plus the `RequestHistory` section
 * that hosts the list.
 *
 * Extracted from Account.tsx:605-616 (`.request-history` + `.list-row` +
 * `.request-status`). The status chip gains `data-status` so the closed status
 * set can each get a tell; withdraw shows only where withdrawal is honest.
 */

import { useId, type ReactNode } from "react";
import "./RequestRow.css";

export type RequestStatus = "Under Review" | "Planned" | "In Authoring" | "Published" | "Withdrawn";

export function RequestHistory({ title = "Your requests", kicker = "Private history", children }: { title?: string; kicker?: string; children: ReactNode }) {
  const id = useId();
  return (
    <section className="x-request-history" aria-labelledby={id}>
      <div>
        <p className="micro x-request-history__kicker">{kicker}</p>
        <h2 className="x-request-history__title" id={id}>{title}</h2>
      </div>
      <div className="x-list">{children}</div>
    </section>
  );
}

export interface RequestRowProps {
  title: string;
  createdAt: string;
  status: RequestStatus;
  /** Shown only for "Under Review" — a withdrawn request cannot be re-opened here. */
  onWithdraw?: () => void;
}

export function RequestRow({ title, createdAt, status, onWithdraw }: RequestRowProps) {
  return (
    <article className="x-list-row x-request-row">
      <div className="x-request-row__main">
        <strong>{title}</strong>
        <p className="x-request-row__meta">{createdAt}</p>
      </div>
      <div className="x-request-row__status">
        <span className="x-chip x-chip--quiet" data-status={status.toLowerCase().replace(/\s+/g, "-")}>
          <span className="x-chip__text">{status}</span>
        </span>
        {status === "Under Review" && onWithdraw ? (
          <button type="button" className="x-btn x-btn--quiet" onClick={onWithdraw}>Withdraw</button>
        ) : null}
      </div>
    </article>
  );
}
