/**
 * ErasureFlow — the staged account-erasure control.
 *
 * Adopted from Account.tsx:277-298 — already token-clean; this extraction adds
 * the props contract and documents it. Three stages, page-driven:
 *   idle      — the invitation + "Review erasure request"
 *   review    — pending StateBlock + the consequence list + submit/cancel
 *   requested — pending StateBlock + the received-event row + cancel
 *
 * The review list composes the sibling HomeRow classes (`x-home-list` /
 * `x-home-row` / `x-home-row__icon` / `x-home-row__title`) — the shared rehome
 * of `home__list`/`home__row`. The received row is the adopted `timeline-row`
 * anatomy.
 */

import type { ReactNode } from "react";
import { StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./ErasureFlow.css";

export type ErasureStage = "idle" | "review" | "requested";

export interface ErasureFlowProps {
  stage: ErasureStage;
  /** idle → review */
  onReview: () => void;
  /** review → requested (submit). */
  onSubmit: () => void;
  /** review → idle. */
  onCancelReview: () => void;
  /** requested → idle (cancel the staged request). */
  onCancelRequest: () => void;
  /** The consequence rows shown at review. */
  consequences: { icon: IconName; text: ReactNode }[];
  /** e.g. "24 August 2026, 18:00 IST" — when cancellation closes. */
  cancellationDeadline?: string;
  /** intro copy on the idle stage. */
  intro?: ReactNode;
}

export function ErasureFlow({
  stage,
  onReview,
  onSubmit,
  onCancelReview,
  onCancelRequest,
  consequences,
  cancellationDeadline,
  intro = "Start a staged erasure request. Nothing is deleted until the request is submitted and the cancellation window closes."
}: ErasureFlowProps) {
  if (stage === "idle") {
    return (
      <div className="x-erasure">
        <p className="x-erasure__lead">{intro}</p>
        <div>
          <button type="button" className="x-btn x-btn--secondary" onClick={onReview}>
            Review erasure request
          </button>
        </div>
      </div>
    );
  }

  if (stage === "review") {
    return (
      <div className="x-erasure__review">
        <StateBlock state="pending" message="Review the consequences before submitting. This step does not delete anything." />
        <ul className="x-home-list">
          {consequences.map((item, idx) => (
            <li className="x-home-row" key={idx}>
              <span className="x-home-row__icon" data-tone="muted" aria-hidden="true">
                <Icon name={item.icon} size={15} />
              </span>
              <span className="x-home-row__title">{item.text}</span>
            </li>
          ))}
        </ul>
        <div className="row">
          <button type="button" className="x-btn x-btn--primary" onClick={onSubmit}>
            Submit erasure request
          </button>
          <button type="button" className="x-btn x-btn--quiet" onClick={onCancelReview}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="x-erasure__review">
      <StateBlock
        state="pending"
        message={`Erasure requested.${cancellationDeadline ? ` Cancellation is available until ${cancellationDeadline}.` : ""}`}
      />
      <div className="x-erasure__event">
        <span className="x-erasure__event-mark" aria-hidden="true" />
        <div>
          <strong>Request received</strong>
          <p className="x-erasure__event-meta">Queued for the ordered 16-step erasure pass after the cancellation window.</p>
        </div>
      </div>
      <div>
        <button type="button" className="x-btn x-btn--secondary" onClick={onCancelRequest}>
          Cancel request
        </button>
      </div>
    </div>
  );
}
