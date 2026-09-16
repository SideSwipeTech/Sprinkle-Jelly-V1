import type { ReactNode } from "react";
import { CertificateSeal } from "./CertificateSeal";

const CERT = {
  id: "python-foundations",
  title: "Foundations of Python",
  awarded: "16 Aug 2026",
  hash: "9f2c1a7b4d6e8f0a3b5c7d9e1f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b",
  issuer: "Wizly Labs Local Registry",
  valid: true,
  visibility: "public" as const
};

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "verifiable",
    label: "Verifiable seal",
    render: () => (
      <CertificateSeal
        certificate={CERT}
        recipient="Yash"
        verifyUrl="https://labs.example/certificates/python-foundations/verify"
        actions={<button type="button" className="x-btn x-btn--secondary">All certificates</button>}
      />
    )
  },
  {
    key: "hidden",
    label: "Hidden from public — non-disclosing",
    render: () => (
      <CertificateSeal
        certificate={{ ...CERT, visibility: "hidden" }}
        recipient="Yash"
        verifyUrl="https://labs.example/certificates/python-foundations/verify"
      />
    )
  },
  {
    key: "revoked",
    label: "Revoked record",
    render: () => (
      <CertificateSeal
        certificate={{ ...CERT, valid: false }}
        recipient="Yash"
        verifyUrl="https://labs.example/certificates/python-foundations/verify"
      />
    )
  },
  {
    key: "missing",
    label: "Record does not resolve",
    render: () => <CertificateSeal certificate={null} recipient="Yash" verifyUrl="#" />
  }
];
