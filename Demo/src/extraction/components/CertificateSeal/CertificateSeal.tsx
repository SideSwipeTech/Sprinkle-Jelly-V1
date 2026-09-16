/**
 * CertificateSeal — the public verification panel for a credential.
 *
 * Extracted from Account.tsx:488-533 (CertificateVerify). Kills the
 * `#2dd4bf`/`rgba(45,212,191,.15)` seal paint and the `rgba(0,0,0,.4)` shadow;
 * the seal frame's double border is a token'd construction, and a certificate
 * that cannot be verified is a StateBlock — never a half-empty seal.
 *
 * A11y: "copied" feedback arrives via role=status text, not colour.
 */

import { useState, type ReactNode } from "react";
import { StateBlock } from "@components/Card";
import { Icon } from "@icons/Icon";
import "./CertificateSeal.css";

export interface SealCertificate {
  id: string;
  title: string;
  awarded: string;
  hash: string;
  issuer: string;
  valid: boolean;
  visibility: "public" | "hidden";
}

export interface CertificateSealProps {
  /** null → the record does not resolve; hidden/revoked → non-disclosing. */
  certificate: SealCertificate | null;
  /** The display name awarded to. */
  recipient: string;
  /** Absolute URL the copy button puts on the clipboard. */
  verifyUrl: string;
  /** Trailing actions — e.g. "All certificates" back link. */
  actions?: ReactNode;
}

export function CertificateSeal({ certificate, recipient, verifyUrl, actions }: CertificateSealProps) {
  const [copied, setCopied] = useState(false);
  const verifiable = certificate !== null && certificate.valid && certificate.visibility === "public";

  function copyLink() {
    navigator.clipboard?.writeText(verifyUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="x-certificate-seal">
      {!verifiable ? (
        <StateBlock
          state="unavailable"
          message={certificate ? "This certificate could not be verified." : "This award record cannot be verified."}
        />
      ) : (
        <div className="x-certificate-seal__body">
          <span className="x-certificate-seal__emblem" aria-hidden="true">
            <Icon name="shield" size={36} />
          </span>

          <p className="micro x-certificate-seal__eyebrow">Accredited credential seal</p>
          <h2 className="x-certificate-seal__title display">{certificate.title}</h2>
          <p className="x-certificate-seal__meta">
            Awarded to <strong>{recipient}</strong> on {certificate.awarded}
          </p>

          <dl className="x-certificate-seal__record">
            <div className="x-certificate-seal__line">
              <dt>Verification code</dt>
              <dd>WZL-{certificate.id.toUpperCase()}-VALID</dd>
            </div>
            <div className="x-certificate-seal__line">
              <dt>Status</dt>
              <dd className="x-certificate-seal__status">
                <Icon name="check" size={13} /> Active &amp; accredited
              </dd>
            </div>
            <div className="x-certificate-seal__line x-certificate-seal__line--digest">
              <dt>SHA-256 digest</dt>
              <dd className="x-certificate-seal__digest">{certificate.hash}</dd>
            </div>
            <div className="x-certificate-seal__line">
              <dt>Authority</dt>
              <dd>{certificate.issuer}</dd>
            </div>
          </dl>

          <div className="x-certificate-seal__actions">
            <button type="button" className="x-btn x-btn--primary" onClick={copyLink}>
              <Icon name={copied ? "check" : "copy"} size={14} />
              {copied ? "Link copied" : "Copy verification URL"}
            </button>
            {actions}
            <span className="x-certificate-seal__copied" role="status">
              {copied ? "Verification URL on clipboard." : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
