/**
 * routes — the certificates studio's routes, flattened into the parent
 * registry under /admin (a fragment of <Route>s like AssessmentsRoutes).
 * The literal `certificates/parked` is listed before the `:certId`
 * parameter so the parked page can never be swallowed by an identifier.
 *
 *   certificates           → the staff work list — search, filter, paged
 *   certificates/parked    → the parked generations (retries spent)
 *   certificates/:certId   → one certificate — record, history, audit, acts
 */

import { Route } from "react-router-dom";
import { CertificatesIndex } from "./Certificates";
import { CertificateDetail } from "./CertificateDetail";
import { ParkedGenerations } from "./ParkedGenerations";

export function CredentialsRoutes() {
  return (
    <>
      <Route path="certificates" element={<CertificatesIndex />} />
      <Route path="certificates/parked" element={<ParkedGenerations />} />
      <Route path="certificates/:certId" element={<CertificateDetail />} />
    </>
  );
}
