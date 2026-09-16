/**
 * RestrictedNotice — the account-restriction block: refused StateBlock + the
 * policy inset + the way onward.
 *
 * Extracted from Account.tsx:713-729 (RestrictedPage card body). The policy
 * inset was an inline-styled div; now `x-restricted-notice__policy`. The
 * refusal is StateBlock's `refused` state — the word, the icon and the tells
 * come with it.
 */

import type { ReactNode } from "react";
import { StateBlock } from "@components/Card";
import "./RestrictedNotice.css";

export interface RestrictedNoticeProps {
  /** The standing message, e.g. "Account standing: Suspended. …" */
  message: string;
  /** The policy block — title + text. */
  policy: { title: string; text: ReactNode };
  /** The way onward — `x-btn` links. */
  actions?: ReactNode;
}

export function RestrictedNotice({ message, policy, actions }: RestrictedNoticeProps) {
  return (
    <div className="x-restricted-notice">
      <StateBlock state="refused" message={message} />
      <div className="x-restricted-notice__policy">
        <strong className="x-restricted-notice__policy-title">{policy.title}: </strong>
        {policy.text}
      </div>
      {actions ? <div className="x-restricted-notice__actions">{actions}</div> : null}
    </div>
  );
}
