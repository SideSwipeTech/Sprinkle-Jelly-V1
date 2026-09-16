/**
 * CertificateCard — one issued credential: accent spine, seal, title, the mono
 * verification id, the public-check toggle, verify/download actions.
 *
 * Extracted from Account.tsx:415-467. Kills the `rgba(99,102,241,.15)` seal
 * ground, the `rgba(45,212,191,.15)`/`rgba(255,255,255,.08)` visibility chip and
 * the `3px solid` spine literal. The data-URI download moved to
 * `./download.ts` (`downloadJson`).
 */

import { Link } from "react-router-dom";
import { Card } from "@components/Card";
import { Icon } from "@icons/Icon";
import { downloadJson } from "./download";
import "./CertificateCard.css";

export interface CertificateCardProps {
  id: string;
  title: string;
  awarded: string;
  /** Issuer-side validity. */
  valid: boolean;
  /** Whether the public verification check discloses. */
  visibility: "public" | "hidden";
  onToggleVisibility: () => void;
  /** Route to the public seal page. */
  verifyTo: string;
  /** The proof payload — downloaded via downloadJson. */
  proof: unknown;
}

export function CertificateCard({ id, title, awarded, valid, visibility, onToggleVisibility, verifyTo, proof }: CertificateCardProps) {
  const publicOn = visibility === "public";
  return (
    <div className="x-certificate-card">
      <Card className="x-certificate-card__card">
        <div className="x-certificate-card__head">
          <div className="x-certificate-card__id-block">
            <span className="micro x-certificate-card__eyebrow">Accredited completion</span>
            <h3 className="x-certificate-card__title">{title}</h3>
            <p className="x-certificate-card__meta">
              Awarded {awarded} · {valid ? "Cryptographically valid" : "Revoked"}
            </p>
          </div>
          <span className="x-certificate-card__seal" aria-hidden="true">
            <Icon name="shield" size={22} />
          </span>
        </div>

        <div className="x-certificate-card__code">ID: WZL-{id.toUpperCase()}-VALID</div>

        <div className="x-certificate-card__check">
          <span className="x-certificate-card__check-label">Public check:</span>
          <button
            type="button"
            className="x-chip x-certificate-card__visibility"
            data-on={publicOn || undefined}
            aria-pressed={publicOn}
            onClick={onToggleVisibility}
          >
            <Icon name={publicOn ? "check" : "lock"} size={12} />
            <span className="x-chip__text">{publicOn ? "Publicly visible" : "Hidden from public"}</span>
          </button>
        </div>

        <div className="x-certificate-card__actions">
          <Link className="x-btn x-btn--primary" to={verifyTo}>Verify public seal</Link>
          <button
            type="button"
            className="x-btn x-btn--secondary"
            onClick={() => downloadJson(`${id}-proof.json`, proof)}
          >
            <Icon name="download" size={14} />
            Download proof
          </button>
        </div>
      </Card>
    </div>
  );
}
